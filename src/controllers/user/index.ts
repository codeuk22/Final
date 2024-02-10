import { Request, Response } from "express"
import { userModel } from "../../models/user/index"
import { ApiError } from "../../utils/apiError/index"
import { uploadOnCloudinary } from "../../utils/cloudinary"
import { ApiResponse } from "../../utils/apiResponse"
import jwt, { JwtPayload } from "jsonwebtoken"


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
        res.status(400).send(new ApiError(400, "Unable to register User"))
    }
}

export const userLogin = async (req: any, res: Response) => {

    const findUser = await userModel.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })

    if (!findUser) return res.status(400).send(new ApiError(404, "User not found with this username or email"))

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

export const refreshAccessToken=async(req:any,res:Response)=>{
    
    const incomingRefreshToken=req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) return res.status(401).send(new ApiError(401,"Unauthorized User"))

    try {
        
        const verifyToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_JWT_KEY as string)
    
        const findUser=await userModel.findById((verifyToken as JwtPayload)?._id)
    
        if(!findUser) return res.status(401).send(new ApiError(401,"Invalid Token"))
    
        if(incomingRefreshToken!==findUser?.refreshToken) return res.status(401).send(new ApiError(401,"Refresh Token is expired or Invalid"))
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const newTokenGenerated=await generateAccessAndRefreshToken(findUser._id)
    
        return res.status(200).cookie("accessToken",newTokenGenerated.accessToken,options).cookie("refreshToken",newTokenGenerated.refreshToken,options).send(new ApiResponse(200,{},"Access Token Refreshed Successfully"))

    } catch (error:any) {
        res.status(400).send(new ApiError(400,"Unable to Generate refresh Access Token",error?.message))
    }


}

