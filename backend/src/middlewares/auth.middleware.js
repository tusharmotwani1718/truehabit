// This middleware is used whenever we want to verify that user is logged in or not. verifyJWT verifies the access-token of the user
import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import  dotenv  from "dotenv";
import envconf from "../conf/envconfig.js";
dotenv.config();


export const verifyJWT = asyncHandler(async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log("Token: ", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request.")
        }

        const decodeToken = jwt.verify(token, envconf.accessTokenSecret);

        // this decodeToken now contains all the fields in an object which were used to generate the token.

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken"); // find with "_id" as the function to generate "access-token" uses "_id" of user object at user.model.js

        if (!user) {
            throw new ApiError(401, "Invalid Access Token.")
        }

        req.user = user;  // req.user contains the user object of logged in user whose token is verified.
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token.");
    }
})