import multer from 'multer';
import { configureCloudinary, cloudinary } from '../config/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, etc.) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Cloudinary upload helper function
export const uploadToCloudinary = (fileBuffer, folder = 'society_complaints') => {
  return new Promise((resolve, reject) => {
    const isConfigured = configureCloudinary();
    if (!isConfigured) {
      return reject(new Error('Cloudinary photo upload failed: Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};
