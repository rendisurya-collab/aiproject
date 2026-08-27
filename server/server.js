require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDatabase, backupDbToCloud } = require('./database/init');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const bannerRoutes = require('./routes/banners');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin UI
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BridalNest API is running' });
});

// Manual database backup trigger
app.get('/api/backup-db', async (req, res) => {
  try {
    const result = await backupDbToCloud();
    res.json({ status: 'OK', message: 'Database backup triggered', result });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Check restore status
app.get('/api/db-status', async (req, res) => {
  const db = await getDatabase();
  const banners = db.exec('SELECT COUNT(*) FROM banners');
  const products = db.exec('SELECT COUNT(*) FROM products');
  const users = db.exec('SELECT COUNT(*) FROM users');
  const categories = db.exec('SELECT COUNT(*) FROM categories');
  res.json({
    banners: banners[0].values[0][0],
    products: products[0].values[0][0],
    users: users[0].values[0][0],
    categories: categories[0].values[0][0],
    cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME),
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
  });
});

// Test cloud backup URL
app.get('/api/test-restore', async (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const url = `https://res.cloudinary.com/${cloudName}/raw/upload/bridalnest/backup/database`;
  try {
    const response = await fetch(url);
    res.json({
      url,
      status: response.status,
      contentType: response.headers.get('content-type'),
      size: response.headers.get('content-length'),
      ok: response.ok,
    });
  } catch (err) {
    res.json({ url, error: err.message });
  }
});

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/admin')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file terlalu besar' });
  }
  if (err.message && err.message.includes('file gambar')) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// Initialize database then start server
getDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BridalNest API server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  // Start server anyway with fresh DB
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BridalNest API server running on port ${PORT} (fresh DB)`);
  });
});
