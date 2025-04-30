import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb(path) {
  const db = await open({
    filename: path,
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      url TEXT,
      title TEXT,
      price REAL,
      target REAL,
      sku TEXT,
      retailer TEXT,
      notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY,
      product_id INTEGER,
      price REAL,
      checked_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.exec("CREATE INDEX IF NOT EXISTS idx_ph_prod ON price_history(product_id)");
  return db;
}
