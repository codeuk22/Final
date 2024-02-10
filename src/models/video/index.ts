import mongoose from "mongoose";
import mongooseAggegatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new mongoose.Schema({

    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },

    videoFile:String,
    thumbNail:String,
    title:String,
    description:String,
    duration:Number,

},{timestamps:true})

videoSchema.plugin(mongooseAggegatePaginate)

export const videoModel=mongoose.model("video",videoSchema)