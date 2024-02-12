import { Request, Response } from "express"
import mongoose from "mongoose"
import jwt, { JwtPayload } from "jsonwebtoken"
import { userModel } from "../../models/user/index"
import { ApiError } from "../../utils/apiError/index"
import { uploadOnCloudinary } from "../../utils/cloudinary"
import { ApiResponse } from "../../utils/apiResponse"


const generateAccessAndRefreshToken = async (userId: any) => {
    try {

        const user = await userModel.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save()

        return { accessToken, refreshToken }

    } catch (error: any) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token", error)
    }

}
export const registerUser = async (req: Request, res: Response) => {

    try {
        const findUser = await userModel.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] })

        if (findUser) return res.status(401).send(new ApiError(409, "User Already Exists with this Credentials"))

        const avatarLocalPath = (req.files as { avatar?: Express.Multer.File[] }).avatar?.[0]?.path;

        let coverImageLocalPath = (req.files as { coverImage?: Express.Multer.File[] }).coverImage?.[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is missing")
        }

        if (!coverImageLocalPath) coverImageLocalPath = ""

        const waitToUploadAvatar = await uploadOnCloudinary(avatarLocalPath)

        const waitToUploadcoverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!waitToUploadAvatar) {
            throw new ApiError(400, "Unable to upload avatar image on cloudinary")
        }

        const registerUser = await new userModel({
            ...req.body, avatar: waitToUploadAvatar.url, coverImage: waitToUploadcoverImage?.url || ""
        })

        const savedUser = await registerUser.save()

        if (savedUser) {
            res.status(201).send(new ApiResponse(201, savedUser, "User Registered Successfully"))
        }

    } catch (error: any) {
        res.status(400).send(new ApiError(400, "Unable to register User", error?.message))
    }
}

export const userLogin = async (req: any, res: Response) => {

    const findUser = await userModel.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })

    if (!findUser) return res.status(400).send(new ApiError(400, "User not found with this username or email"))

    const validPassword = await findUser.isPasswordCorrect(req.body.password)

    if (!validPassword) return res.status(401).send(new ApiError(401, "Invalid Credentials"))

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(findUser._id)

    const updatedUser = await userModel.findByIdAndUpdate(findUser._id, { $set: { refreshToken } }, { new: true }).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).send(
        new ApiResponse(200, { user: updatedUser }, "User LoggedIn Successfully")
    )
}

export const logoutUser = async (req: any, res: Response) => {

    const userId = req.user._id

    const user = await userModel.findByIdAndUpdate(userId, { $set: { refreshToken: "" } }, { new: true })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User LoggedOut Successfully"))
}

export const refreshAccessToken = async (req: any, res: Response) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) return res.status(401).send(new ApiError(401, "Unauthorized User"))

    try {

        const verifyToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_JWT_KEY as string)

        const findUser = await userModel.findById((verifyToken as JwtPayload)?._id)

        if (!findUser) return res.status(401).send(new ApiError(401, "Invalid Token"))

        if (incomingRefreshToken !== findUser?.refreshToken) return res.status(401).send(new ApiError(401, "Refresh Token is expired or Invalid"))

        const options = {
            httpOnly: true,
            secure: true
        }

        const newTokenGenerated = await generateAccessAndRefreshToken(findUser._id)

        return res.status(200).cookie("accessToken", newTokenGenerated.accessToken, options).cookie("refreshToken", newTokenGenerated.refreshToken, options).send(new ApiResponse(200, {}, "Access Token Refreshed Successfully"))

    } catch (error: any) {
        res.status(400).send(new ApiError(400, "Unable to Generate refresh Access Token", error?.message))
    }


}

export const changeCurrentPassword = async (req: any, res: Response) => {

    const { oldPassword, newPassword } = req.body

    const findUser = await userModel.findById(req.user._id)

    const isPasswordCorrect = await findUser.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) return res.status(400).send(new ApiError(400, "Old Password is incorrect"))

    findUser.password = newPassword

    await findUser.save()

    res.status(200).send(new ApiResponse(200, {}, "Password Changed Successfully"))

}

export const getCurrentUser = async (req: any, res: Response) => {

    const findUser = await userModel.findById(req.user._id).select("-password -refreshToken")

    res.status(200).send(new ApiResponse(200, { user: findUser }, "User Details Fetched Successfully"))
}

export const updateAccountDetails = async (req: any, res: Response) => {

    const { username, email } = req.body

    const updatedUser = await userModel.findByIdAndUpdate({ _id: req.user._id }, { $set: { username, email } }, { new: true }).select("-password -refreshToken")

    res.status(201).send(new ApiResponse(201, { user: updatedUser }, "Account Details Updated Successfully"))


}

export const updateProfilePicture = async (req: any, res: Response) => {

    const avatarLocalPath = (req.file as { avatar?: Express.Multer.File[] }).avatar?.[0]?.path

    if (!avatarLocalPath) return res.status(400).send(new ApiError(400, "Avatar is missing"))

    await userModel.findByIdAndUpdate({ _id: req.user._id }, { $unset: { avatar: 1 } })

    const waitToUploadAvatar = await uploadOnCloudinary(avatarLocalPath)

    if (!waitToUploadAvatar) return res.status(400).send(new ApiError(400, "Unable to upload avatar image on cloudinary"))

    const updatedUser = await userModel.findByIdAndUpdate({ _id: req.user._id }, { $set: { avatar: waitToUploadAvatar.url } }, { new: true }).select("-password -refreshToken")

    res.status(201).send(new ApiResponse(201, { user: updatedUser }, "Profile Picture Updated Successfully"))

}

export const updateCoverImage = async (req: any, res: Response) => {

    const coverImageLocalPath = (req.file as { coverImage?: Express.Multer.File[] }).coverImage?.[0]?.path

    if (!coverImageLocalPath) return res.status(400).send(new ApiError(400, "Cover Image is missing"))

    await userModel.findByIdAndUpdate({ _id: req.user._id }, { $unset: { coverImage: 1 } })

    const waitToUploadCoverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!waitToUploadCoverImage) return res.status(400).send(new ApiError(400, "Unable to upload cover image on cloudinary"))

    const updatedUser = await userModel.findByIdAndUpdate({ _id: req.user._id }, { $set: { coverImage: waitToUploadCoverImage.url } }, { new: true }).select("-password -refreshToken")

    res.status(201).send(new ApiResponse(201, { user: updatedUser }, "Cover Image Updated Successfully"))

}

export const getUSerChannelProfile = async (req: any, res: Response) => {

    const { username } = req.params

    if (!username) return res.status(400).send(new ApiError(400, "Username is missing"))

    const channel = await userModel.aggregate([

        {

            $match: { username: username }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscibersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $eq: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                isSubscribed: 1,
                subscibersCount: 1,
                channelsSubscribedToCount: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel) return res.status(404).send(new ApiError(404, "Channel not found"))

    return res.status(200).send(new ApiResponse(200, channel[0], "Channel Details Fetched Successfully"))
}

export const getUserWatchHistory = async (req: any, res: Response) => {

    const user = await userModel.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId.createFromTime(req.user?._id)
            },
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $arrayElemAt: ["$owner", 0]
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).send(new ApiResponse(200, user[0].watchHistory, "Watch History Fetched Successfully"))
}










