const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let uploadAvatar, uploadProduct;

if (useCloudinary) {
  // Use Cloudinary storage
  const { uploadProductCloud, uploadAvatarCloud } = require('./cloudinary');
  uploadAvatar = uploadAvatarCloud;
  uploadProduct = uploadProductCloud;
  console.log('Using Cloudinary for image storage');
} else {
  // Fallback: local file storage
  console.log('Using local file storage (Cloudinary not configured)');

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');
  const productsDir = path.join(uploadsDir, 'products');

  [uploadsDir, avatarsDir, productsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const productStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, productsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan'), false);
  };

  uploadAvatar = multer({ storage: avatarStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  uploadProduct = multer({ storage: productStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
}

// Helper: get image URL from uploaded file (works for both Cloudinary and local)
function getImageUrl(file) {
  if (!file) return null;
  // Cloudinary returns 'path' as full URL
  if (file.path && file.path.startsWith('http')) return file.path;
  // Local storage
  if (file.filename) return `/uploads/${file.destination.includes('avatars') ? 'avatars' : 'products'}/${file.filename}`;
  return null;
}

module.exports = { uploadAvatar, uploadProduct, useCloudinary, getImageUrl };
