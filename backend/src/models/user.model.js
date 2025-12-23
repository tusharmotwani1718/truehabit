import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import envconf from "../conf/envconfig.js";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    profileImage: {
        type: String, // cloudinary url
        // default: ""  
    },
    profileImagePublicId: {
        type: String,
        // default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    habitCollection: [
        {
            type: Schema.Types.ObjectId,
            ref: "Habit"
        }
    ],
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group"
      }  
    ],
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.plugin(mongooseAggregatePaginate);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        envconf.accessTokenSecret,
        {
            expiresIn: envconf.accessTokenExpiry
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        envconf.refreshTokenSecret,
        {
            expiresIn: envconf.refreshTokenExpiry
        }
    )
}


// for sending mails:
userSchema.methods.generateEmailToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        envconf.jwtEmailSecret,
        {
            expiresIn: envconf.emailSecretExpiry
        }
    )
}

export const User = mongoose.model("User", userSchema);