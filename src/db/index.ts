import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export const connectDB = async()=>{
    
    try {

        const connection=await mongoose.connect(`${process.env.MONGO_URL as string}/${DB_NAME}`)

        console.log("Db connected",connection.connection.host)

    } catch (error) {
        console.log("No Db connected",error)
        process.exit(1)
    }
} 
    