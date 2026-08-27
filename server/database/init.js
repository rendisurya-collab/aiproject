const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'bridalnest.db');
const CLOUDINARY_DB_PUBLIC_ID = 'bridalnest_db_backup';

let db = null;
let dbReady = null;

function getDatabase() {
  if (!dbReady) {
    dbReady = initDatabase();
  }
  return dbReady;
}

async function downloadDbFromCloud() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  // Try multiple URL patterns
  const urls = [
    `https://res.cloudinary.com/${cloudName}/raw/upload/bridalnest_db_backup`,
    `https://res.cloudinary.com/${cloudName}/raw/upload/v1/bridalnest_db_backup`,
  ];

  for (const url of urls) {
    try {
      console.log('Trying restore from:', url);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('html') && !contentType.includes('gif')) {
          const buffer = Buffer.from(await response.arrayBuffer());
          if (buffer.length > 100) {
            fs.writeFileSync(DB_PATH, buffer);
            console.log('Database restored from Cloudinary (' + buffer.length + ' bytes)');
            return true;
          }
        }
      }
    } catch (err) {
      console.log('URL failed:', err.message);
    }
  }
  console.log('No valid cloud backup found, starting fresh');
  return false;
}

async function backupDbToCloud() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('Cloudinary not configured, skipping backup');
    return { success: false, message: 'Cloudinary not configured' };
  }

  if (!fs.existsSync(DB_PATH)) {
    return { success: false, message: 'Database file not found' };
  }

  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(DB_PATH, {
      resource_type: 'raw',
      public_id: CLOUDINARY_DB_PUBLIC_ID,
      overwrite: true,
      invalidate: true,
    });
    console.log('Database backed up to Cloudinary:', result.secure_url);
    return { success: true, url: result.secure_url };
  } catch (err) {
    console.error('Database backup failed:', err.message);
    return { success: false, message: err.message };
  }
}

async function initDatabase() {
  // Try to restore from cloud if no local DB exists
  if (!fs.existsSync(DB_PATH)) {
    await downloadDbFromCloud();
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      original_price INTEGER,
      category TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      type TEXT NOT NULL,
      condition TEXT,
      location TEXT,
      sizes TEXT,
      includes TEXT,
      rating REAL DEFAULT 0,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      image_type TEXT DEFAULT 'avatar',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '📦',
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { db.run('ALTER TABLE categories ADD COLUMN image TEXT'); } catch(e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image TEXT,
      link TEXT DEFAULT '/products',
      button_text TEXT DEFAULT 'Lihat Selengkapnya',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default categories
  const catCount = db.exec('SELECT COUNT(*) FROM categories');
  if (catCount[0].values[0][0] === 0) {
    const defaultCategories = [
      ['Gaun Pengantin', 'gaun', '👗', 'Gaun pengantin untuk disewa', 1],
      ['Kebaya & Beskap', 'kebaya', '🎎', 'Kebaya dan beskap pengantin', 2],
      ['Dekorasi', 'dekorasi', '🌸', 'Dekorasi pernikahan', 3],
      ['Aksesoris', 'aksesoris', '💍', 'Aksesoris pengantin', 4],
      ['Sepatu & Heels', 'sepatu', '👠', 'Sepatu pengantin', 5],
      ['Jas & Tuxedo', 'jas', '🤵', 'Jas dan tuxedo pengantin pria', 6],
    ];
    defaultCategories.forEach(([name, slug, icon, desc, order]) => {
      db.run('INSERT INTO categories (name, slug, icon, description, sort_order) VALUES (?,?,?,?,?)', [name, slug, icon, desc, order]);
    });
  }

  // Seed default about settings
  const settingsCount = db.exec('SELECT COUNT(*) FROM site_settings');
  if (settingsCount[0].values[0][0] === 0) {
    const defaults = [
      ['about_title', 'Platform Sewa Pernikahan yang Terpercaya'],
      ['about_subtitle', 'Kami percaya bahwa setiap pasangan layak mendapatkan pernikahan impian tanpa harus menguras tabungan.'],
      ['about_story_title', 'Cerita Kami'],
      ['about_story_1', 'Kami menghubungkan pemilik busana pernikahan berkualitas dengan calon pengantin yang ingin menyewa.'],
      ['about_story_2', 'Platform kami memungkinkan siapa saja untuk menyewakan koleksi pernikahan mereka dengan aman dan nyaman.'],
      ['about_story_3', 'Lebih dari sekadar platform sewa, kami adalah komunitas yang mendukung pernikahan berkelanjutan.'],
      ['about_quote', 'Sewa Elegan, Tampil Memukau'],
      ['about_value_1_title', 'Berkelanjutan'],
      ['about_value_1_desc', 'Mendukung ekonomi sirkular dengan memaksimalkan penggunaan produk pernikahan berkualitas.'],
      ['about_value_2_title', 'Terpercaya'],
      ['about_value_2_desc', 'Setiap produk diverifikasi dan setiap transaksi dilindungi dengan sistem yang aman.'],
      ['about_value_3_title', 'Kualitas Premium'],
      ['about_value_3_desc', 'Hanya produk berkualitas tinggi yang lolos kurasi ketat tim kami.'],
      ['about_stat_1', '500+'], ['about_stat_1_label', 'Produk Sewa'],
      ['about_stat_2', '1,200+'], ['about_stat_2_label', 'Booking Sukses'],
      ['about_stat_3', '150+'], ['about_stat_3_label', 'Penyewa Terverifikasi'],
      ['about_stat_4', '4.9/5'], ['about_stat_4_label', 'Rating Kepuasan'],
      ['about_cta_title', 'Bergabung Bersama Kami'],
      ['about_cta_desc', 'Bergabunglah dengan komunitas kami untuk menyewakan atau menyewa perlengkapan pernikahan.'],
      ['about_image', ''],
    ];
    defaults.forEach(([key, value]) => {
      db.run('INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?)', [key, value]);
    });
  }

  // Seed default admin
  const userCount = db.exec('SELECT COUNT(*) FROM users');
  if (userCount[0].values[0][0] === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('Rendi1234', 10);
    db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
      ['Admin', 'rendisuryahd@gmail.com', hashedPassword, null, 'admin']
    );
    console.log('Default admin created: rendisuryahd@gmail.com');
  }

  saveDatabase();
  console.log('Database initialized successfully');

  // Schedule first backup after init
  scheduleBackup();

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
  scheduleBackup();
}

let backupTimer = null;
function scheduleBackup() {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupDbToCloud().catch(() => {});
  }, 10000);
}

module.exports = { getDatabase, saveDatabase, backupDbToCloud };
