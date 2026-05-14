import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

const databaseName = process.env.DB_NAME || 'itech_store';

const baseConnectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

const poolConfig = {
  ...baseConnectionConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
};

let pool;

function createAppError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

function createId(value, prefix = 'item') {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || prefix}-${Date.now().toString(36)}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const stored = String(storedHash || '');

  if (stored.startsWith('scrypt:')) {
    const [, salt, hash] = stored.split(':');
    if (!salt || !hash) return false;

    const computed = crypto.scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === computed.length && crypto.timingSafeEqual(expected, computed);
  }

  // Compatibility with the Workbench helper that stores SHA2('1234', 256).
  const sha256 = crypto.createHash('sha256').update(String(password)).digest('hex');
  return stored.toLowerCase() === sha256;
}

function toIsoDate(value) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function toBoolean(value) {
  return Boolean(Number(value));
}

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    cpf: row.cpf,
    phone: row.phone || '',
    createdAt: toIsoDate(row.created_at || row.createdAt),
    updatedAt: row.updated_at ? toIsoDate(row.updated_at) : undefined
  };
}

export async function getDb() {
  if (pool) return pool;

  let bootstrap;

  try {
    bootstrap = await mysql.createConnection(baseConnectionConfig);
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      const passwordHint = process.env.DB_PASSWORD
        ? 'Confira se DB_USER e DB_PASSWORD estao iguais aos dados usados no MySQL Workbench.'
        : 'Crie backend/.env e preencha DB_PASSWORD com a senha do seu MySQL Workbench.';
      throw new Error(`Nao foi possivel conectar no MySQL. ${passwordHint}`);
    }

    throw error;
  } finally {
    await bootstrap?.end();
  }

  pool = mysql.createPool({
    ...poolConfig,
    database: databaseName
  });

  return pool;
}

