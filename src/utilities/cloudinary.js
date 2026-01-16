import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file uploaded successfully
        console.log("File uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove locally saved file as upload failed
        return null
    }
}

const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    // Assumes URL format: .../v<version>/<public_id>.<extension>
    // or .../<folder>/<public_id>.<extension>
    const filename = parts.pop();
    const publicIdWithExtension = filename.split('.')[0];
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/'); // To handle nested folders

    // If the public_id includes folders
    if (folderPath) {
        return `${folderPath}/${publicIdWithExtension}`;
    }
    return publicIdWithExtension;
};

//task:delete files from clodinary
const deleteFromCloudinary = async (url,resourceType) => {
    try {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) {
            console.warn("Could not extract public_id from URL for deletion:", url);
            return null;
        }
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType 
        });
        console.log("Cloudinary deletion result:", result);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error; // Re-throw to be caught by asyncHandler
    }
};

export {UploadOnCloudinary,deleteFromCloudinary}