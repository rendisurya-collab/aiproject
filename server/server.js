require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('./database/init');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const bannerRoutes = require('./routes/banners');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
getDatabase();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BridalNest API is running' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BridalNest API server running on port ${PORT}`);
});
