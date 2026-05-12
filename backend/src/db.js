import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDir = path.resolve(__dirname, '..', 'data');
const dbPath = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(defaultDataDir, 'itech.sqlite');

let connection;

export async function getDb() {
  if (connection) {
    return connection;
  }

  await mkdir(path.dirname(dbPath), { recursive: true });

  connection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await connection.exec('PRAGMA foreign_keys = ON;');
  return connection;
}

export async function migrate() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      badge TEXT NOT NULL,
      color TEXT NOT NULL,
      visual TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_slug) REFERENCES categories(slug)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_cover INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_favorites (
      user_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS business_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      display_time TEXT NOT NULL,
      weekday_start INTEGER NOT NULL,
      weekday_end INTEGER NOT NULL,
      open_minutes INTEGER NOT NULL,
      close_minutes INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS store_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      label TEXT NOT NULL,
      maps_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT,
      product_id INTEGER,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
}

export async function getSettings() {
  const db = await getDb();
  const rows = await db.all('SELECT key, value FROM store_settings');

  return rows.reduce((settings, row) => {
    settings[row.key] = row.value;
    return settings;
  }, {});
}

export async function getCategories() {
  const db = await getDb();
  return db.all(`
    SELECT id, name, slug, description, icon
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `);
}

export async function getProducts({ featured, category } = {}) {
  const db = await getDb();
  const filters = [];
  const params = {};

  if (featured !== undefined) {
    filters.push('featured = $featured');
    params.$featured = featured ? 1 : 0;
  }

  if (category) {
    filters.push('category_slug = $category');
    params.$category = category;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = await db.all(
    `
      SELECT
        id,
        name,
        category_slug AS categorySlug,
        description,
        price_cents AS priceCents,
        badge,
        color,
        visual,
        featured
      FROM products
      ${where}
      ORDER BY sort_order ASC, name ASC
    `,
    params
  );

  if (!rows.length) {
    return [];
  }

  const placeholders = rows.map(() => '?').join(', ');
  const imageRows = await db.all(
    `
      SELECT
        product_id AS productId,
        image_url AS url,
        alt_text AS alt,
        sort_order AS sortOrder,
        is_cover AS isCover
      FROM product_images
      WHERE product_id IN (${placeholders})
      ORDER BY product_id ASC, is_cover DESC, sort_order ASC, id ASC
    `,
    rows.map((row) => row.id)
  );

  const imagesByProduct = imageRows.reduce((grouped, image) => {
    const current = grouped.get(image.productId) || [];
    current.push({
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
      isCover: Boolean(image.isCover)
    });
    grouped.set(image.productId, current);
    return grouped;
  }, new Map());

  return rows.map((row) => ({
    ...row,
    featured: Boolean(row.featured),
    images: imagesByProduct.get(row.id) || []
  }));
}

export async function getBusinessHours() {
  const db = await getDb();
  return db.all(`
    SELECT
      id,
      label,
      display_time AS displayTime,
      weekday_start AS weekdayStart,
      weekday_end AS weekdayEnd,
      open_minutes AS openMinutes,
      close_minutes AS closeMinutes
    FROM business_hours
    ORDER BY sort_order ASC
  `);
}

export async function getStoreLocations() {
  const db = await getDb();
  return db.all(`
    SELECT
      id,
      city,
      state,
      label,
      maps_url AS mapsUrl
    FROM store_locations
    ORDER BY sort_order ASC
  `);
}
