import { asyncHandler } from '../utils/asyncHandler.js';
import { body, validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js';
import deleteFromCloudinary from '../utils/deleteCloudinary.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { Habit } from '../models/habit.model.js';
import arcjetService from '../utils/arcjet.js'
import extractClientIp from '../middlewares/clientIP.middleware.js';
import sendTestEmail from '../utils/nodemailer.js';



dotenv.config()


// Define validation as an array, we will export it and use at user router:
const validateCreateUser = [
    body('fullName', 'Enter a valid name').exists().isLength({ min: 3 }).notEmpty(),
    body('email').isEmail().exists().notEmpty(),
    body('password', 'Please enter a Strong Password.').exists().isStrongPassword().notEmpty(),
    body('username').exists().isLength({ min: 5 })
];

// Method to generate access and refresh Tokens:
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); // Fetch the user by ID
        const accessToken = user.generateAccessToken(); // Generate access token
        const refreshToken = user.generateRefreshToken(); // Generate refresh token

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }; // Return tokens
    } catch (error) {
        throw new ApiError(401, "Something went wrong while generating access and refresh tokens.");
    }
};

const generateEmailToken = async (userId) => {
    try {
        const user = await User.findById(userId); // Fetch the user by ID
        const emailToken = user.generateEmailToken(); // Generate email token
        return emailToken; // Return email token
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Something went wrong while generating email token.");
    }
};

// ROUTES WITHOUT LOGIN REQUIREMENT:
// 1. creating a new user:
const registerUser = asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors)
    }



    const { fullName, email, username, password } = req.body

    // arcjet validation:
    const decision = await arcjetService.protectSignup({ interval: "5m" }).protect(req, { email })
    // console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
        if (decision.reason.isEmail()) {
            throw new ApiError(
                400,
                "Invalid or Disposable emails not allowed."
            )
        } else {
            throw new ApiError(
                400,
                "Too many requests. Please try after some time..."
            )
        }
    }

    // Check user existence (already handled by Multer's fileFilter)
    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (userExists) {
        throw new ApiError(400, "User with this username or email already exists.");
    }

    // upload profile image only when it is sent to the request:
    let profileImage;
    const profileImageLocalPath = req.files && req.files.profileImage ? req.files.profileImage[0]?.path : null;
    if (profileImageLocalPath) {
        profileImage = await uploadOnCloudinary(profileImageLocalPath);
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        profileImage: profileImage && profileImage.url,
        password,
        profileImagePublicId: profileImage && profileImage.public_id
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(400, "An error occurred while creating the user account")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Account created successfully")
    )


})

// 2. logging in a user:
const login = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required.")

    }



    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "Invalid credentials.")
    }


    // using "isPasswordCorrect" method defined in user.model.js
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password.")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options, {
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'
        })
        .cookie('refreshToken', refreshToken, options, {
            maxAge: 10 * 24 * 60 * 60 * 1000,
            sameSite: 'none'
        })
        .json(
            new ApiResponse(
                201,
                {
                    user: loggedinUser, accessToken, refreshToken
                },
                "Logged in successfully")
        )


})

// 3. get user details:
const getUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "User not found.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User details fetched successfully."
        )
    )
})

// ROUTES WITH LOGIN REQUIREMENT:
// 1. Logout the user:
const logout = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                201,
                {},
                "User logged out successfully."
            )
        )


})

// 2. Reset Access Token:
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(400, "Invalid Token")
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )


        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(400, "Invalid Token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        let newRefreshToken = refreshToken;



        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token Refreshed"

                )
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Refresh Token")
    }

})

// 3. Update Account Details:
const updateAccount = asyncHandler(async (req, res) => {

    const { newName, newUsername } = req.body;
    if (!newName && !newUsername) {
        throw new ApiError(400, "No fields to update")
    }

    const user = await User.findById(req.user?._id).select('-password -refreshToken');
    if (newName) user.fullName = newName;
    if (newUsername) user.username = newUsername;

    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(
                201,
                user,
                "Details Updated Successfully"
            )
        )



})

// 4. Change Current Password:
const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword) {
        throw new ApiError(400, "Old Password is required.");
    }

    const user = await User.findById(req.user?._id);

    const comparePassword = await user.isPasswordCorrect(oldPassword);

    if (!comparePassword) {
        throw new ApiError(400, "Invalid Old Password.")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has been updated successfully."))

})

