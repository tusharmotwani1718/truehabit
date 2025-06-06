import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import envconf from "../conf/envconfig.js";

dotenv.config();

cloudinary.config({
    cloud_name: envconf.cloduinaryCloudName,
    api_key: envconf.cloudinaryApiKey,
    api_secret: envconf.cloudinaryApiSecret
});

// Function to delete files from Cloudinary:
const deleteFromCloudinary = async (public_id) => {
    try {
        // check if the asset exists
        const result = await cloudinary.api.resource(public_id);

        if(!result) return null;

        // delete the asset from cloudinary
       const deleteStatus = await cloudinary.uploader.destroy(public_id);       
       return deleteStatus

    } catch (error) {
        console.log("Error while deleting the asset from cloudinary : ", error);
        
    }

    
}

export default deleteFromCloudinary;