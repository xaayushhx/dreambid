import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fallback to local storage if Cloudinary is not configured
let storage;
let isCloudinaryEnabled = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  isCloudinaryEnabled = true;
  
  // Use Cloudinary Storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: 'dreambid',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
    }
  });
} else {
  // Fallback to memory storage when Cloudinary is not configured
  storage = multer.memoryStorage();
  console.warn('⚠️  Cloudinary not configured. Images will be stored in memory (temporary).');
  console.warn('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable persistent image storage.');
}

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedPdfTypes = /pdf/;
  
  if (file.fieldname === 'images' || file.fieldname === 'image' || file.fieldname === 'cover_image' || file.fieldname === 'photo') {
    if (allowedImageTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  } else if (file.fieldname === 'pdf') {
    if (allowedPdfTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Middleware for multiple images
const uploadImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'cover_image', maxCount: 1 }
]);

// Middleware for single image
const uploadImage = upload.single('image');

// Middleware for PDF
const uploadPdf = upload.single('pdf');

// Helper function to get image URL from multer file
export const getFileUrl = (file) => {
  if (!file) return null;
  
  // If Cloudinary is enabled, the secure_url is set by CloudinaryStorage
  if (isCloudinaryEnabled && file.secure_url) {
    return file.secure_url;
  }
  
  // Fallback for memory storage - return null, indicating image is not persisted
  console.warn('Image stored in memory - not persisted. Configure Cloudinary for persistent storage.');
  return null;
};

export {
  upload,
  uploadImages,
  uploadImage,
  uploadPdf,
  cloudinary,
  isCloudinaryEnabled
};

