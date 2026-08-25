const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');
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

// GET /api/banners - Public, list active banners
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json({ banners: resultToObjects(result) });
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/banners/all - Admin, list all banners
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM banners ORDER BY sort_order ASC');
    res.json({ banners: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/banners - Create banner with image
router.post('/', authenticateToken, uploadProduct.single('image'), async (req, res) => {
  try {
    const { title, subtitle, link, button_text, sort_order } = req.body;

    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;
    const db = await getDatabase();

    db.run(
      'INSERT INTO banners (title, subtitle, image, link, button_text, sort_order) VALUES (?,?,?,?,?,?)',
      [title || '', subtitle || null, imagePath, link || '/products', button_text || 'Lihat Selengkapnya', sort_order || 0]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM banners WHERE id = last_insert_rowid()');
    res.status(201).json({ message: 'Banner berhasil ditambahkan', banner: resultToObjects(result)[0] });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/banners/:id - Update banner
router.put('/:id', authenticateToken, uploadProduct.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, link, button_text, sort_order, is_active } = req.body;

    const db = await getDatabase();
    const existing = db.exec('SELECT * FROM banners WHERE id = ?', [parseInt(id)]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'Banner tidak ditemukan' });
    }

    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : resultToObjects(existing)[0].image;

    db.run(
      'UPDATE banners SET title=?, subtitle=?, image=?, link=?, button_text=?, sort_order=?, is_active=? WHERE id=?',
      [title || '', subtitle || null, imagePath, link || '/products', button_text || 'Lihat Selengkapnya', sort_order || 0, is_active !== undefined ? (is_active === 'true' || is_active === '1' ? 1 : 0) : 1, parseInt(id)]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM banners WHERE id = ?', [parseInt(id)]);
    res.json({ message: 'Banner berhasil diperbarui', banner: resultToObjects(result)[0] });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/banners/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM banners WHERE id = ?', [parseInt(req.params.id)]);
    saveDatabase();
    res.json({ message: 'Banner berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
