import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({

    name: String,
    description: String,
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }

}, { timestamps: true })


export const playlistModel = mongoose.model('playlist', playlistSchema)