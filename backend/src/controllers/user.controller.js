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
import sendTestEmail from '../utils/nodemailer.js';
import isEmail from 'isemail';
import { isDisposableEmail } from 'disposable-email-domains-js';



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

// Helper function to extract client IP address (used in arcjet)
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress;
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
    const clientIp = getClientIp(req);
    const decision = await arcjetService.protectSignup({ interval: "5m" }).protect(req, { email, ip: clientIp })
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

    // valid mail verification:
    if (!isEmail.validate(email)) {
        throw new ApiError(400, "Invalid email format.");
    }
    if (await isDisposableEmail(email)) {
        throw new ApiError(400, "Disposable email addresses are not allowed.");
    }

    // Check user existence (already handled by Multer's fileFilter)
    const mailExists = await User.findOne({ email });
    if (mailExists) {
        throw new ApiError(400, "User with this email already exists.")
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        throw new ApiError(400, "This username is already taken.")
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
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
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required.")
    }

    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit({
        refillRate: 10,
        interval: "5m",
        capacity: 10
    }).protect(req, { userId: clientIp, ip: clientIp, requested: 1 }); // Deduct 1 token from the bucket

    if (decision.isDenied()) {
        throw new ApiError(
            400,
            "Too Many Requests...Please try again after some time"
        )
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "Invalid credentials.")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 10 * 24 * 60 * 60 * 1000,
        path: '/'
    });

    return res
        .status(200)
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
    if (!newName || !newUsername) {
        throw new ApiError(400, "No fields to update")
    }

    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit({
        refillRate: 10,
        interval: "5m",
        capacity: 10
    }).protect(req, { userId: req.user?._id, ip: clientIp, requested: 1 });

    if (decision.isDenied()) {
        throw new ApiError(
            400,
            "Too Many Requests...Please try again after some time"
        )
    }

    const userNameExists = await User.findOne({ username: newUsername });
    if (userNameExists) {
        throw new ApiError(400, "Username already taken.")
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

    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit().protect(req, { userId: req.user?._id, ip: clientIp, requested: 1 });
    if (decision.isDenied()) {
        throw new ApiError(400, "Too many requests. Please try again later.");
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
    const newProfileImageLocalPath = await req.file?.path;

    if (!newProfileImageLocalPath || newProfileImageLocalPath === "") {
        throw new ApiError(400, "Invalid file path");
    }

    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit().protect(req, { userId: req.user?._id, ip: clientIp });
    if (decision.isDenied()) {
        throw new ApiError(400, "Too many requests. Please try after some time.");
    }

    const newProfileImage = await uploadOnCloudinary(newProfileImageLocalPath);

    if (!newProfileImage.url) {
        throw new ApiError(400, "Error while updating the avatar.");
    }

    if (req.user.profileImagePublicId) {
        const deleteProfileImage = await deleteFromCloudinary(req.user?.profileImagePublicId);
        if (deleteProfileImage.result !== 'ok') {
            throw new ApiError(400, "Error updating the image.");
        }
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                profileImage: newProfileImage.url,
                profileImagePublicId: newProfileImage?.public_id
            }
        },
        {
            new: true
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

    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit().protect(req, { userId: req.user?._id, ip: clientIp });
    if (decision.isDenied()) {
        throw new ApiError(400, "Too many requests. Please try again later.");
    }

    const deleteProfileImage = req.user?.profileImagePublicId && await deleteFromCloudinary(req.user?.profileImagePublicId);
    if (deleteProfileImage.result !== 'ok') {
        throw new ApiError(400, "Error deleting the image.");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $unset: {
                profileImage: '',
                profileImagePublicId: ''
            }
        },
        {
            new: true
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
    // arcjet validation:
    const clientIp = getClientIp(req);
    const decision = await arcjetService.rateLimit().protect(req, { userId: req.user?._id, ip: clientIp });
    if (decision.isDenied()) {
        throw new ApiError(400, "Too many requests. Please try again later.");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(400, "User not found.")
    }

    if (user.profileImagePublicId) {
        const deleteProfileImage = await deleteFromCloudinary(user.profileImagePublicId);
        if (deleteProfileImage?.result !== "ok") {
            throw new ApiError(500, "Error deleting profile image from Cloudinary.");
        }
    }

    if (user.habitCollection.length != 0) {
        const deleteHabits = await Habit.deleteMany({ _id: { $in: user.habitCollection } });
        if (!deleteHabits) {
            throw new ApiError(400, "Error while deleting the user habits.");
        }
    }

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

    const ip = getClientIp(req);

    // arcjet validation:
    const decision = await arcjetService.rateLimit().protect(req, { userId, email: req.user?.email, ip, requested: 1 }) // Deduct 1 token from the bucket
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

    const emailVerificationLink = `https://truehabit.in/verify-email?token=${emailToken}`;

    const content = `
        <!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #2c3e50; text-align: center; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #3498db; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 4px; 
            font-weight: bold; 
            margin: 20px 0; 
        }
        .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #7f8c8d; 
            text-align: center; 
        }
        .container { 
            border: 1px solid #ecf0f1; 
            padding: 30px; 
            border-radius: 8px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Welcome to trueHabit!</h1>
        
        <p>Thank you for registering with us. To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
            <a href="${emailVerificationLink}" class="button">Verify Email Address</a>
        </div>
        
        <p>This link will expire in 24 hours. If you didn't request this verification, please ignore this email or contact our support team.</p>

        <p>Need help? <a href="mailto:tusharmotwani@truehabit.in">Contact our support team</a> and we'll be happy to assist you.</p>

        <div class="footer">
            <p>© 2025 trueHabit. All rights reserved.</p>
            <p>
                <a href="https://truehabit.in">Website</a> | 
                <a href="https://www.linkedin.com/in/tushar-motwani-92a080370">Linkedin</a> 
            </p>
        </div>
    </div>
</body>
</html>
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

    // arcjet validation:
    const decision = await arcjetService.rateLimit().protect(req, { token })
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

    // console.log("Token: ", token)

    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    // console.log(decoded);
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

// 10: check session:
const checkSession = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
        return res.status(200).json({ isAuthenticated: false, user: null });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken");

        if (!user) {
            return res.status(200).json({ isAuthenticated: false, user: null });
        }

        return res.status(200).json({
            isAuthenticated: true,
            user,
        });
    } catch (err) {
        console.log("Session check error", err);
        return res.status(200).json({ isAuthenticated: false, user: null });
    }
});


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
    verifyEmail,
    checkSession
}