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

// GET /api/categories - Public, list all active categories
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC');
    const categories = resultToObjects(result);
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/categories/all - Admin, list all categories including inactive
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
    const categories = resultToObjects(result);
    res.json({ categories });
  } catch (err) {
    console.error('Get all categories error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/categories - Create new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, icon, description, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Nama dan slug wajib diisi' });
    }

    const db = await getDatabase();

    // Check slug unique
    const existing = db.exec('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(409).json({ message: 'Slug sudah digunakan' });
    }

    db.run(
      'INSERT INTO categories (name, slug, icon, description, sort_order) VALUES (?,?,?,?,?)',
      [name, slug, icon || '📦', description || null, sort_order || 0]
    );

    saveDatabase();

    const result = db.exec('SELECT * FROM categories WHERE slug = ?', [slug]);
    const category = resultToObjects(result)[0];

    res.status(201).json({ message: 'Kategori berhasil ditambahkan', category });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, sort_order, is_active } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Nama dan slug wajib diisi' });
    }

    const db = await getDatabase();

    // Check exists
    const existing = db.exec('SELECT id FROM categories WHERE id = ?', [parseInt(id)]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    // Check slug unique (exclude self)
    const slugCheck = db.exec('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, parseInt(id)]);
    if (slugCheck.length > 0 && slugCheck[0].values.length > 0) {
      return res.status(409).json({ message: 'Slug sudah digunakan oleh kategori lain' });
    }

    db.run(
      'UPDATE categories SET name=?, slug=?, icon=?, description=?, sort_order=?, is_active=? WHERE id=?',
      [name, slug, icon || '📦', description || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, parseInt(id)]
    );

    saveDatabase();

    const result = db.exec('SELECT * FROM categories WHERE id = ?', [parseInt(id)]);
    const category = resultToObjects(result)[0];

    res.json({ message: 'Kategori berhasil diperbarui', category });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const existing = db.exec('SELECT id FROM categories WHERE id = ?', [parseInt(id)]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    // Check if products use this category
    const catResult = db.exec('SELECT slug FROM categories WHERE id = ?', [parseInt(id)]);
    const catSlug = resultToObjects(catResult)[0]?.slug;
    if (catSlug) {
      const productCount = db.exec('SELECT COUNT(*) as c FROM products WHERE category_slug = ?', [catSlug]);
      const count = productCount[0]?.values[0][0] || 0;
      if (count > 0) {
        return res.status(400).json({ message: `Tidak bisa dihapus, masih ada ${count} produk di kategori ini` });
      }
    }

    db.run('DELETE FROM categories WHERE id = ?', [parseInt(id)]);
    saveDatabase();

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/categories/:id/image - Upload category image
router.post('/:id/image', authenticateToken, uploadProduct.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File gambar wajib diunggah' });

    const { id } = req.params;
    const imagePath = getImageUrl(req.file) || `/uploads/products/${req.file.filename}`;
    const db = await getDatabase();

    db.run('UPDATE categories SET image = ? WHERE id = ?', [imagePath, parseInt(id)]);
    saveDatabase();

    res.json({ message: 'Gambar kategori berhasil diunggah', image: imagePath });
  } catch (err) {
    console.error('Category image upload error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
