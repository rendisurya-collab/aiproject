const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'bridalnest.db');

let db = null;
let dbReady = null;

function getDatabase() {
  if (!dbReady) {
    dbReady = initDatabase();
  }
  return dbReady;
}

async function initDatabase() {
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
}

module.exports = { getDatabase, saveDatabase };
