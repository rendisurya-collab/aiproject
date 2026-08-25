const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { uploadProduct, getImageUrl } = require('../middleware/upload');
const { getDatabase, saveDatabase } = require('../database/init');

const router = express.Router();

// POST /api/upload/product-image
router.post('/product-image', authenticateToken, uploadProduct.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Minimal 1 file gambar wajib diunggah' });
    }

    const images = req.files.map((file, index) => ({
      path: getImageUrl(file) || `/uploads/products/${file.filename}`,
      filename: file.filename,
      isPrimary: index === 0,
    }));

    res.json({
      message: `${images.length} gambar berhasil diunggah`,
      images,
    });
  } catch (err) {
    console.error('Product image upload error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/upload/product - Upload product with images to database
router.post('/product', authenticateToken, uploadProduct.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, categorySlug, type, condition, location, sizes, includes } = req.body;

    if (!name || !price || !category || !type) {
      return res.status(400).json({ message: 'Nama, harga, kategori, dan tipe wajib diisi' });
    }

    const db = await getDatabase();

    // Insert product
    db.run(
      `INSERT INTO products (user_id, name, description, price, original_price, category, category_slug, type, condition, location, sizes, includes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
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
      ]
    );

    const productResult = db.exec('SELECT last_insert_rowid() as id');
    const productId = productResult[0].values[0][0];

    // Insert product images
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imagePath = getImageUrl(file) || `/uploads/products/${file.filename}`;
        db.run(
          'INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)',
          [productId, imagePath, index === 0 ? 1 : 0]
        );
      });

      // Set first image as product main image
      const firstImage = getImageUrl(req.files[0]) || `/uploads/products/${req.files[0].filename}`;
      db.run('UPDATE products SET image = ? WHERE id = ?', [firstImage, productId]);
    }

    saveDatabase();

    // Fetch created product
    const pResult = db.exec('SELECT * FROM products WHERE id = ?', [productId]);
    const pRow = pResult[0].values[0];
    const pColumns = pResult[0].columns;
    const product = {};
    pColumns.forEach((col, i) => { product[col] = pRow[i]; });

    const imgResult = db.exec('SELECT * FROM product_images WHERE product_id = ?', [productId]);
    let productImages = [];
    if (imgResult.length > 0) {
      const imgColumns = imgResult[0].columns;
      productImages = imgResult[0].values.map((row) => {
        const img = {};
        imgColumns.forEach((col, i) => { img[col] = row[i]; });
        return img;
      });
    }

    res.status(201).json({
      message: 'Produk berhasil ditambahkan',
      product: { ...product, images: productImages },
    });
  } catch (err) {
    console.error('Product upload error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/upload/my-images
router.get('/my-images', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(
      'SELECT * FROM user_images WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    let images = [];
    if (result.length > 0) {
      const columns = result[0].columns;
      images = result[0].values.map((row) => {
        const img = {};
        columns.forEach((col, i) => { img[col] = row[i]; });
        return img;
      });
    }

    res.json({ images });
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
