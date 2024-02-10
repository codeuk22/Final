import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: 'user'
    },
    subscribedTo: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribed
        ref: 'user'
    }
})

export const subscriptionModel = mongoose.model('subscription', subscriptionSchema)