async function hasColumn(tableName, columnName) {
  const db = await getDb();
  const [rows] = await db.execute(
    `
      SELECT COUNT(*) AS total
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [databaseName, tableName, columnName]
  );

  return Number(rows[0]?.total || 0) > 0;
}

export async function migrate() {
  const db = await getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(120) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      cpf VARCHAR(11) NOT NULL UNIQUE,
      phone VARCHAR(40) NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await hasColumn('users', 'phone'))) {
    await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(40) NULL AFTER cpf');
  }

  if (!(await hasColumn('users', 'updated_at'))) {
    await db.query('ALTER TABLE users ADD COLUMN updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP');
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(120) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      cpf VARCHAR(11) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      status ENUM('pending', 'approved', 'blocked') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(120) PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      title VARCHAR(160) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(40) NOT NULL DEFAULT 'smartphone',
      show_in_nav TINYINT(1) NOT NULL DEFAULT 1,
      show_on_home TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(120) PRIMARY KEY,
      category_slug VARCHAR(120) NOT NULL,
      name VARCHAR(180) NOT NULL,
      tag VARCHAR(80) NULL,
      product_condition ENUM('Novo', 'Semi-novo') NOT NULL DEFAULT 'Novo',
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      installments VARCHAR(120) NULL,
      description TEXT NOT NULL,
      color VARCHAR(40) NOT NULL DEFAULT 'black',
      visual VARCHAR(40) NOT NULL DEFAULT 'phone',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      sale_status ENUM('available', 'sold', 'out_of_stock') NOT NULL DEFAULT 'available',
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_category (category_slug),
      CONSTRAINT fk_products_category
        FOREIGN KEY (category_slug) REFERENCES categories(slug)
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(120) NOT NULL,
      image_url TEXT NOT NULL,
      alt_text VARCHAR(180) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_cover TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product_images_product (product_id, sort_order),
      CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_specs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(120) NOT NULL,
      label VARCHAR(80) NOT NULL DEFAULT 'Detalhe',
      value VARCHAR(180) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      INDEX idx_product_specs_product (product_id, sort_order),
      CONSTRAINT fk_product_specs_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_favorites (
      user_id VARCHAR(120) NOT NULL,
      product_id VARCHAR(120) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      INDEX idx_user_favorites_product (product_id),
      CONSTRAINT fk_user_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_user_favorites_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(120) PRIMARY KEY,
      product_id VARCHAR(120) NOT NULL,
      user_id VARCHAR(120) NULL,
      product_name VARCHAR(180) NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      customer_email VARCHAR(180) NULL,
      customer_cpf VARCHAR(11) NULL,
      amount DECIMAL(10,2) NOT NULL,
      percent TINYINT UNSIGNED NOT NULL,
      mode ENUM('buy', 'reserve') NOT NULL,
      receipt_name VARCHAR(255) NULL,
      receipt_url TEXT NULL,
      status ENUM('pending', 'validated', 'cancelled') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      validated_at DATETIME NULL,
      INDEX idx_orders_status (status),
      INDEX idx_orders_product (product_id),
      CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON UPDATE CASCADE,
      CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(120) PRIMARY KEY,
      product_id VARCHAR(120) NOT NULL,
      user_id VARCHAR(120) NULL,
      order_id VARCHAR(120) NULL,
      mode ENUM('buy', 'reserve') NOT NULL,
      percent TINYINT UNSIGNED NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      expires_at DATETIME NULL,
      proof_attached TINYINT(1) NOT NULL DEFAULT 0,
      receipt_name VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reservations_product (product_id),
      CONSTRAINT fk_reservations_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_reservations_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS business_hours (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(120) NOT NULL,
      display_time VARCHAR(120) NOT NULL,
      weekday_start TINYINT UNSIGNED NOT NULL,
      weekday_end TINYINT UNSIGNED NOT NULL,
      open_minutes SMALLINT UNSIGNED NOT NULL,
      close_minutes SMALLINT UNSIGNED NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_locations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      city VARCHAR(120) NOT NULL,
      state CHAR(2) NOT NULL,
      label VARCHAR(160) NOT NULL,
      maps_url TEXT NULL,
      sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(160) NOT NULL,
      phone VARCHAR(40) NULL,
      product_id VARCHAR(120) NULL,
      message TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_leads_product (product_id),
      CONSTRAINT fk_leads_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function getSettings() {
  const db = await getDb();
  const [rows] = await db.execute('SELECT setting_key, setting_value FROM store_settings');
  const settings = rows.reduce((current, row) => {
    current[row.setting_key] = row.setting_value;
    return current;
  }, {});

  return {
    ...settings,
    storeName: settings.storeName || 'iTech',
    storeTagline: settings.storeTagline || settings.tagline || 'A Loja do Seu iPhone',
    storeLocation: settings.storeLocation || settings.location || 'Catu-BA e Alagoinhas-BA',
    heroPrimaryAction: settings.heroPrimaryAction || 'Ver produtos',
    heroSecondaryAction: settings.heroSecondaryAction || 'Horarios e endereco'
  };
}

export async function getCategories() {
  const db = await getDb();
  const [rows] = await db.execute(`
    SELECT
      id,
      name,
      slug,
      description,
      icon,
      show_in_nav AS showInNav,
      show_on_home AS showOnHome
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `);

  return rows.map((row) => ({
    ...row,
    nav: toBoolean(row.showInNav),
    home: toBoolean(row.showOnHome)
  }));
}

export async function getProducts({ featured, category } = {}) {
  const db = await getDb();
  const filters = [];
  const params = [];

  if (featured !== undefined) {
    filters.push('p.featured = ?');
    params.push(featured ? 1 : 0);
  }

  if (category) {
    filters.push('p.category_slug = ?');
    params.push(category);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.name,
        p.category_slug AS categorySlug,
        p.description,
        p.price,
        p.tag AS badge,
        p.color,
        p.visual,
        p.featured,
        p.installments,
        p.product_condition AS \`condition\`,
        p.sale_status AS saleStatus
      FROM products p
      ${where}
      ORDER BY p.sort_order ASC, p.name ASC
    `,
    params
  );

  if (!rows.length) return [];

  const productIds = rows.map((row) => row.id);
  const placeholders = productIds.map(() => '?').join(', ');

  const [imageRows] = await db.execute(
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
    productIds
  );

  const imagesByProduct = imageRows.reduce((grouped, image) => {
    const current = grouped.get(image.productId) || [];
    current.push({
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
      isCover: toBoolean(image.isCover)
    });
    grouped.set(image.productId, current);
    return grouped;
  }, new Map());

  return rows.map((row) => ({
    ...row,
    category: row.categorySlug,
    price: Number(row.price),
    priceCents: Math.round(Number(row.price) * 100),
    featured: toBoolean(row.featured),
    images: imagesByProduct.get(row.id) || []
  }));
}

