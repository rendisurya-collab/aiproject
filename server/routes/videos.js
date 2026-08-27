const express = require('express');
const multer = require('multer');
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

// Multer memory storage for video upload to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file video (MP4, WebM, MOV, AVI) yang diperbolehkan'), false);
  },
});

// GET /api/videos - Public, list active videos
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM videos WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    res.json({ videos: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// GET /api/videos/all - Admin, list all videos
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM videos ORDER BY sort_order ASC, created_at DESC');
    res.json({ videos: resultToObjects(result) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/videos - Upload video
router.post('/', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File video wajib diunggah' });

    const { title, description, sort_order } = req.body;

    // Upload to Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ message: 'Cloudinary belum dikonfigurasi' });
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload video buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'bridalnest/videos',
          transformation: [{ quality: 'auto', fetch_format: 'mp4' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const videoUrl = uploadResult.secure_url;
    const thumbnail = uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg');
    const duration = uploadResult.duration ? Math.round(uploadResult.duration) + 's' : null;

    const db = await getDatabase();
    db.run(
      'INSERT INTO videos (title, description, video_url, thumbnail, duration, video_type, sort_order) VALUES (?,?,?,?,?,?,?)',
      [title || null, description || null, videoUrl, thumbnail, duration, 'upload', sort_order || 0]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM videos WHERE id = last_insert_rowid()');
    res.status(201).json({ message: 'Video berhasil diunggah', video: resultToObjects(result)[0] });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ message: 'Gagal mengunggah video: ' + err.message });
  }
});

// POST /api/videos/youtube - Add YouTube video by link
router.post('/youtube', authenticateToken, async (req, res) => {
  try {
    const { url, title, description, sort_order } = req.body;

    if (!url) return res.status(400).json({ message: 'URL YouTube wajib diisi' });

    // Extract YouTube ID from various URL formats
    let youtubeId = null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) { youtubeId = match[1]; break; }
    }

    if (!youtubeId) return res.status(400).json({ message: 'URL YouTube tidak valid' });

    const videoUrl = `https://www.youtube.com/embed/${youtubeId}`;
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    const db = await getDatabase();
    db.run(
      'INSERT INTO videos (title, description, video_url, thumbnail, duration, video_type, youtube_id, sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [title || null, description || null, videoUrl, thumbnail, null, 'youtube', youtubeId, sort_order || 0]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM videos WHERE id = last_insert_rowid()');
    res.status(201).json({ message: 'Video YouTube berhasil ditambahkan', video: resultToObjects(result)[0] });
  } catch (err) {
    console.error('YouTube add error:', err);
    res.status(500).json({ message: 'Gagal menambahkan video' });
  }
});

// PUT /api/videos/:id - Update video info
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sort_order, is_active } = req.body;

    const db = await getDatabase();
    db.run(
      'UPDATE videos SET title=?, description=?, sort_order=?, is_active=? WHERE id=?',
      [title || null, description || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, parseInt(id)]
    );
    saveDatabase();

    const result = db.exec('SELECT * FROM videos WHERE id = ?', [parseInt(id)]);
    res.json({ message: 'Video berhasil diperbarui', video: resultToObjects(result)[0] });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/videos/:id - Delete video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM videos WHERE id = ?', [parseInt(req.params.id)]);
    saveDatabase();
    res.json({ message: 'Video berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
