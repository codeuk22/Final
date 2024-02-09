import dotenv from 'dotenv';
import { connectDB } from './db';
import { app } from './app';


dotenv.config();

connectDB().then(() => {

    app.on("error", (error) => {
        console.log("error in listen", error)
        throw error
    })
    app.listen(process.env.PORT, () => {
        console.log(`Server is live at ${process.env.PORT}`)
    })
    
}).catch((error) => {
    console.log("DB Connection error", error)
})

