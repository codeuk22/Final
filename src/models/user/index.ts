import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        index: true
    },
    fullName: {
        type: String,
        index: true
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'video'
        }
    ],

    email: String,
    avatar: String,
    coverImage: String,
    password: String,
    refreshToken: String

}, { timestamps: true })


// hashpassword before saving to database
userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password as string, Number(process.env.SALT as string))
    }

    next()
})

// check whether password is same as in database
userSchema.methods.isPasswordCorrect = async function (password: string) {

    return await bcrypt.compare(password, this.password)
}

// generate accessToken 
userSchema.methods.generateAccessToken = function () {

    return jwt.sign({

        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,

    },
    process.env.ACCESS_JWT_KEY as string,
    { expiresIn: process.env.ACCESS_JWT_EXPIRY })
}

// generate refreshToken
userSchema.methods.generateRefreshToken = async function () {

    return jwt.sign({ _id: this._id }, process.env.REFRESH_JWT_KEY as string, { expiresIn: process.env.REFRESH_JWT_EXPIRY })
}

export const userModel = mongoose.model('user', userSchema)