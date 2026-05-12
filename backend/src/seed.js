import 'dotenv/config';
import { getDb, migrate } from './db.js';

const settings = {
  storeName: 'íTech',
  storeTagline: 'A Loja do Seu iPhone',
  storeLocation: 'Catu-BA e Alagoinhas-BA',
  heroBadge: 'Novo · iPhone 16 Pro disponível',
  heroTitle: 'A Loja do Seu iPhone',
  heroAccent: 'iPhone',
  heroSubtitle:
    'Produtos Apple originais e certificados, garantia oficial, atendimento especializado e parcelamento facilitado.',
  heroPrimaryAction: 'Ver produtos',
  heroSecondaryAction: 'Horários e endereço'
};

const categories = [
  ['iPhone', 'iphone', 'iPhone 16, 15, SE e modelos seminovos certificados', 'smartphone', 1],
  ['Mac', 'mac', 'MacBook Air, MacBook Pro e iMac para trabalho pesado', 'laptop', 2],
  ['Apple Watch', 'apple-watch', 'Série 10, Ultra 2 e SE com pulseiras selecionadas', 'watch', 3],
  ['AirPods', 'airpods', 'AirPods Pro, AirPods 4 e AirPods Max', 'headphones', 4],
  ['iPad', 'ipad', 'iPad Pro, Air, mini e acessórios de produtividade', 'tablet', 5],
  ['Acessórios', 'acessorios', 'Capas, cabos, fontes, MagSafe e proteção', 'cable', 6],
];

const products = [
  ['iPhone 16 Pro', 'iphone', 'Chip A18 Pro, câmera de 48 MP e tela ProMotion de 6,3 polegadas.', 929900, 'iPhone', 'blue', 'phone', 1, 1],
  ['iPhone 15', 'iphone', 'Dynamic Island, câmera principal de 48 MP e acabamento resistente.', 529900, 'Mais vendido', 'green', 'phone', 1, 2],
  ['MacBook Air M3', 'mac', 'Chip M3, 8 GB de memória unificada e tela Liquid Retina de 13,6 polegadas.', 1249900, 'Mac', 'silver', 'laptop', 1, 3],
  ['Apple Watch S10', 'apple-watch', 'Display de 46 mm, GPS, detecção de queda e acompanhamento de saúde.', 409900, 'Watch', 'midnight', 'watch', 1, 4],
  ['AirPods Pro 2', 'airpods', 'Cancelamento ativo de ruído, áudio adaptativo e estojo MagSafe.', 229900, 'AirPods', 'orange', 'audio', 1, 5],
  ['iPad Air M2', 'ipad', 'Chip M2, Wi-Fi 6E e tela Liquid Retina de 11 polegadas.', 649900, 'iPad', 'pink', 'tablet', 1, 6],
  ['Carregador MagSafe', 'acessorios', 'Carregamento sem fio magnético para iPhone e AirPods.', 49900, 'Acessório', 'silver', 'accessory', 0, 7]
];

const hours = [
  ['Segunda a sexta', '8h às 17h30', 1, 5, 8 * 60, 17 * 60 + 30, 1],
  ['Sábado', '8h às 12h', 6, 6, 8 * 60, 12 * 60, 2]
];

const locations = [
  ['Catu', 'BA', 'Unidade Catu-BA', 'https://maps.app.goo.gl/GtTJUAoFMqrtMWay6', 1],
  ['Alagoinhas', 'BA', 'Unidade Alagoinhas-BA', null, 2]
];

async function seed() {
  await migrate();
  const db = await getDb();

  await db.exec('BEGIN TRANSACTION;');

  try {
    await db.exec(`
      DELETE FROM business_hours;
      DELETE FROM store_locations;
      DELETE FROM user_favorites;
      DELETE FROM product_images;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM store_settings;
    `);

    const settingStatement = await db.prepare(`
      INSERT INTO store_settings (key, value)
      VALUES (?, ?)
    `);

    for (const [key, value] of Object.entries(settings)) {
      await settingStatement.run(key, value);
    }

    await settingStatement.finalize();

    const categoryStatement = await db.prepare(`
      INSERT INTO categories (name, slug, description, icon, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const category of categories) {
      await categoryStatement.run(category);
    }

    await categoryStatement.finalize();

    const productStatement = await db.prepare(`
      INSERT INTO products
        (name, category_slug, description, price_cents, badge, color, visual, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const product of products) {
      await productStatement.run(product);
    }

    await productStatement.finalize();

    const hoursStatement = await db.prepare(`
      INSERT INTO business_hours
        (label, display_time, weekday_start, weekday_end, open_minutes, close_minutes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const entry of hours) {
      await hoursStatement.run(entry);
    }

    await hoursStatement.finalize();

    const locationsStatement = await db.prepare(`
      INSERT INTO store_locations (city, state, label, maps_url, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const location of locations) {
      await locationsStatement.run(location);
    }

    await locationsStatement.finalize();
    await db.exec('COMMIT;');

    console.log('Banco SQLite criado e populado em backend/data/itech.sqlite');
  } catch (error) {
    await db.exec('ROLLBACK;');
    throw error;
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
