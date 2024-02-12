import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({

    content:String,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }

}, { timestamps: true })

export const tweetModel = mongoose.model('tweet', tweetSchema)