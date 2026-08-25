const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Helper: convert sql.js result to array of objects
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// GET /api/products - List all products (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { category, type, search, limit, offset } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category_slug = ?';
      params.push(category);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
      if (offset) {
        sql += ` OFFSET ${parseInt(offset)}`;
      }
    }

    const result = db.exec(sql, params);
    const products = resultToObjects(result);

    // Fetch images for each product
    const productsWithImages = products.map((product) => {
      const imgResult = db.exec(
        'SELECT * FROM product_images WHERE product_id = ?',
        [product.id]
      );
      const images = resultToObjects(imgResult);
      return { ...product, images };
    });

    res.json({ products: productsWithImages });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/products/:id - Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const result = db.exec('SELECT * FROM products WHERE id = ?', [parseInt(id)]);
    const products = resultToObjects(result);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const product = products[0];

    // Get images
    const imgResult = db.exec('SELECT * FROM product_images WHERE product_id = ?', [product.id]);
    product.images = resultToObjects(imgResult);

    // Get seller info
    const userResult = db.exec(
      'SELECT id, name, avatar, created_at FROM users WHERE id = ?',
      [product.user_id]
    );
    product.seller = resultToObjects(userResult)[0] || null;

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/products/user/my-products - Get current user's products
router.get('/user/my-products', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();

    const result = db.exec(
      'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const products = resultToObjects(result);

    const productsWithImages = products.map((product) => {
      const imgResult = db.exec(
        'SELECT * FROM product_images WHERE product_id = ?',
        [product.id]
      );
      product.images = resultToObjects(imgResult);
      return product;
    });

    res.json({ products: productsWithImages });
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    // Check product exists and belongs to user
    const existing = db.exec('SELECT * FROM products WHERE id = ? AND user_id = ?', [parseInt(id), req.user.id]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'Produk tidak ditemukan atau bukan milik Anda' });
    }

    const { name, description, price, originalPrice, category, categorySlug, type, condition, location, sizes, includes } = req.body;

    if (!name || !price || !category || !type) {
      return res.status(400).json({ message: 'Nama, harga, kategori, dan tipe wajib diisi' });
    }

    db.run(
      `UPDATE products SET name=?, description=?, price=?, original_price=?, category=?, category_slug=?, type=?, condition=?, location=?, sizes=?, includes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [
        name,
        description || null,
        parseInt(price),
        originalPrice ? parseInt(originalPrice) : null,
        category,
        categorySlug || category.toLowerCase().replace(/\s+/g, '-'),
        type,
        condition || null,
        location || null,
        sizes || null,
        includes || null,
        parseInt(id),
      ]
    );

    const { saveDatabase } = require('../database/init');
    saveDatabase();

    const result = db.exec('SELECT * FROM products WHERE id = ?', [parseInt(id)]);
    const product = resultToObjects(result)[0];

    res.json({ message: 'Produk berhasil diperbarui', product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    // Check product exists and belongs to user
    const existing = db.exec('SELECT * FROM products WHERE id = ? AND user_id = ?', [parseInt(id), req.user.id]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'Produk tidak ditemukan atau bukan milik Anda' });
    }

    // Delete product images first
    db.run('DELETE FROM product_images WHERE product_id = ?', [parseInt(id)]);
    // Delete product
    db.run('DELETE FROM products WHERE id = ?', [parseInt(id)]);

    const { saveDatabase } = require('../database/init');
    saveDatabase();

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
