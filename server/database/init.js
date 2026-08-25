const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'bridalnest.db');
const CLOUDINARY_DB_PUBLIC_ID = 'bridalnest/backup/database';

let db = null;
let dbReady = null;

function getDatabase() {
  if (!dbReady) {
    dbReady = initDatabase();
  }
  return dbReady;
}

// Download database backup from Cloudinary on startup
async function downloadDbFromCloud() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  try {
    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/${CLOUDINARY_DB_PUBLIC_ID}.db`;
    const response = await fetch(url);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(DB_PATH, buffer);
      console.log('Database restored from Cloudinary backup');
      return true;
    }
  } catch (err) {
    console.log('No cloud backup found, creating fresh database');
  }
  return false;
}

// Upload database backup to Cloudinary
async function backupDbToCloud() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return;

  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    await cloudinary.uploader.upload(DB_PATH, {
      resource_type: 'raw',
      public_id: CLOUDINARY_DB_PUBLIC_ID,
      overwrite: true,
    });
    console.log('Database backed up to Cloudinary');
  } catch (err) {
    console.error('Database backup failed:', err.message);
  }
}

async function initDatabase() {
  // Try to restore from Cloudinary first
  if (!fs.existsSync(DB_PATH)) {
    await downloadDbFromCloud();
  }

  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL mode equivalent
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
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

  // Add image column to categories if not exists
  try { db.run('ALTER TABLE categories ADD COLUMN image TEXT'); } catch(e) {}

  // Banners table
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

  // Seed default categories if empty
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

  // Seed default admin if no users exist
  const userCount = db.exec('SELECT COUNT(*) FROM users');
  if (userCount[0].values[0][0] === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('Rendi1234', 10);
    db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
      ['Admin', 'rendisuryahd@gmail.com', hashedPassword, null, 'admin']
    );
    console.log('Default admin account created: rendisuryahd@gmail.com');
  }

  saveDatabase();
  console.log('Database tables initialized successfully');
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
  // Auto backup to Cloudinary (debounced)
  scheduleBackup();
}

let backupTimer = null;
function scheduleBackup() {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupDbToCloud();
  }, 5000); // Backup 5 seconds after last save
}

module.exports = { getDatabase, saveDatabase };
