import { v2 as cloudinary } from "cloudinary";
import fs from 'fs' // file system to handle files
import dotenv from 'dotenv';
import sharp from "sharp";
import envconf from "../conf/envconfig.js";

dotenv.config();

cloudinary.config({
    cloud_name: envconf.cloduinaryCloudName,
    api_key: envconf.cloudinaryApiKey,
    api_secret: envconf.cloudinaryApiSecret
});

// Function to upload files on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");

        let uploadedFile;
        const compressedFilePath = `compressed_${Date.now()}.webp`;

        try {
            // Try compression first
            await sharp(localFilePath)
                .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(compressedFilePath);

            uploadedFile = await cloudinary.uploader.upload(compressedFilePath, {
                resource_type: "auto",
                folder: "truehabit"
            });
        } catch (compressError) {
            // console.log("Compression failed, uploading original");
            uploadedFile = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: "truehabit"
            });
        }

        // Clean up files
        [localFilePath, compressedFilePath].forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });

        if (!uploadedFile?.url) throw new Error("Upload failed");
        return uploadedFile;

    } catch (error) {
        // Clean up any remaining files
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (compressedFilePath && fs.existsSync(compressedFilePath)) fs.unlinkSync(compressedFilePath);
        throw error;
    }
};


export default uploadOnCloudinary; 