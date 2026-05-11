import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getBusinessHours,
  getCategories,
  getDb,
  getProducts,
  getSettings,
  getStoreLocations,
  migrate
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true }));
app.use(express.json());

app.get('/api/health', async (_request, response, next) => {
  try {
    await getDb();
    response.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/home', async (_request, response, next) => {
  try {
    const [settings, categories, featuredProducts, businessHours, locations] = await Promise.all([
      getSettings(),
      getCategories(),
      getProducts({ featured: true }),
      getBusinessHours(),
      getStoreLocations()
    ]);

    response.json({
      store: {
        name: settings.storeName,
        tagline: settings.storeTagline,
        location: settings.storeLocation
      },
      hero: {
        badge: settings.heroBadge,
        title: settings.heroTitle,
        accent: settings.heroAccent,
        subtitle: settings.heroSubtitle,
        primaryActionLabel: settings.heroPrimaryAction,
        secondaryActionLabel: settings.heroSecondaryAction
      },
      categories,
      featuredProducts,
      businessHours,
      locations
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories', async (_request, response, next) => {
  try {
    response.json(await getCategories());
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (request, response, next) => {
  try {
    const featured =
      request.query.featured === undefined ? undefined : request.query.featured === 'true';
    response.json(
      await getProducts({
        featured,
        category: request.query.category
      })
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/business-hours', async (_request, response, next) => {
  try {
    response.json(await getBusinessHours());
  } catch (error) {
    next(error);
  }
});

app.get('/api/locations', async (_request, response, next) => {
  try {
    response.json(await getStoreLocations());
  } catch (error) {
    next(error);
  }
});

app.post('/api/leads', async (request, response, next) => {
  try {
    const customerName = String(request.body.customerName ?? '').trim();
    const phone = String(request.body.phone ?? '').trim();
    const message = String(request.body.message ?? '').trim();
    const productId = request.body.productId ? Number(request.body.productId) : null;

    if (!customerName) {
      response.status(400).json({ message: 'Informe o nome do cliente.' });
      return;
    }

    const db = await getDb();
    const result = await db.run(
      `
        INSERT INTO leads (customer_name, phone, product_id, message)
        VALUES (?, ?, ?, ?)
      `,
      customerName,
      phone,
      productId,
      message
    );

    response.status(201).json({ id: result.lastID });
  } catch (error) {
    next(error);
  }
});

const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Erro interno do servidor.' });
});

await migrate();

app.listen(port, () => {
  console.log(`API íTech rodando em http://localhost:${port}`);
});
