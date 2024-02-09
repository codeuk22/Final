import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });
          
cloudinary.config({ 
  cloud_name: 'dznamxkai', 
  api_key: '668155282817796', 
  api_secret: 'cAvxhgOM4ex73XfPALaZKH6diY4' 
});

export const uploadOnCloudinary = async (filePath: any) => {

    try {

        if (!filePath) return null

        //upload the file on cloudinary
        const response=await cloudinary.uploader.upload(filePath,{resource_type: "auto"})

        //file has been uploaded successfully and now delete file from local server

        fs.unlinkSync(filePath)
        return response

    } catch (error) {

        // remove local saved temporary file as upload failed
        fs.unlinkSync(filePath)
        return null
    }

}

