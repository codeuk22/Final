import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: 'user'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // one who is 'subscriber' is subscribing
        ref: 'user'
    }
}, { timestamps: true })

export const subscriptionModel = mongoose.model('subscription', subscriptionSchema)