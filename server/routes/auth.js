const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, saveDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { getImageUrl } = require('../middleware/upload');

const router = express.Router();

// POST /api/auth/register - Register user biasa
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const db = await getDatabase();

    // Check if email already exists
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user with role 'user'
    db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'user']
    );

    const result = db.exec('SELECT last_insert_rowid() as id');
    const userId = result[0].values[0][0];

    saveDatabase();

    const token = jwt.sign(
      { id: userId, email, name, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: userId,
        name,
        email,
        phone: phone || null,
        avatar: null,
        role: 'user',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/auth/register-admin - Register admin
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password, phone, adminCode } = req.body;

    // Admin code untuk keamanan agar tidak sembarang orang bisa register admin
    const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'RIANRIAS2026';

    if (!adminCode || adminCode !== ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Kode admin tidak valid' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const db = await getDatabase();

    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'admin']
    );

    const result = db.exec('SELECT last_insert_rowid() as id');
    const userId = result[0].values[0][0];

    saveDatabase();

    const token = jwt.sign(
      { id: userId, email, name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registrasi admin berhasil',
      token,
      user: {
        id: userId,
        name,
        email,
        phone: phone || null,
        avatar: null,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Register admin error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const db = await getDatabase();

    const result = db.exec(
      'SELECT id, name, email, password, phone, avatar, role FROM users WHERE email = ?',
      [email]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(
      'SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const db = await getDatabase();

    db.run(
      'UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || req.user.name, phone || null, req.user.id]
    );

    saveDatabase();

    const result = db.exec(
      'SELECT id, name, email, phone, avatar, role FROM users WHERE id = ?',
      [req.user.id]
    );

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    res.json({ message: 'Profil berhasil diperbarui', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/auth/avatar
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File gambar wajib diunggah' });
    }

    const avatarPath = getImageUrl(req.file) || `/uploads/avatars/${req.file.filename}`;
    const db = await getDatabase();

    // Update user avatar
    db.run(
      'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatarPath, req.user.id]
    );

    // Save to user_images table
    db.run(
      'INSERT INTO user_images (user_id, image_path, image_type) VALUES (?, ?, ?)',
      [req.user.id, avatarPath, 'avatar']
    );

    saveDatabase();

    res.json({
      message: 'Avatar berhasil diunggah',
      avatar: avatarPath,
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
