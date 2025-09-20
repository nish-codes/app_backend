import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if (!localFilePath) {
            throw new Error('No file path provided');
        }

        // Upload options for profile photos
        const uploadOptions = {
            resource_type: "auto",
            folder: "profile_photos",
            quality: "auto:good",
            fetch_format: "auto",
            ...options
        };

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

        console.log('Profile photo uploaded successfully');

        // Clean up temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return {
            success: true,
            url: response.secure_url,
            public_id: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
            bytes: response.bytes
        };

    } catch (error) {
        console.error("Upload failed:", error.message);

        // Clean up file if upload failed
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return {
            success: false,
            error: error.message
        };
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error('No image ID provided');
        }

        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted successfully');

        return {
            success: true,
            result: result.result
        };
    } catch (error) {
        console.error("Delete failed:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };