const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { uploadProduct, getImageUrl } = require('../middleware/upload');
const { getDatabase, saveDatabase } = require('../database/init');

const router = express.Router();

function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// GET /api/settings/about - Public, get about page settings
router.get('/about', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec("SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'about_%'");
    const rows = resultToObjects(result);
    const settings = {};
    rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ settings });
  } catch (err) {
    console.error('Get about settings error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/settings/contact - Public, get contact & social media settings
router.get('/contact', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec("SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'contact_%' OR setting_key LIKE 'social_%'");
    const rows = resultToObjects(result);
    const settings = {};
    rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ settings });
  } catch (err) {
    console.error('Get contact settings error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/settings/all - Admin, get all settings
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM site_settings ORDER BY setting_key');
    res.json({ settings: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/settings - Admin, update multiple settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Data settings tidak valid' });
    }

    const db = await getDatabase();

    Object.entries(settings).forEach(([key, value]) => {
      const existing = db.exec('SELECT id FROM site_settings WHERE setting_key = ?', [key]);
      if (existing.length > 0 && existing[0].values.length > 0) {
        db.run('UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [value || '', key]);
      } else {
        db.run('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, value || '']);
      }
    });

    saveDatabase();
    res.json({ message: 'Settings berhasil disimpan' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/settings/about-image - Admin, upload about page image
router.post('/about-image', authenticateToken, uploadProduct.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File gambar wajib diunggah' });

    const imagePath = getImageUrl(req.file) || `/uploads/products/${req.file.filename}`;
    const db = await getDatabase();

    const existing = db.exec("SELECT id FROM site_settings WHERE setting_key = 'about_image'");
    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run("UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'about_image'", [imagePath]);
    } else {
      db.run("INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image', ?)", [imagePath]);
    }

    saveDatabase();
    res.json({ message: 'Gambar berhasil diunggah', image: imagePath });
  } catch (err) {
    console.error('About image upload error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