// 5. Update Profile Image:
const updateProfileImage = asyncHandler(async (req, res) => {

    const newProfileImageLocalPath = await req.file?.path; // note that req.file is used instead of req.files


    if (!newProfileImageLocalPath || newProfileImageLocalPath === "") {
        throw new ApiError(400, "Invalid file path");
    }

    const newProfileImage = await uploadOnCloudinary(newProfileImageLocalPath);

    if (!newProfileImage.url) {
        throw new ApiError(400, "Error while updating the avatar.");
    }

    // delete old profileImage from cloudinary (only if it exists):
    if (req.user.profileImagePublicId) {
        const deleteProfileImage = await deleteFromCloudinary(req.user?.profileImagePublicId);

        if (deleteProfileImage.result !== 'ok') {
            throw new ApiError(400, "Error updating the image.");
        }

    }



    // update the image url and public id:
    const user = await User.findByIdAndUpdate(req.user?._id,
        {

            // $set is used because it only updates the specified fields.
            $set: {
                profileImage: newProfileImage.url,
                profileImagePublicId: newProfileImage?.public_id
            }

        },
        {
            new: true  // Returns the updated document
        }
    ).select("-password -refreshToken")

    res
        .status(200)
        .json(
            new ApiResponse(201, user, "Image updated sucessfully")
        )


})

// 6. Delete Profile Image:
const deleteProfileImage = asyncHandler(async (req, res) => {

    if (!req?.user.profileImagePublicId) {
        throw new ApiError(400, "No Image to delete.");
    }

    // delete old profileImage from cloudinary
    const deleteProfileImage = req.user?.profileImagePublicId && await deleteFromCloudinary(req.user?.profileImagePublicId);
    if (deleteProfileImage.result !== 'ok') {
        throw new ApiError(400, "Error deleting the image.");
    }

    // set profileImage and public id as null:
    const user = await User.findByIdAndUpdate(req.user?._id,
        {

            // $set is used because it only updates the specified fields.
            $unset: {
                profileImage: '',
                profileImagePublicId: ''
            }

        },
        {
            new: true  // Returns the updated document
        }
    ).select("-password -refreshToken")

    res
        .status(200)
        .json(
            new ApiResponse(201, user, "Image deleted successfully")
        )

})

// 7. Delete User Account:
const deleteAccount = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(400, "User not found.")
    }

    // Delete profile image from Cloudinary (if exists)
    if (user.profileImagePublicId) {
        const deleteProfileImage = await deleteFromCloudinary(user.profileImagePublicId);
        if (deleteProfileImage?.result !== "ok") {
            throw new ApiError(500, "Error deleting profile image from Cloudinary.");
        }
    }

    // delete the habits of user (if any):
    if (user.habitCollection.length != 0) {
        // delete all the user habits:
        const deleteHabits = await Habit.deleteMany({ _id: { $in: user.habitCollection } });
        if (!deleteHabits) {
            throw new ApiError(400, "Error while deleting the user habits.");
        }
    }


    // delete the user:
    const deletedUser = await user.deleteOne();
    if (!deletedUser) {
        throw new ApiError(400, "Error while deleting the user.");
    }

    res
        .status(200)
        .json(
            new ApiResponse(201, [], "Account deleted successfully")
        );



})

// 8. Send Email Verification Link:
const sendEmailVerification = asyncHandler(async (req, res) => {

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User not found.")
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found.")
    }

    const email = user.email;
    if (!email) {
        throw new ApiError(400, "Email not found.")
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified.")
    }

    const emailToken = await generateEmailToken(userId);

    if (!emailToken) {
        throw new ApiError(400, "Error while generating email token.")
    }

    const emailVerificationLink = `http://localhost:5173/verify-email?token=${emailToken}`;

    const content = `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${emailVerificationLink}">${emailVerificationLink}</a>
    `

    const mail = await sendTestEmail(content, email);
    // console.log(mail);
    if (!mail) {
        throw new ApiError(400, "Error while sending email.");
    }

    res
        .status(200)
        .json(
            new ApiResponse(201, mail, "Email sent successfully")
        );


})


// 9. Verify the email:
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Token not found.")
    }

    console.log("Token: ", token)

    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(400, "Token Invalid or Expired.")
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(201, user, "Email verified successfully")
        );


})

export {
    registerUser, validateCreateUser,
    login,
    getUser,
    logout,
    refreshAccessToken,
    updateAccount,
    changePassword,
    updateProfileImage,
    deleteProfileImage,
    deleteAccount,
    sendEmailVerification,
    verifyEmail
}