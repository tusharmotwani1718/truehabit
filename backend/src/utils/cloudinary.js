import { v2 as cloudinary } from "cloudinary";
import { promises as fsPromises } from "fs"; // use async fs API for safe cleanup
import dotenv from "dotenv";
import sharp from "sharp";
import envconf from "../conf/envconfig.js";

dotenv.config();

cloudinary.config({
    cloud_name: envconf.cloduinaryCloudName, // fixed typo
    api_key: envconf.cloudinaryApiKey,
    api_secret: envconf.cloudinaryApiSecret
});

// Function to upload files on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    let uploadedFile;
    const compressedFilePath = `compressed_${Date.now()}.webp`;

    try {
        if (!localFilePath) throw new Error("No file path provided");

        try {
            // Try compression first
            await sharp(localFilePath)
                .resize(500, 500, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(compressedFilePath);

            // Upload compressed file
            uploadedFile = await cloudinary.uploader.upload(compressedFilePath, {
                resource_type: "auto",
                folder: "truehabit",
            });
        } catch (compressError) {
            console.warn("Compression failed, uploading original file:", compressError.message);

            // Upload original file if compression failed
            uploadedFile = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: "truehabit",
            });
        }

        // Clean up both files (compressed and original)
        await cleanupFiles([localFilePath, compressedFilePath]);

        if (!uploadedFile?.url) throw new Error("Upload failed");

        return uploadedFile;
    } catch (error) {
        // Final fallback cleanup
        await cleanupFiles([localFilePath, compressedFilePath]);

        console.error("Cloudinary upload failed:", error.message);
        throw error;
    }
};

// Helper function to clean up files safely
const cleanupFiles = async (filePaths = []) => {
    for (const path of filePaths) {
        try {
            if (path && (await fsPromises.stat(path).catch(() => false))) {
                await fsPromises.unlink(path);
                // console.log(`Deleted file: ${path}`);
            }
        } catch (err) {
            console.warn(`Failed to delete file: ${path}`, err.message);
        }
    }
};

export default uploadOnCloudinary;
