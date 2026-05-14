import './env.js';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  authenticateUser,
  changeUserPassword,
  createLead,
  createUser,
  getBusinessHours,
  getCategories,
  getDb,
  getProducts,
  getSettings,
  getStoreLocations,
  getUsers,
  migrate,
  updateUser
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '..', 'uploads');
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true }));
app.use(express.json());
app.use('/uploads', express.static(uploadRoot));

const imageExtensionsByMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
};

function slugify(value, fallback = 'produto') {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

function createUploadError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const productImageStorage = multer.diskStorage({
  destination(request, _file, callback) {
    const productSlug = slugify(request.body.productName, 'produto');
    const productUploadPath = path.join(uploadRoot, 'products', productSlug);

    fs.mkdir(productUploadPath, { recursive: true }, (error) => {
      callback(error, productUploadPath);
    });
  },
  filename(_request, file, callback) {
    const extension = imageExtensionsByMime[file.mimetype];
    const originalName = slugify(path.basename(file.originalname, path.extname(file.originalname)), 'imagem');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    callback(null, `${originalName}-${uniqueSuffix}${extension}`);
  }
});

const uploadProductImages = multer({
  storage: productImageStorage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10
  },
  fileFilter(_request, file, callback) {
    if (!imageExtensionsByMime[file.mimetype]) {
      callback(createUploadError('Apenas imagens JPG, PNG, WebP, GIF ou AVIF sao aceitas.'));
      return;
    }

    callback(null, true);
  }
}).array('images', 10);

app.get('/api/health', async (_request, response, next) => {
  try {
    const db = await getDb();
    await db.query('SELECT 1');
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

app.post('/api/uploads/product-images', (request, response, next) => {
  uploadProductImages(request, response, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!request.files?.length) {
      response.status(400).json({ message: 'Envie ao menos uma imagem.' });
      return;
    }

    const productName = String(request.body.productName ?? '').trim() || 'Produto';
    const productSlug = slugify(productName, 'produto');
    const images = request.files.map((file, index) => {
      const relativePath = path.relative(uploadRoot, file.path).split(path.sep).join('/');

      return {
        id: `${productSlug}-image-${Date.now()}-${index + 1}`,
        name: file.originalname,
        alt: path.basename(file.originalname, path.extname(file.originalname)) || productName,
        url: `/uploads/${relativePath}`
      };
    });

    response.status(201).json({ images });
  });
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

app.get('/api/users', async (_request, response, next) => {
  try {
    response.json({ users: await getUsers() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/register', async (request, response, next) => {
  try {
    const user = await createUser(request.body);
    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/login', async (request, response, next) => {
  try {
    const user = await authenticateUser(request.body.email, request.body.password);
    response.json({ user });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id', async (request, response, next) => {
  try {
    const user = await updateUser(request.params.id, request.body);
    response.json({ user });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id/password', async (request, response, next) => {
  try {
    await changeUserPassword(request.params.id, request.body);
    response.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/leads', async (request, response, next) => {
  try {
    const customerName = String(request.body.customerName ?? '').trim();
    const phone = String(request.body.phone ?? '').trim();
    const message = String(request.body.message ?? '').trim();
    const productId = request.body.productId ? String(request.body.productId) : null;

    if (!customerName) {
      response.status(400).json({ message: 'Informe o nome do cliente.' });
      return;
    }

    const lead = await createLead({ customerName, phone, productId, message });
    response.status(201).json(lead);
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
  if (error instanceof multer.MulterError) {
    response.status(400).json({ message: error.message });
    return;
  }

  response.status(error.status || 500).json({ message: error.status ? error.message : 'Erro interno do servidor.' });
});

await migrate();

app.listen(port, () => {
  console.log(`API íTech rodando em http://localhost:${port}`);
});