export async function getBusinessHours() {
  const db = await getDb();
  const [rows] = await db.execute(`
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

  return rows;
}

export async function getStoreLocations() {
  const db = await getDb();
  const [rows] = await db.execute(`
    SELECT
      id,
      city,
      state,
      label,
      maps_url AS mapsUrl
    FROM store_locations
    ORDER BY sort_order ASC
  `);

  return rows;
}

export async function createLead({ customerName, phone, productId, message }) {
  const db = await getDb();
  const [result] = await db.execute(
    `
      INSERT INTO leads (customer_name, phone, product_id, message)
      VALUES (?, ?, ?, ?)
    `,
    [customerName, phone, productId || null, message]
  );

  return { id: result.insertId };
}

export async function getUsers() {
  const db = await getDb();
  const [rows] = await db.execute(`
    SELECT id, name, email, cpf, phone, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `);

  return rows.map(sanitizeUser);
}

export async function createUser(payload) {
  const db = await getDb();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const phone = String(payload.phone || '').trim();
  const cpf = normalizeCpf(payload.cpf);
  const password = String(payload.password || '');

  if (!name) throw createAppError('Informe o nome.');
  if (!email) throw createAppError('Informe o e-mail.');
  if (cpf.length !== 11) throw createAppError('Informe um CPF valido.');
  if (password.length < 4) throw createAppError('A senha precisa ter pelo menos 4 caracteres.');

  const [existingEmails] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existingEmails.length) throw createAppError('Esse e-mail ja esta cadastrado.', 409);

  const [existingUserCpfs] = await db.execute('SELECT id FROM users WHERE cpf = ? LIMIT 1', [cpf]);
  const [existingAdminCpfs] = await db.execute('SELECT id FROM admins WHERE cpf = ? LIMIT 1', [cpf]);
  if (existingUserCpfs.length || existingAdminCpfs.length) {
    throw createAppError('Esse CPF ja esta cadastrado.', 409);
  }

  const id = createId(email, 'user');
  await db.execute(
    `
      INSERT INTO users (id, name, email, cpf, phone, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [id, name, email, cpf, phone, hashPassword(password)]
  );

  const [rows] = await db.execute(
    'SELECT id, name, email, cpf, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  return sanitizeUser(rows[0]);
}

export async function authenticateUser(email, password) {
  const db = await getDb();
  const [rows] = await db.execute(
    `
      SELECT id, name, email, cpf, phone, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [String(email || '').trim().toLowerCase()]
  );

  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createAppError('Usuario ou senha invalidos.', 401);
  }

  return sanitizeUser(user);
}

export async function updateUser(id, payload) {
  const db = await getDb();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const phone = String(payload.phone || '').trim();

  if (!name || !email) throw createAppError('Nome e e-mail sao obrigatorios.');

  const [existingEmails] = await db.execute('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [
    email,
    id
  ]);
  if (existingEmails.length) throw createAppError('Esse e-mail ja esta cadastrado em outra conta.', 409);

  const [result] = await db.execute(
    `
      UPDATE users
      SET name = ?, email = ?, phone = ?
      WHERE id = ?
    `,
    [name, email, phone, id]
  );

  if (!result.affectedRows) throw createAppError('Usuario nao encontrado.', 404);

  const [rows] = await db.execute(
    'SELECT id, name, email, cpf, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  return sanitizeUser(rows[0]);
}

export async function changeUserPassword(id, payload) {
  const db = await getDb();
  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  const confirmPassword = String(payload.confirmPassword || '');

  if (newPassword.length < 4) {
    throw createAppError('A nova senha precisa ter pelo menos 4 caracteres.');
  }

  if (newPassword !== confirmPassword) {
    throw createAppError('As novas senhas nao conferem.');
  }

  const [rows] = await db.execute('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [id]);
  const user = rows[0];

  if (!user) throw createAppError('Usuario nao encontrado.', 404);
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw createAppError('Senha atual invalida.', 401);
  }

  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), id]);
}
