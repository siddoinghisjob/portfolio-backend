import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * @typedef {Object} CloudinaryUploadResult
 * @property {boolean} success - Whether the upload was successful
 * @property {string} [imageUrl] - The URL of the uploaded image (if successful)
 * @property {string} [publicId] - The public ID of the uploaded image (if successful)
 * @property {string} [error] - Error message (if unsuccessful)
 */

/**
 * Uploads an image to Cloudinary
 * @param {Buffer|string} imageData - The image data as Buffer or base64 string
 * @param {string} folder - The folder to upload to in Cloudinary
 * @param {string} publicId - Optional custom public ID for the image
 * @returns {Promise<CloudinaryUploadResult>} - Cloudinary upload response
 */
export async function uploadToCloudinary(imageData, folder = 'blog-images', publicId = null) {
  try {
    // Convert Buffer to base64 if needed
    const base64Data = imageData instanceof Buffer 
      ? `data:image/jpeg;base64,${imageData.toString('base64')}` 
      : imageData;
    
    const uploadOptions = {
      folder,
      resource_type: 'image',
      overwrite: true,
    };
    
    // Add public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);
    
    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Image upload failed'
    };
  }
}

export default uploadToCloudinary;