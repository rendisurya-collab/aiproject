const express = require('express');
const { authenticateToken } = require('../middleware/auth');
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

// ===== BOOKING FIELDS CONFIG =====

// GET /api/bookings/fields - Public, get active form fields
router.get('/fields', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM booking_fields WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json({ fields: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/bookings/fields/all - Admin, get all fields
router.get('/fields/all', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM booking_fields ORDER BY sort_order ASC');
    res.json({ fields: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/bookings/fields - Admin, add field
router.post('/fields', authenticateToken, async (req, res) => {
  try {
    const { field_name, field_label, field_type, placeholder, is_required, options, sort_order } = req.body;
    if (!field_name || !field_label) return res.status(400).json({ message: 'Nama field dan label wajib diisi' });

    const db = await getDatabase();
    db.run(
      'INSERT INTO booking_fields (field_name, field_label, field_type, placeholder, is_required, options, sort_order) VALUES (?,?,?,?,?,?,?)',
      [field_name, field_label, field_type || 'text', placeholder || null, is_required ? 1 : 0, options || null, sort_order || 0]
    );
    saveDatabase();
    res.status(201).json({ message: 'Field berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/bookings/fields/:id - Admin, update field
router.put('/fields/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { field_name, field_label, field_type, placeholder, is_required, options, sort_order, is_active } = req.body;

    const db = await getDatabase();
    db.run(
      'UPDATE booking_fields SET field_name=?, field_label=?, field_type=?, placeholder=?, is_required=?, options=?, sort_order=?, is_active=? WHERE id=?',
      [field_name, field_label, field_type || 'text', placeholder || null, is_required ? 1 : 0, options || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, parseInt(id)]
    );
    saveDatabase();
    res.json({ message: 'Field berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/bookings/fields/:id - Admin, delete field
router.delete('/fields/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM booking_fields WHERE id = ?', [parseInt(req.params.id)]);
    saveDatabase();
    res.json({ message: 'Field berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ===== BOOKINGS =====

// POST /api/bookings - Submit booking (public/user)
router.post('/', async (req, res) => {
  try {
    const { product_id, product_name, form_data, total_price, start_date, end_date, rental_days, notes } = req.body;

    if (!form_data || !product_name) {
      return res.status(400).json({ message: 'Data form dan nama produk wajib diisi' });
    }

    const db = await getDatabase();
    db.run(
      'INSERT INTO bookings (product_id, product_name, form_data, total_price, start_date, end_date, rental_days, notes) VALUES (?,?,?,?,?,?,?,?)',
      [product_id || null, product_name, JSON.stringify(form_data), total_price || 0, start_date || null, end_date || null, rental_days || 0, notes || null]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM bookings WHERE id = last_insert_rowid()');
    res.status(201).json({ message: 'Booking berhasil dikirim! Tim kami akan menghubungi Anda.', booking: resultToObjects(result)[0] });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/bookings - Admin, list all bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM bookings ORDER BY created_at DESC');
    const bookings = resultToObjects(result).map(b => ({
      ...b,
      form_data: b.form_data ? JSON.parse(b.form_data) : {},
    }));
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/bookings/:id/status - Admin, update booking status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const db = await getDatabase();
    db.run(
      'UPDATE bookings SET status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [status || 'pending', notes || null, parseInt(req.params.id)]
    );
    saveDatabase();
    res.json({ message: 'Status booking diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/bookings/:id - Admin, delete booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM bookings WHERE id = ?', [parseInt(req.params.id)]);
    saveDatabase();
    res.json({ message: 'Booking dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
