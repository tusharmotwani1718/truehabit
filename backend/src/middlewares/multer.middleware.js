import multer from "multer";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp") // files are stored temporarily after uploading on multer and then removed after uploading on cloudinary from multer.
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file naming
    },
})


// Custom file filter to validate request before file handling
const fileFilter = async (req, file, cb) => {
    try {
        // Simulate validation: Check if the user already exists
        const { username, email } = req.body;
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            // Reject the file and prevent uploading
            throw new ApiError(400, "User with this email or usrname already exists")
        } else {
            // Accept the file
            cb(null, true);
        }
    } catch (error) {
        cb(error); // Handle unexpected errors
    }
};


export const uploadMedia = multer({
    storage,
    fileFilter, // Apply custom file filter
    limits: { fileSize: 1024 * 1024 * 5, files: 1 }, // 5MB file size limit
})