import dotenv from 'dotenv';
dotenv.config();

const envconf = {
    mongoDbUri: String(process.env.MONGODB_URI),
    port: String(process.env.PORT),
    corsOrigin: String(process.env.CORS_ORIGIN),
    accessTokenSecret: String(process.env.ACCESS_TOKEN_SECRET),
    accessTokenExpiry: String(process.env.ACCESS_TOKEN_EXPIRY),
    refreshTokenSecret: String(process.env.REFRESH_TOKEN_SECRET),
    refreshTokenExpiry: String(process.env.REFRESH_TOKEN_EXPIRY),
    cloduinaryCloudName: String(process.env.CLOUDINARY_CLOUD_NAME),
    cloudinaryApiKey: String(process.env.CLOUDINARY_API_KEY),
    cloudinaryApiSecret: String(process.env.CLOUDINARY_API_SECRET),
    arcjetEnv: String(process.env.ARCJET_ENV),
    arcjetKey: String(process.env.ARCJET_KEY)
}

export default envconf;