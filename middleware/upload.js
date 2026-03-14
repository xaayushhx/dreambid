import multer from 'multer';
import path from 'path';
import fs from 'fs';

// For Netlify Functions, use temp directory
const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';

// Ensure uploads directory exists (Netlify provides /tmp)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Warning: Could not create upload directory:', error.message);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';
    
    if (file.fieldname === 'images' || file.fieldname === 'cover_image') {
      folder = 'images';
    } else if (file.fieldname === 'pdf') {
      folder = 'pdfs';
    }
    
    const dir = path.join(uploadDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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

export {
  upload,
  uploadImages,
  uploadImage,
  uploadPdf
};

