import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Cable,
  CalendarDays,
  Check,
  Clock,
  Copy,
  DollarSign,
  Eye,
  FileText,
  Heart,
  Headphones,
  Instagram,
  KeyRound,
  Laptop,
  LogOut,
  MapPin,
  MessageCircle,
  MonitorPlay,
  PackageCheck,
  Plus,
  Save,
  ShoppingBag,
  Smartphone,
  Speaker,
  Tablet,
  TrendingUp,
  Trash2,
  Upload,
  UserRound,
  Users,
  Watch,
  X
} from 'lucide-react';
import {
  changeUserAccountPassword,
  createUserAccount,
  getUsers,
  loginUserAccount,
  updateUserAccount,
  uploadProductImages
} from './api.js';
import itechLogo from './assets/logo.jpg';

const DB_KEY = 'itech_store_db_v3';
const CURRENT_USER_KEY = 'itech_current_user_id';
const CURRENT_ADMIN_KEY = 'itech_current_admin_id';
const VISITOR_KEY = 'itech_visitor_id';
const RESERVATION_MS = 5 * 60 * 1000;
const HIDDEN_HOME_CATEGORY_SLUGS = new Set(['apple-tv', 'homepod']);

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const COLOR_OPTIONS = [
  { value: 'pink', label: 'Rosa' },
  { value: 'red', label: 'Vermelho' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'gray', label: 'Cinza' },
  { value: 'black', label: 'Preto' },
  { value: 'white', label: 'Branco' },
  { value: 'orange', label: 'Laranja' },
  { value: 'silver', label: 'Prata' },
  { value: 'midnight', label: 'Grafite' }
];

const ICONS = {
  smartphone: Smartphone,
  laptop: Laptop,
  watch: Watch,
  headphones: Headphones,
  tablet: Tablet,
  cable: Cable,
  tv: MonitorPlay,
  speaker: Speaker
};

const VISUAL_OPTIONS = [
  { value: 'phone', label: 'Celular' },
  { value: 'laptop', label: 'Notebook' },
  { value: 'watch', label: 'Relogio' },
  { value: 'audio', label: 'Fone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'speaker', label: 'Caixa de som' },
  { value: 'accessory', label: 'Acessorio' }
];

const DEFAULT_SETTINGS = {
  storeName: 'íTech',
  tagline: 'A Loja do Seu iPhone',
  heroBadge: 'Novo · iPhone 16 Pro disponível',
  heroTitle: 'A Loja do Seu iPhone',
  heroAccent: 'iPhone',
  heroSubtitle:
    'Produtos Apple originais e certificados, garantia oficial, atendimento especializado e parcelamento facilitado.',
  phoneDisplay: '(71) 99670-4345',
  phoneNumber: '5571996704345',
  instagramUrl: 'https://www.instagram.com/itechcatu/',
  pixKey: '(71) 99670-4345',
  location: 'Catu-BA e Alagoinhas-BA'
};

const DEFAULT_ADMINS = [
  {
    id: 'admin-master',
    name: 'Administrador iTech',
    email: 'admin@itech.com',
    cpf: '11144477735',
    password: '1234',
    status: 'approved',
    createdAt: '2026-05-12T00:00:00.000Z',
    approvedAt: '2026-05-12T00:00:00.000Z'
  }
];

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-iphone',
    slug: 'iphone',
    name: 'iPhone',
    title: 'iPhone',
    description: 'iPhone 16, 15, SE e modelos seminovos certificados',
    icon: 'smartphone',
    nav: true,
    home: true,
    sortOrder: 1
  },
  {
    id: 'cat-mac',
    slug: 'mac',
    name: 'Mac',
    title: 'Mac',
    description: 'MacBook Air, MacBook Pro e iMac para trabalho pesado',
    icon: 'laptop',
    nav: true,
    home: true,
    sortOrder: 2
  },
  {
    id: 'cat-watch',
    slug: 'apple-watch',
    name: 'Apple Watch',
    title: 'Apple Watch',
    description: 'Série 10, Ultra 2 e SE com pulseiras selecionadas',
    icon: 'watch',
    nav: true,
    home: true,
    sortOrder: 3
  },
  {
    id: 'cat-airpods',
    slug: 'airpods',
    name: 'AirPods',
    title: 'AirPods',
    description: 'AirPods Pro, AirPods 4 e AirPods Max',
    icon: 'headphones',
    nav: true,
    home: true,
    sortOrder: 4
  },
  {
    id: 'cat-android',
    slug: 'android',
    name: 'Android',
    title: 'Android',
    description: 'Samsung, Motorola e Xiaomi novos e seminovos',
    icon: 'smartphone',
    nav: true,
    home: true,
    sortOrder: 5
  },
  {
    id: 'cat-speakers',
    slug: 'caixas-de-som',
    name: 'Caixas de som',
    title: 'Caixas de som',
    description: 'JBL, Anker e caixas Bluetooth para qualquer rotina',
    icon: 'speaker',
    nav: true,
    home: true,
    sortOrder: 6
  },
  {
    id: 'cat-ipad',
    slug: 'ipad',
    name: 'iPad',
    title: 'iPad',
    description: 'iPad Pro, Air, mini e acessórios de produtividade',
    icon: 'tablet',
    nav: false,
    home: true,
    sortOrder: 7
  },
  {
    id: 'cat-accessories',
    slug: 'acessorios',
    name: 'Acessórios',
    title: 'Acessórios',
    description: 'Capas, cabos, fontes, MagSafe e proteção',
    icon: 'cable',
    nav: false,
    home: true,
    sortOrder: 8
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'iphone-16-pro',
    category: 'iphone',
    name: 'iPhone 16 Pro',
    tag: 'iPhone',
    condition: 'Novo',
    price: 9299,
    installments: '12x de R$ 774,92',
    description: 'Chip A18 Pro, câmera de 48 MP e tela ProMotion de 6,3 polegadas.',
    specs: ['128 GB', 'Titânio natural', 'Garantia iTech', 'Pronta entrega'],
    color: 'blue',
    visual: 'phone',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'iphone-16',
    category: 'iphone',
    name: 'iPhone 16',
    tag: 'Novo',
    condition: 'Novo',
    price: 7499,
    installments: '12x de R$ 624,92',
    description: 'Câmera Fusion de 48 MP, chip A18 e botão de ação para atalhos rápidos.',
    specs: ['128 GB', 'Ultramarino', 'Lacrado', 'Pronta entrega'],
    color: 'green',
    visual: 'phone',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'iphone-15',
    category: 'iphone',
    name: 'iPhone 15',
    tag: 'Mais vendido',
    condition: 'Novo',
    price: 5299,
    installments: '12x de R$ 441,58',
    description: 'Dynamic Island, câmera principal de 48 MP e acabamento resistente.',
    specs: ['128 GB', 'Preto', 'Garantia iTech', 'USB-C'],
    color: 'black',
    visual: 'phone',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'iphone-14-pro-seminovo',
    category: 'iphone',
    name: 'iPhone 14 Pro',
    tag: 'Seminovo',
    condition: 'Semi-novo',
    price: 4599,
    installments: '12x de R$ 383,25',
    description: 'Tela ProMotion, Dynamic Island, câmeras Pro e bateria revisada.',
    specs: ['256 GB', 'Roxo profundo', 'Saúde 89%', 'Revisado'],
    color: 'midnight',
    visual: 'phone',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'macbook-air-m3',
    category: 'mac',
    name: 'MacBook Air M3',
    tag: 'Mac',
    condition: 'Novo',
    price: 12499,
    installments: '12x de R$ 1.041,58',
    description: 'Chip M3, 8 GB de memória unificada e tela Liquid Retina de 13,6 polegadas.',
    specs: ['256 GB SSD', 'Meia-noite', '8 GB RAM', 'Lacrado'],
    color: 'silver',
    visual: 'laptop',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'macbook-pro-m3-pro',
    category: 'mac',
    name: 'MacBook Pro M3 Pro',
    tag: 'Mac',
    condition: 'Novo',
    price: 18999,
    installments: '12x de R$ 1.583,25',
    description: 'Tela Liquid Retina XDR de 14 polegadas, alto desempenho e bateria longa.',
    specs: ['512 GB SSD', '18 GB RAM', 'Space Black', 'Garantia iTech'],
    color: 'black',
    visual: 'laptop',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'apple-watch-series-10',
    category: 'apple-watch',
    name: 'Apple Watch S10',
    tag: 'Watch',
    condition: 'Novo',
    price: 4099,
    installments: '12x de R$ 341,58',
    description: 'Display de 46 mm, GPS, detecção de queda e acompanhamento de saúde.',
    specs: ['46 mm', 'GPS', 'Pulseira M/L', 'Lacrado'],
    color: 'midnight',
    visual: 'watch',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'apple-watch-ultra-2',
    category: 'apple-watch',
    name: 'Apple Watch Ultra 2',
    tag: 'Watch',
    condition: 'Novo',
    price: 7399,
    installments: '12x de R$ 616,58',
    description: 'Caixa de titânio, GPS preciso, botão de ação e bateria para treinos longos.',
    specs: ['49 mm', 'Titânio', 'GPS + Cellular', 'Garantia iTech'],
    color: 'orange',
    visual: 'watch',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'airpods-pro-2',
    category: 'airpods',
    name: 'AirPods Pro 2',
    tag: 'AirPods',
    condition: 'Novo',
    price: 2299,
    installments: '12x de R$ 191,58',
    description: 'Cancelamento ativo de ruído, áudio adaptativo e estojo MagSafe.',
    specs: ['USB-C', 'MagSafe', 'Áudio espacial', 'Lacrado'],
    color: 'white',
    visual: 'audio',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'airpods-4',
    category: 'airpods',
    name: 'AirPods 4',
    tag: 'AirPods',
    condition: 'Novo',
    price: 1499,
    installments: '12x de R$ 124,92',
    description: 'Novo encaixe, áudio espacial personalizado e integração rápida com iPhone.',
    specs: ['USB-C', 'Áudio espacial', 'Estojo compacto', 'Lacrado'],
    color: 'white',
    visual: 'audio',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'android-galaxy-s25',
    category: 'android',
    name: 'Galaxy S25 Ultra',
    tag: 'Android',
    condition: 'Novo',
    price: 7899,
    installments: '12x de R$ 658,25',
    description: 'Tela grande, câmeras avançadas e alto desempenho para uso intenso.',
    specs: ['256 GB', 'Preto', 'Lacrado', 'Pronta entrega'],
    color: 'black',
    visual: 'phone',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'android-edge-50-seminovo',
    category: 'android',
    name: 'Motorola Edge 50',
    tag: 'Semi-novo',
    condition: 'Semi-novo',
    price: 2299,
    installments: '12x de R$ 191,58',
    description: 'Tela OLED, bom desempenho e aparelho revisado pela loja.',
    specs: ['256 GB', 'Verde', 'Revisado', 'Garantia iTech'],
    color: 'green',
    visual: 'phone',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'speaker-jbl-flip-6',
    category: 'caixas-de-som',
    name: 'JBL Flip 6',
    tag: 'Bluetooth',
    condition: 'Novo',
    price: 899,
    installments: '12x de R$ 74,92',
    description: 'Som potente, bateria longa e resistência para levar para qualquer lugar.',
    specs: ['Bluetooth', 'Preto', 'Lacrada', 'Pronta entrega'],
    color: 'black',
    visual: 'speaker',
    featured: true,
    saleStatus: 'available'
  },
  {
    id: 'speaker-go-4',
    category: 'caixas-de-som',
    name: 'JBL Go 4',
    tag: 'Portátil',
    condition: 'Novo',
    price: 399,
    installments: '12x de R$ 33,25',
    description: 'Caixa compacta com bom volume, ideal para uso diário.',
    specs: ['Bluetooth', 'Azul', 'Lacrada', 'Pronta entrega'],
    color: 'blue',
    visual: 'speaker',
    featured: false,
    saleStatus: 'available'
  },
  {
    id: 'ipad-air-m2',
    category: 'ipad',
    name: 'iPad Air M2',
    tag: 'iPad',
    condition: 'Novo',
    price: 6499,
    installments: '12x de R$ 541,58',
    description: 'Chip M2, Wi-Fi 6E e tela Liquid Retina de 11 polegadas.',
    specs: ['128 GB', 'Azul', 'Wi-Fi', 'Lacrado'],
    color: 'blue',
    visual: 'tablet',
    featured: true,
    saleStatus: 'available'
  }
];

function createDefaultDb() {
  return {
    schemaVersion: 4,
    settings: DEFAULT_SETTINGS,
    categories: DEFAULT_CATEGORIES,
    products: DEFAULT_PRODUCTS.map(normalizeProductRecord),
    users: [],
    admins: DEFAULT_ADMINS,
    favorites: {},
    analytics: { visits: [] },
    orders: [],
    reservations: {}
  };
}

function normalizeDb(db) {
  const base = createDefaultDb();
  const existing = db && typeof db === 'object' ? db : {};
  const categories = [
    ...(existing.categories || []),
    ...base.categories.filter(
      (category) => !(existing.categories || []).some((item) => item.slug === category.slug)
    )
  ];
  const products = [
    ...(existing.products || []),
    ...base.products.filter(
      (product) => !(existing.products || []).some((item) => item.id === product.id)
    )
  ];
  const admins = mergeDefaultAdmins(existing.admins || []);

  return {
    schemaVersion: 4,
    settings: { ...base.settings, ...(existing.settings || {}) },
    categories: categories
      .map((category, index) => ({ ...category, sortOrder: category.sortOrder ?? index + 1 }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    products: products.map(normalizeProductRecord),
    users: existing.users || [],
    admins,
    favorites: existing.favorites || {},
    analytics: normalizeAnalytics(existing.analytics),
    orders: existing.orders || [],
    reservations: existing.reservations || {}
  };
}

function preserveDbShape(db) {
  const existing = db && typeof db === 'object' ? db : {};
  return {
    schemaVersion: existing.schemaVersion || 4,
    settings: { ...DEFAULT_SETTINGS, ...(existing.settings || {}) },
    categories: existing.categories || [],
    products: (existing.products || []).map(normalizeProductRecord),
    users: existing.users || [],
    admins: mergeDefaultAdmins(existing.admins || []),
    favorites: existing.favorites || {},
    analytics: normalizeAnalytics(existing.analytics),
    orders: existing.orders || [],
    reservations: existing.reservations || {}
  };
}

function mergeUsers(existingUsers = [], incomingUsers = []) {
  const users = [...existingUsers];

  incomingUsers.forEach((incomingUser) => {
    const index = users.findIndex(
      (user) =>
        user.id === incomingUser.id ||
        String(user.email || '').toLowerCase() === String(incomingUser.email || '').toLowerCase() ||
        normalizeCpf(user.cpf) === normalizeCpf(incomingUser.cpf)
    );

    if (index >= 0) {
      users[index] = {
        ...users[index],
        ...incomingUser,
        password: users[index].password
      };
      return;
    }

    users.unshift(incomingUser);
  });

  return users;
}

function normalizeAnalytics(analytics) {
  const visits = Array.isArray(analytics?.visits) ? analytics.visits : [];
  return { visits };
}

function readDb() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(DB_KEY) || 'null');
    if (!stored) return createDefaultDb();
    return stored.schemaVersion >= 4 ? preserveDbShape(stored) : normalizeDb(stored);
  } catch {
    return createDefaultDb();
  }
}

function writeDb(db) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function createId(value, prefix = 'item') {
  const slug = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || prefix}-${Date.now().toString(36)}`;
}

function mergeDefaultAdmins(admins) {
  const currentAdmins = Array.isArray(admins) ? admins : [];
  const upgradedAdmins = currentAdmins.map((admin) => {
    const defaultAdmin = DEFAULT_ADMINS.find(
      (item) =>
        item.email.toLowerCase() === String(admin.email || '').toLowerCase() ||
        normalizeCpf(item.cpf) === normalizeCpf(admin.cpf)
    );

    return defaultAdmin ? { ...admin, ...defaultAdmin } : admin;
  });
  const existingKeys = new Set(
    upgradedAdmins.map((admin) => `${String(admin.email || '').toLowerCase()}|${normalizeCpf(admin.cpf)}`)
  );
  const missingDefaults = DEFAULT_ADMINS.filter(
    (admin) => !existingKeys.has(`${admin.email.toLowerCase()}|${normalizeCpf(admin.cpf)}`)
  );

  return [...upgradedAdmins, ...missingDefaults];
}

function normalizeProductImages(product) {
  const sourceImages = Array.isArray(product?.images)
    ? product.images
    : [product?.image, product?.imageUrl].filter(Boolean);

  return sourceImages
    .map((image, index) => {
      const url = typeof image === 'string' ? image : image?.url;
      if (!url) return null;

      return {
        id: typeof image === 'object' && image?.id ? image.id : `${product?.id || 'product'}-image-${index + 1}`,
        url,
        name: typeof image === 'object' && image?.name ? image.name : '',
        alt: typeof image === 'object' && image?.alt ? image.alt : product?.name || 'Produto'
      };
    })
    .filter(Boolean);
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function getStockRowId(productId, color, index) {
  return `${productId || 'product'}-${color || 'color'}-stock-${index + 1}`;
}

function normalizeProductStock(product) {
  const sourceStock = Array.isArray(product?.stock)
    ? product.stock
    : Array.isArray(product?.inventory)
      ? product.inventory
      : [];

  if (!sourceStock.length) {
    const fallbackColor = product?.color || 'black';
    const fallbackQuantity =
      product?.saleStatus === 'sold' || product?.saleStatus === 'out_of_stock'
        ? 0
        : normalizeQuantity(product?.quantity ?? product?.stockQuantity ?? 1);

    return [
      {
        id: getStockRowId(product?.id, fallbackColor, 0),
        color: fallbackColor,
        quantity: fallbackQuantity
      }
    ];
  }

  const byColor = new Map();

  sourceStock.forEach((entry, index) => {
    const color = entry?.color || product?.color || 'black';
    const current = byColor.get(color) || {
      id: entry?.id || getStockRowId(product?.id, color, index),
      color,
      quantity: 0
    };

    current.quantity += normalizeQuantity(entry?.quantity ?? entry?.units ?? entry?.available);
    byColor.set(color, current);
  });

  return Array.from(byColor.values());
}

function normalizeProductRecord(product) {
  const stock = normalizeProductStock(product);
  const primaryColor = stock.find((item) => item.quantity > 0)?.color || stock[0]?.color || product?.color || 'black';
  const stockTotal = stock.reduce((total, item) => total + item.quantity, 0);

  return {
    featured: false,
    saleStatus: 'available',
    specs: [],
    images: [],
    stock: [],
    ...product,
    color: primaryColor,
    saleStatus:
      stockTotal > 0
        ? 'available'
        : product?.saleStatus === 'sold'
          ? 'sold'
          : 'out_of_stock',
    specs: Array.isArray(product?.specs) ? product.specs : [],
    images: normalizeProductImages(product),
    stock
  };
}

function getProductImages(product) {
  return normalizeProductImages(product);
}

function getProductStock(product) {
  return normalizeProductStock(product);
}

function getTotalStock(product) {
  return getProductStock(product).reduce((total, item) => total + item.quantity, 0);
}

async function readProductImageFiles(files, productName) {
  const payload = await uploadProductImages(files, { productName });

  return (payload.images || [])
    .map((image, index) => ({
      id: image.id || `${createId(image.name || productName, 'image')}-${index + 1}`,
      name: image.name || '',
      alt: image.alt || productName || 'Imagem do produto',
      url: image.url
    }))
    .filter((image) => image.url);
}

function readReceiptFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type || 'application/octet-stream',
        dataUrl: String(reader.result)
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getVisitorId() {
  const existingId = window.localStorage.getItem(VISITOR_KEY);
  if (existingId) return existingId;

  const visitorId = createId('visitante', 'visitor');
  window.localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

function getRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const [, first, second] = path.split('/');
  return { path, first: first || 'home', second };
}

function getWhatsAppUrl(settings) {
  const digits = String(settings.phoneNumber || settings.phoneDisplay || '').replace(/\D/g, '');
  const phone = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${phone}?text=Ol%C3%A1%2C%20quero%20comprar%20na%20iTech.`;
}

function normalizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidCpf(value) {
  const digits = normalizeCpf(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  function calculateDigit(factor) {
    let total = 0;
    for (let index = 0; index < factor - 1; index += 1) {
      total += Number(digits[index]) * (factor - index);
    }

    const digit = (total * 10) % 11;
    return digit === 10 ? 0 : digit;
  }

  return calculateDigit(10) === Number(digits[9]) && calculateDigit(11) === Number(digits[10]);
}

function formatCpf(value) {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return value || '';
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCpfInput(value) {
  const digits = normalizeCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatTimer(ms) {
  const safeMs = Math.max(0, ms);
  const minutes = String(Math.floor(safeMs / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((safeMs % 60000) / 1000)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function toDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function startOfDay(value = new Date()) {
  const date = toDate(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(value = new Date()) {
  const date = toDate(value);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(value = new Date()) {
  const date = toDate(value);
  return new Date(date.getFullYear(), 0, 1);
}

function getDateKey(value = new Date()) {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(value) {
  return toDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function isDateOnOrAfter(value, start) {
  return toDate(value).getTime() >= start.getTime();
}

function colorLabel(value) {
  return COLOR_OPTIONS.find((color) => color.value === value)?.label || value;
}

function getReservationKey(productId, color) {
  return `${productId}__${color || 'default'}`;
}

function getReservationProductId(key, reservation) {
  return reservation?.productId || String(key || '').split('__')[0];
}

function getReservationColor(key, reservation, product) {
  return reservation?.color || String(key || '').split('__')[1] || product?.color || 'black';
}

function isReservationActive(reservation, now) {
  return Boolean(reservation && (reservation.proofAttached || !reservation.expiresAt || reservation.expiresAt > now));
}

function reservationBelongsToUser(reservation, user) {
  if (!reservation || !user) return false;
  if (reservation.userId && reservation.userId === user.id) return true;
  if (reservation.customerId && reservation.customerId === user.id) return true;
  if (reservation.customerCpf && normalizeCpf(reservation.customerCpf) === normalizeCpf(user.cpf)) return true;
  if (reservation.customerEmail && String(reservation.customerEmail).toLowerCase() === String(user.email || '').toLowerCase()) {
    return true;
  }
  return false;
}

function getUserActiveReservations(reservations = {}, user, now = Date.now()) {
  return Object.entries(reservations || {})
    .filter(([, reservation]) => reservationBelongsToUser(reservation, user) && isReservationActive(reservation, now))
    .map(([key, reservation]) => ({ key, reservation }));
}

function getReservedQuantity(product, reservations = {}, now = Date.now(), color) {
  return Object.entries(reservations || {}).reduce((total, [key, reservation]) => {
    if (!isReservationActive(reservation, now)) return total;
    if (getReservationProductId(key, reservation) !== product.id) return total;

    const reservationColor = getReservationColor(key, reservation, product);
    if (color && reservationColor !== color) return total;

    return total + Math.max(1, normalizeQuantity(reservation.quantity || 1));
  }, 0);
}

function getStockOptions(product, reservations = {}, now = Date.now()) {
  return getProductStock(product).map((item) => {
    const reserved = getReservedQuantity(product, reservations, now, item.color);
    const availableQuantity = Math.max(0, item.quantity - reserved);

    return {
      ...item,
      reserved,
      availableQuantity
    };
  });
}

function getAvailableQuantity(product, reservations = {}, now = Date.now(), color) {
  const stockOptions = getStockOptions(product, reservations, now);
  const matchingOptions = color ? stockOptions.filter((item) => item.color === color) : stockOptions;

  return matchingOptions.reduce((total, item) => total + item.availableQuantity, 0);
}

function getAvailableStockColor(product, reservations = {}, now = Date.now(), preferredColor) {
  const stockOptions = getStockOptions(product, reservations, now);
  const preferred = stockOptions.find((item) => item.color === preferredColor && item.availableQuantity > 0);

  return preferred?.color || stockOptions.find((item) => item.availableQuantity > 0)?.color || '';
}

function getDisplayColor(product, reservations = {}, now = Date.now(), preferredColor) {
  return (
    preferredColor ||
    product?.selectedColor ||
    getAvailableStockColor(product, reservations, now, product?.color) ||
    getProductStock(product)[0]?.color ||
    product?.color ||
    'black'
  );
}

function stockSummary(product, reservations = {}, now = Date.now()) {
  const availableQuantity = getAvailableQuantity(product, reservations, now);
  if (!availableQuantity) return 'Sem estoque';
  return `${availableQuantity} un. em estoque`;
}

function formatProductColorName(product, color) {
  return color ? `${product.name} - ${colorLabel(color)}` : product.name;
}

function withSelectedProductColor(product, color, reservations = {}, now = Date.now()) {
  const selectedColor = getDisplayColor(product, reservations, now, color);

  return {
    ...product,
    color: selectedColor,
    selectedColor
  };
}

function getProductStatus(product, reservations, now, color) {
  const availableQuantity = getAvailableQuantity(product, reservations, now, color);
  const totalStock = getTotalStock(product);

  if (availableQuantity > 0) {
    return {
      blocked: false,
      label: availableQuantity === 1 ? '1 disponivel' : `${availableQuantity} disponiveis`,
      reservation: null,
      availableQuantity
    };
  }

  const reservation = Object.entries(reservations || {}).find(([key, item]) => {
    if (!isReservationActive(item, now)) return false;
    if (getReservationProductId(key, item) !== product.id) return false;
    return color ? getReservationColor(key, item, product) === color : true;
  })?.[1] || null;

  if (reservation) {
    return {
      blocked: true,
      label: 'Reservado',
      reservation,
      availableQuantity: 0
    };
  }

  return {
    blocked: true,
    label: totalStock > 0 || product.condition === 'Novo' ? 'Esgotado' : 'Vendido',
    reservation: null,
    availableQuantity: 0
  };
}

function decreaseProductStock(product, color, quantity = 1) {
  let remaining = Math.max(1, normalizeQuantity(quantity || 1));
  const stock = getProductStock(product);
  const nextStock = stock.map((item) => {
    if (remaining <= 0) return item;
    if (color && item.color !== color) return item;

    const decreaseBy = Math.min(item.quantity, remaining);
    remaining -= decreaseBy;
    return { ...item, quantity: item.quantity - decreaseBy };
  });

  if (remaining > 0 && !color) {
    nextStock.forEach((item, index) => {
      if (remaining <= 0) return;
      const decreaseBy = Math.min(item.quantity, remaining);
      remaining -= decreaseBy;
      nextStock[index] = { ...item, quantity: item.quantity - decreaseBy };
    });
  }

  const primaryColor = nextStock.find((item) => item.quantity > 0)?.color || nextStock[0]?.color || product.color;
  const totalStock = nextStock.reduce((total, item) => total + item.quantity, 0);

  return {
    ...product,
    color: primaryColor,
    stock: nextStock,
    saleStatus: totalStock > 0 ? 'available' : product.condition === 'Novo' ? 'out_of_stock' : 'sold'
  };
}

function decreaseStockForOrder(product, orderItems) {
  return orderItems
    .filter((item) => item.productId === product.id)
    .reduce((currentProduct, item) => decreaseProductStock(currentProduct, item.color, item.quantity || 1), product);
}

function applyFilters(items, filters, reservations = {}, now = Date.now()) {
  let filtered = [...items];

  if (filters.hideUnavailable) {
    filtered = filtered.filter((product) => !getProductStatus(product, reservations, now).blocked);
  }

  if (filters.conditions.length) {
    filtered = filtered.filter((product) => filters.conditions.includes(product.condition));
  }

  if (filters.colors.length) {
    filtered = filtered.filter((product) =>
      getProductStock(product).some((item) => filters.colors.includes(item.color))
    );
  }

  if (filters.sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (filters.sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

export default function App() {
  const [db, setDb] = useState(readDb);
  const [route, setRoute] = useState(getRoute);
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState('');
  const [currentUserId, setCurrentUserId] = useState(
    () => window.localStorage.getItem(CURRENT_USER_KEY) || ''
  );
  const [currentAdminId, setCurrentAdminId] = useState(
    () => window.sessionStorage.getItem(CURRENT_ADMIN_KEY) || ''
  );

  const currentUser = db.users.find((user) => user.id === currentUserId);
  const currentAdmin = currentUser
    ? null
    : db.admins.find((admin) => admin.id === currentAdminId && admin.status === 'approved');
  const navCategories = db.categories.filter((category) => category.nav);
  const homeCategories = db.categories.filter(
    (category) => category.home && !HIDDEN_HOME_CATEGORY_SLUGS.has(category.slug)
  );
  const favoriteOwnerId = currentUser?.id || '';
  const favoriteIds = useMemo(
    () => (favoriteOwnerId ? new Set(db.favorites?.[favoriteOwnerId] || []) : new Set()),
    [db.favorites, favoriteOwnerId]
  );
  useEffect(() => {
    writeDb(db);
  }, [db]);

  useEffect(() => {
    window.localStorage.removeItem(CURRENT_ADMIN_KEY);
  }, []);

  useEffect(() => {
    let mounted = true;

    getUsers()
      .then((payload) => {
        if (!mounted) return;
        updateDb((current) => ({
          ...current,
          users: mergeUsers(current.users, payload.users || [])
        }));
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(getRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const reservations = { ...(db.reservations || {}) };
    let changed = false;

    Object.entries(reservations).forEach(([productId, reservation]) => {
      if (!reservation.proofAttached && reservation.expiresAt && reservation.expiresAt <= now) {
        delete reservations[productId];
        changed = true;
      }
    });

    if (changed) {
      setDb((current) => ({ ...current, reservations }));
    }
  }, [now, db.reservations]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const createdAt = new Date().toISOString();
    const account = currentUser
      ? {
          role: 'user',
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email
        }
      : currentAdmin
        ? {
            role: 'admin',
            userId: currentAdmin.id,
            userName: currentAdmin.name,
            userEmail: currentAdmin.email
          }
        : {
            role: 'guest',
            userId: '',
            userName: 'Visitante',
            userEmail: ''
          };

    const visit = {
      id: createId(`${account.role}-${route.path}`, 'visit'),
      visitorId: getVisitorId(),
      path: route.path,
      createdAt,
      dateKey: getDateKey(createdAt),
      ...account
    };

    setDb((current) => {
      const visits = current.analytics?.visits || [];
      const lastVisit = visits[visits.length - 1];
      const lastVisitTime = lastVisit ? new Date(lastVisit.createdAt).getTime() : 0;
      const isDuplicate =
        lastVisit &&
        lastVisit.path === visit.path &&
        lastVisit.role === visit.role &&
        lastVisit.userId === visit.userId &&
        Date.now() - lastVisitTime < 5000;

      if (isDuplicate) return current;

      return preserveDbShape({
        ...current,
        analytics: {
          ...(current.analytics || {}),
          visits: [...visits.slice(-999), visit]
        }
      });
    });
  }, [route.path, currentUserId, currentAdminId]);

  function updateDb(updater) {
    setDb((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      return preserveDbShape(next);
    });
  }

  function navigate(path, scrollTarget) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(getRoute());

    window.setTimeout(() => {
      if (scrollTarget) {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 0);
  }

  function requireUserAccount(actionLabel) {
    if (currentUser) return true;

    setNotice(`${actionLabel} exige uma conta. Crie sua conta ou entre para continuar.`);
    navigate('/cadastro');
    return false;
  }

  async function loginUser(email, password) {
    try {
      const payload = await loginUserAccount(email, password);
      const user = payload.user;

      updateDb((current) => ({ ...current, users: mergeUsers(current.users, [user]) }));
      window.localStorage.removeItem(CURRENT_ADMIN_KEY);
      window.sessionStorage.removeItem(CURRENT_ADMIN_KEY);
      window.localStorage.setItem(CURRENT_USER_KEY, user.id);
      setCurrentUserId(user.id);
      setCurrentAdminId('');
      setNotice(`Bem-vindo, ${user.name}.`);
      navigate('/');
    } catch (error) {
      setNotice(error.message || 'Usuario ou senha invalidos.');
    }
  }

  async function registerUser(payload) {
    const cpf = normalizeCpf(payload.cpf);
    if (!isValidCpf(cpf)) {
      setNotice('Informe um CPF valido para abrir a conta.');
      return;
    }

    try {
      const response = await createUserAccount({ ...payload, cpf });
      const user = response.user;

      updateDb((current) => ({ ...current, users: mergeUsers(current.users, [user]) }));
      window.localStorage.removeItem(CURRENT_ADMIN_KEY);
      window.sessionStorage.removeItem(CURRENT_ADMIN_KEY);
      window.localStorage.setItem(CURRENT_USER_KEY, user.id);
      setCurrentUserId(user.id);
      setCurrentAdminId('');
      setNotice('Cadastro criado e salvo no backend.');
      navigate('/');
    } catch (error) {
      setNotice(error.message || 'Nao foi possivel criar o cadastro.');
    }
  }

  async function updateUserProfile(payload) {
    if (!currentUser) return false;

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();

    if (!name || !email) {
      setNotice('Nome e e-mail sao obrigatorios.');
      return false;
    }

    try {
      const response = await updateUserAccount(currentUser.id, {
        name,
        email,
        phone
      });

      updateDb((current) => ({
        ...current,
        users: mergeUsers(current.users, [response.user])
      }));

      setNotice('Dados do perfil atualizados no backend.');
      return true;
    } catch (error) {
      setNotice(error.message || 'Nao foi possivel atualizar o perfil.');
      return false;
    }
  }

  async function changeUserPassword(payload) {
    if (!currentUser) return false;

    const newPassword = String(payload.newPassword || '');
    const confirmPassword = String(payload.confirmPassword || '');

    if (newPassword.length < 4) {
      setNotice('A nova senha precisa ter pelo menos 4 caracteres.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setNotice('As novas senhas nao conferem.');
      return false;
    }

    try {
      await changeUserAccountPassword(currentUser.id, payload);
      setNotice('Senha alterada no backend.');
      return true;
    } catch (error) {
      setNotice(error.message || 'Nao foi possivel alterar a senha.');
      return false;
    }
  }

  function logoutUser() {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUserId('');
    setNotice('Você saiu da conta.');
  }

  function loginAdmin(email, password) {
    const admin = db.admins.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.status === 'approved'
    );

    if (!admin) {
      setNotice('Admin inválido, pendente ou não aprovado.');
      return;
    }

    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(CURRENT_ADMIN_KEY);
    window.sessionStorage.setItem(CURRENT_ADMIN_KEY, admin.id);
    setCurrentUserId('');
    setCurrentAdminId(admin.id);
    setNotice(`Admin conectado: ${admin.name}.`);
  }

  function registerAdmin(payload) {
    const cpf = normalizeCpf(payload.cpf);
    if (!isValidCpf(cpf)) {
      setNotice('Informe um CPF valido para solicitar acesso admin.');
      return;
    }

    if (db.admins.some((admin) => admin.email.toLowerCase() === payload.email.toLowerCase())) {
      setNotice('Esse e-mail já solicitou acesso admin.');
      return;
    }

    if (
      db.admins.some((admin) => normalizeCpf(admin.cpf) === cpf) ||
      db.users.some((user) => normalizeCpf(user.cpf) === cpf)
    ) {
      setNotice('Esse CPF ja esta cadastrado.');
      return;
    }

    const hasApprovedAdmin = db.admins.some((admin) => admin.status === 'approved');
    const admin = {
      ...payload,
      cpf,
      id: createId(payload.email, 'admin'),
      status: hasApprovedAdmin ? 'pending' : 'approved',
      createdAt: new Date().toISOString()
    };

    updateDb((current) => ({ ...current, admins: [...current.admins, admin] }));

    if (admin.status === 'approved') {
      window.localStorage.removeItem(CURRENT_USER_KEY);
      window.localStorage.removeItem(CURRENT_ADMIN_KEY);
      window.sessionStorage.setItem(CURRENT_ADMIN_KEY, admin.id);
      setCurrentUserId('');
      setCurrentAdminId(admin.id);
      setNotice('Primeiro admin criado e aprovado automaticamente.');
      return;
    }

    setNotice('Solicitação enviada. Um admin aprovado precisa validar seu acesso.');
  }

  function logoutAdmin() {
    window.localStorage.removeItem(CURRENT_ADMIN_KEY);
    window.sessionStorage.removeItem(CURRENT_ADMIN_KEY);
    setCurrentAdminId('');
    setNotice('Admin desconectado.');
  }

  function upsertReservation(product, mode, color) {
    if (!requireUserAccount(mode === 'reserve' ? 'Reservar' : 'Comprar')) return;

    const activeReservation = getUserActiveReservations(db.reservations, currentUser, now)[0];
    if (activeReservation) {
      setNotice('Conclua ou aguarde a validação da sua compra/reserva atual antes de iniciar outra.');
      navigate('/perfil');
      return;
    }

    const selectedColor = getAvailableStockColor(
      product,
      db.reservations,
      now,
      color || product.selectedColor || product.color
    );

    if (!selectedColor) {
      setNotice('Esse produto nao tem unidades disponiveis nessa cor.');
      return;
    }

    const percent = mode === 'reserve' ? 50 : 100;
    const reservationKey = getReservationKey(product.id, selectedColor);
    const reservation = {
      productId: product.id,
      color: selectedColor,
      quantity: 1,
      userId: currentUser.id,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerCpf: currentUser.cpf,
      mode,
      percent,
      amount: product.price * (percent / 100),
      expiresAt: Date.now() + RESERVATION_MS,
      proofAttached: false,
      receiptName: '',
      orderId: '',
      createdAt: new Date().toISOString()
    };

    updateDb((current) => ({
      ...current,
      reservations: { ...current.reservations, [reservationKey]: reservation }
    }));
    setNotice(`${mode === 'reserve' ? 'Reserva' : 'Compra'} iniciada. Conclua pelo seu perfil em ate 5 minutos.`);
    navigate('/perfil');
  }

  async function attachReceipt(file, reservationKey) {
    if (!file) return;
    const activeReservationKey = reservationKey || getUserActiveReservations(db.reservations, currentUser, now)[0]?.key;
    if (!activeReservationKey) return;
    if (!currentUser) {
      setNotice('Entre ou crie uma conta para concluir a compra.');
      navigate('/cadastro');
      return;
    }

    const reservation = db.reservations[activeReservationKey];
    const product = db.products.find((item) => item.id === (reservation?.productId || activeReservationKey));
    if (!product || !reservation) return;
    const selectedColor = getReservationColor(activeReservationKey, reservation, product);

    let receiptFile;
    try {
      receiptFile = await readReceiptFile(file);
    } catch {
      setNotice('Nao foi possivel ler o comprovante. Tente anexar novamente.');
      return;
    }

    const orderId = reservation.orderId || createId(`${product.id}-pedido`, 'order');
    const order = {
      id: orderId,
      productId: product.id,
      productColor: selectedColor,
      productName: formatProductColorName(product, selectedColor),
      reservationKeys: [activeReservationKey],
      items: [
        {
          productId: product.id,
          productName: product.name,
          color: selectedColor,
          colorLabel: colorLabel(selectedColor),
          amount: reservation.amount,
          condition: product.condition,
          quantity: 1
        }
      ],
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerCpf: currentUser.cpf,
      amount: reservation.amount,
      percent: reservation.percent,
      mode: reservation.mode,
      receiptName: receiptFile.name,
      receiptType: receiptFile.type,
      receiptDataUrl: receiptFile.dataUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    updateDb((current) => {
      const orders = current.orders.some((item) => item.id === orderId)
        ? current.orders.map((item) => (item.id === orderId ? { ...item, ...order } : item))
        : [...current.orders, order];

      return {
        ...current,
        orders,
        reservations: {
          ...current.reservations,
          [activeReservationKey]: {
            ...current.reservations[activeReservationKey],
            proofAttached: true,
            receiptName: receiptFile.name,
            receiptType: receiptFile.type,
            receiptDataUrl: receiptFile.dataUrl,
            orderId,
            expiresAt: null
          }
        }
      };
    });

    setNotice('Comprovante enviado para validação no painel admin.');
  }

  function copyPixKey() {
    window.navigator.clipboard?.writeText(db.settings.pixKey);
    setNotice('Chave Pix copiada.');
  }

  function toggleFavorite(productId) {
    if (!requireUserAccount('Favoritar')) return;

    const wasFavorite = favoriteIds.has(productId);

    updateDb((current) => {
      const currentFavorites = new Set(current.favorites?.[favoriteOwnerId] || []);

      if (currentFavorites.has(productId)) {
        currentFavorites.delete(productId);
      } else {
        currentFavorites.add(productId);
      }

      return {
        ...current,
        favorites: {
          ...(current.favorites || {}),
          [favoriteOwnerId]: Array.from(currentFavorites)
        }
      };
    });

    setNotice(wasFavorite ? 'Produto removido dos favoritos.' : 'Produto adicionado aos favoritos.');
  }

  function renderPage() {
    if (route.path === '/') {
      return (
        <HomePage
          db={db}
          navCategories={navCategories}
          homeCategories={homeCategories}
          navigate={navigate}
          now={now}
          favoriteIds={favoriteIds}
          onCheckout={upsertReservation}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'produtos') {
      return (
        <CollectionPage
          title="Todos os produtos"
          subtitle="Catálogo completo da iTech para comprar ou reservar direto pelo site."
          products={db.products}
          activeSlug="all"
          categories={navCategories}
          reservations={db.reservations}
          now={now}
          navigate={navigate}
          onCheckout={upsertReservation}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'favoritos') {
      if (!currentUser) {
        return <AuthRequiredPage navigate={navigate} />;
      }

      const favoriteProducts = db.products.filter((product) => favoriteIds.has(product.id));

      return (
        <CollectionPage
          title="Favoritos"
          subtitle="Produtos que voce marcou com coracao para encontrar de novo rapidinho."
          products={favoriteProducts}
          activeSlug="favorites"
          categories={navCategories}
          reservations={db.reservations}
          now={now}
          navigate={navigate}
          onCheckout={upsertReservation}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'perfil') {
      if (!currentUser) {
        return <AuthRequiredPage navigate={navigate} />;
      }

      const favoriteProducts = db.products.filter((product) => favoriteIds.has(product.id));

      return (
        <CustomerProfilePage
          db={db}
          user={currentUser}
          favoriteProducts={favoriteProducts}
          favoriteIds={favoriteIds}
          reservations={db.reservations}
          now={now}
          navigate={navigate}
          onUpdateProfile={updateUserProfile}
          onChangePassword={changeUserPassword}
          onLogout={logoutUser}
          onCheckout={upsertReservation}
          onReceipt={attachReceipt}
          onCopyPix={copyPixKey}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'categoria') {
      const category = db.categories.find((item) => item.slug === route.second);
      if (!category) return <NotFound navigate={navigate} />;

      return (
        <CollectionPage
          title={category.title || category.name}
          subtitle={category.description}
          products={db.products.filter((product) => product.category === category.slug)}
          activeSlug={category.slug}
          categories={navCategories}
          reservations={db.reservations}
          now={now}
          navigate={navigate}
          onCheckout={upsertReservation}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'produto') {
      const product = db.products.find((item) => item.id === route.second);
      if (!product) return <NotFound navigate={navigate} />;

      return (
        <ProductPage
          product={product}
          products={db.products}
          categories={db.categories}
          reservations={db.reservations}
          settings={db.settings}
          now={now}
          navigate={navigate}
          onCheckout={upsertReservation}
          isFavorite={favoriteIds.has(product.id)}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (route.first === 'login') {
      return <UserAuthPage mode="login" navigate={navigate} onLogin={loginUser} onRegister={registerUser} />;
    }

    if (route.first === 'cadastro') {
      return <UserAuthPage mode="register" navigate={navigate} onLogin={loginUser} onRegister={registerUser} />;
    }

    if (route.first === 'admin') {
      return (
        <AdminPage
          db={db}
          currentAdmin={currentAdmin}
          navigate={navigate}
          onLogin={loginAdmin}
          onRegister={registerAdmin}
          onLogout={logoutAdmin}
          updateDb={updateDb}
          setNotice={setNotice}
        />
      );
    }

    return <NotFound navigate={navigate} />;
  }

  return (
    <>
      <Navbar
        settings={db.settings}
        categories={navCategories}
        currentUser={currentUser}
        favoriteCount={favoriteIds.size}
        route={route}
        navigate={navigate}
      />
      <main>{renderPage()}</main>
      <Footer settings={db.settings} categories={navCategories} navigate={navigate} />
      {notice ? <div className="toast" role="status">{notice}</div> : null}
    </>
  );
}

function AppLink({ to, navigate, children, className, scrollTarget, ...props }) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to, scrollTarget);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function Navbar({ settings, categories, currentUser, favoriteCount, route, navigate }) {
  return (
    <header className="site-header">
      <div className="top-line" />
      <nav className="nav-shell" aria-label="Navegação principal">
        <AppLink className="brand" to="/" navigate={navigate} aria-label={`${settings.storeName} início`}>
          <img src={itechLogo} alt={settings.storeName} />
        </AppLink>

        <div className="nav-links">
          {categories.map((category) => (
            <AppLink
              key={category.id}
              to={`/categoria/${category.slug}`}
              navigate={navigate}
              aria-current={route.second === category.slug ? 'page' : undefined}
            >
              {category.name}
            </AppLink>
          ))}
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <AppLink className="nav-plain" to="/perfil" navigate={navigate}>
              {currentUser.name}
            </AppLink>
          ) : (
            <AppLink className="nav-plain" to="/login" navigate={navigate}>
              Entrar
            </AppLink>
          )}
          <AppLink className="nav-action" to="/produtos" navigate={navigate}>
            <ShoppingBag size={16} aria-hidden="true" />
            Comprar
          </AppLink>
          <AppLink className="nav-favorite" to="/favoritos" navigate={navigate} aria-label="Ver favoritos">
            <Heart size={16} aria-hidden="true" />
            {favoriteCount ? <span>{favoriteCount}</span> : null}
          </AppLink>
        </div>
      </nav>
    </header>
  );
}

function HomePage({ db, navCategories, homeCategories, navigate, now, favoriteIds, onCheckout, onToggleFavorite }) {
  const featured = db.products.filter((product) => product.featured).slice(0, 8);

  return (
    <>
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{db.settings.heroBadge}</p>
          <h1>
            {db.settings.heroTitle.replace(db.settings.heroAccent, '')}
            <span>{db.settings.heroAccent}</span>
          </h1>
          <p className="hero-subtitle">{db.settings.heroSubtitle}</p>
          <div className="hero-actions">
            <AppLink className="button primary" to="/produtos" navigate={navigate}>
              Ver produtos
              <ArrowRight size={18} aria-hidden="true" />
            </AppLink>
            <a className="button secondary" href={getWhatsAppUrl(db.settings)} target="_blank" rel="noreferrer">
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </a>
            <a className="button secondary" href={db.settings.instagramUrl} target="_blank" rel="noreferrer">
              <Instagram size={18} aria-hidden="true" />
              Instagram
            </a>
          </div>
        </div>

        <div className="hero-display" aria-hidden="true">
          <PhoneMockup storeName={db.settings.storeName} />
          <div className="device-note">
            <strong>iPhone 16 Pro</strong>
            <span>Garantia oficial · 12x no cartão</span>
          </div>
        </div>
      </section>

      <section className="section categories-section" id="categorias">
        <SectionHeader
          label="Categorias"
          title="Encontre o que procura"
          subtitle="Produtos Apple, Android e acessórios selecionados para a sua rotina."
        />
        <div className="category-grid">
          {homeCategories.map((category) => (
            <CategoryCard key={category.id} category={category} navigate={navigate} />
          ))}
        </div>
      </section>

      <section className="section products-section" id="produtos">
        <SectionHeader
          label="Destaques"
          title="Produtos em destaque"
          subtitle="Mais vendidos, lançamentos e escolhas para sair da loja pronto."
        />
        <div className="product-rail" aria-label="Produtos em destaque">
          <div className="product-track">
            {[...featured, ...featured].map((product, index) => (
              <HomeProductCard
                key={`${product.id}-${index}`}
                product={product}
                reservations={db.reservations}
                now={now}
                navigate={navigate}
                onCheckout={onCheckout}
                isFavorite={favoriteIds.has(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      <StoreHours location={db.settings.location} />
    </>
  );
}

function CollectionPage({
  title,
  subtitle,
  products,
  activeSlug,
  categories,
  reservations,
  now,
  navigate,
  onCheckout,
  favoriteIds,
  onToggleFavorite
}) {
  const [filters, setFilters] = useState({ conditions: [], colors: [], sort: '', hideUnavailable: false });
  const filteredProducts = useMemo(
    () => applyFilters(products, filters, reservations, now),
    [products, filters, reservations, now]
  );

  useEffect(() => {
    setFilters({ conditions: [], colors: [], sort: '', hideUnavailable: false });
  }, [activeSlug]);

  return (
    <>
      <section className="collection-hero">
        <Breadcrumb navigate={navigate} items={[{ label: 'Início', to: '/' }]} current={title} />
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <div className="filter-row" aria-label="Filtros de produtos">
        <AppLink
          className={`filter-chip ${activeSlug === 'all' ? 'active' : ''}`}
          to="/produtos"
          navigate={navigate}
        >
          Todos
        </AppLink>
        {categories.map((category) => (
          <AppLink
            key={category.id}
            className={`filter-chip ${activeSlug === category.slug ? 'active' : ''}`}
            to={`/categoria/${category.slug}`}
            navigate={navigate}
          >
            {category.name}
          </AppLink>
        ))}
    </div>

      <section className="section collection-products">
        <ProductFilters
          products={products}
          filters={filters}
          setFilters={setFilters}
          reservations={reservations}
          now={now}
        />
        <div className="result-line">{filteredProducts.length} produto(s) encontrado(s)</div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              reservations={reservations}
              now={now}
              navigate={navigate}
              onCheckout={onCheckout}
              isFavorite={favoriteIds.has(product.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

    </>
  );
}

function ProductFilters({ products, filters, setFilters, reservations, now }) {
  const availableColors = COLOR_OPTIONS.filter((color) =>
    products.some((product) => getProductStock(product).some((item) => item.color === color.value))
  );
  const unavailableCount = products.filter((product) => getProductStatus(product, reservations, now).blocked).length;

  function toggleCondition(condition) {
    setFilters((current) => ({
      ...current,
      conditions: current.conditions.includes(condition)
        ? current.conditions.filter((item) => item !== condition)
        : [...current.conditions, condition]
    }));
  }

  function toggleColor(color) {
    setFilters((current) => ({
      ...current,
      colors: current.colors.includes(color)
        ? current.colors.filter((item) => item !== color)
        : [...current.colors, color]
    }));
  }

  return (
    <aside className="filters-panel" aria-label="Filtros">
      <div>
        <strong>Condição</strong>
        <div className="check-row">
          {['Novo', 'Semi-novo'].map((condition) => (
            <label key={condition}>
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition)}
                onChange={() => toggleCondition(condition)}
              />
              {condition}
            </label>
          ))}
        </div>
      </div>

      <div>
        <strong>Cores</strong>
        <div className="swatch-row">
          {availableColors.map((color) => (
            <button
              className={`swatch-option ${filters.colors.includes(color.value) ? 'active' : ''}`}
              type="button"
              key={color.value}
              onClick={() => toggleColor(color.value)}
              title={color.label}
            >
              <span className={`swatch ${color.value}`} />
              {color.label}
            </button>
          ))}
        </div>
      </div>

      <label className="sort-select">
        <strong>Ordenar</strong>
        <select
          value={filters.sort}
          onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
        >
          <option value="">Padrão</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </label>

      <div className="availability-filter">
        <strong>Disponibilidade</strong>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={filters.hideUnavailable}
            onChange={(event) => setFilters((current) => ({ ...current, hideUnavailable: event.target.checked }))}
          />
          <span>Ocultar indisponiveis</span>
        </label>
        <small>{unavailableCount} produto(s) indisponivel(is)</small>
      </div>
    </aside>
  );
}

function ProductPage({
  product,
  products,
  categories,
  reservations,
  settings,
  now,
  navigate,
  onCheckout,
  isFavorite,
  favoriteIds,
  onToggleFavorite
}) {
  const stockOptions = getStockOptions(product, reservations, now);
  const firstAvailableColor = getAvailableStockColor(product, reservations, now, product.color);
  const [selectedColor, setSelectedColor] = useState(firstAvailableColor || product.color);
  const activeColor = selectedColor || firstAvailableColor || product.color;
  const displayProduct = withSelectedProductColor(product, activeColor, reservations, now);
  const status = getProductStatus(product, reservations, now, activeColor);
  const category = categories.find((item) => item.slug === product.category);
  const similar = products.filter((item) => item.category === product.category && item.id !== product.id);
  const otherProducts = products.filter((item) => item.category !== product.category && item.id !== product.id);
  const carouselProducts = otherProducts.length > 1 ? [...otherProducts, ...otherProducts] : otherProducts;

  useEffect(() => {
    setSelectedColor(firstAvailableColor || getProductStock(product)[0]?.color || product.color);
  }, [product.id, firstAvailableColor, product.color]);

  return (
    <>
      <section className="detail-page">
        <Breadcrumb
          navigate={navigate}
          items={[
            { label: 'Início', to: '/' },
            { label: category?.name || 'Produtos', to: `/categoria/${product.category}` }
          ]}
          current={product.name}
        />

        <div className="detail-layout">
          <ProductGallery product={displayProduct} />

          <div className="detail-copy">
            <div className="detail-status-row">
              <span className={`stock-badge ${status.blocked ? 'blocked' : 'available'}`}>
                {status.label}
              </span>
              <FavoriteButton
                productName={product.name}
                active={isFavorite}
                onClick={() => onToggleFavorite(product.id)}
              />
            </div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>

            <div className="detail-price">
              <strong>{currency.format(product.price)}</strong>
              <span>{product.installments}</span>
            </div>

            <div className="color-selector">
              <strong>Cores em estoque</strong>
              <div className="swatch-row">
                {stockOptions.map((option) => (
                  <button
                    className={`swatch-option ${activeColor === option.color ? 'active' : ''}`}
                    type="button"
                    key={option.id}
                    disabled={!option.availableQuantity}
                    onClick={() => setSelectedColor(option.color)}
                    title={`${colorLabel(option.color)} - ${option.availableQuantity} unidade(s)`}
                  >
                    <span className={`swatch ${option.color}`} />
                    {colorLabel(option.color)}
                    <small>{option.availableQuantity} un.</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="product-button dark"
                type="button"
                disabled={status.blocked}
                onClick={() => onCheckout(product, 'buy', activeColor)}
              >
                Comprar
              </button>
              <button
                className="product-button secondary"
                type="button"
                disabled={status.blocked}
                onClick={() => onCheckout(product, 'reserve', activeColor)}
              >
                Reservar com 50%
              </button>
              <a className="product-button secondary" href={getWhatsAppUrl(settings)} target="_blank" rel="noreferrer">
                Tirar dúvida
              </a>
            </div>

            <dl className="spec-list">
              {product.specs.map((spec, index) => (
                <div className="spec-item" key={`${spec}-${index}`}>
                  <dt>{['Capacidade', 'Cor', 'Status', 'Entrega'][index] ?? 'Detalhe'}</dt>
                  <dd>{spec}</dd>
                </div>
              ))}
              <div className="spec-item">
                <dt>Condição</dt>
                <dd>{product.condition}</dd>
              </div>
              <div className="spec-item">
                <dt>Cor selecionada</dt>
                <dd>{colorLabel(activeColor)}</dd>
              </div>
              <div className="spec-item">
                <dt>Estoque</dt>
                <dd>{stockSummary(product, reservations, now)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section categories-section">
        <SectionHeader
          label="Semelhantes"
          title="Produtos semelhantes"
          subtitle={`Outras opções de ${category?.name || 'produto'} disponíveis na iTech.`}
        />
        <div className="similar-rail">
          {similar.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              reservations={reservations}
              now={now}
              navigate={navigate}
              onCheckout={onCheckout}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {otherProducts.length ? (
        <section className="section more-products-section">
          <SectionHeader
            label="Demais produtos"
            title="Demais produtos"
            subtitle="Continue explorando outras categorias e ofertas disponiveis na iTech."
          />
          <div className="product-rail detail-carousel" aria-label="Demais produtos">
            <div className={`product-track ${otherProducts.length > 1 ? '' : 'static-track'}`}>
              {carouselProducts.map((item, index) => (
                <ProductCard
                  key={`${item.id}-other-${index}`}
                  product={item}
                  reservations={reservations}
                  now={now}
                  navigate={navigate}
                  onCheckout={onCheckout}
                  isFavorite={favoriteIds.has(item.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function HomeProductCard({ product, reservations, now, navigate, onCheckout, isFavorite, onToggleFavorite }) {
  const status = getProductStatus(product, reservations, now);
  const selectedColor = getAvailableStockColor(product, reservations, now, product.color);
  const displayProduct = withSelectedProductColor(product, selectedColor, reservations, now);

  return (
    <article className={`product-card ${status.blocked ? 'is-blocked' : ''}`}>
      {status.blocked ? <span className="stock-badge blocked">{status.label}</span> : null}
      <FavoriteButton
        productName={product.name}
        active={isFavorite}
        onClick={() => onToggleFavorite(product.id)}
      />
      <AppLink className="product-link" to={`/produto/${product.id}`} navigate={navigate}>
        <ProductVisual product={displayProduct} />
        <span className="product-badge">{product.tag}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <StockSwatches product={product} reservations={reservations} now={now} />
        <strong className="price">{currency.format(product.price)}</strong>
      </AppLink>
      <div className="card-actions">
        <button type="button" disabled={status.blocked} onClick={() => onCheckout(product, 'buy', selectedColor)}>
          Comprar agora
        </button>
      </div>
    </article>
  );
}

function ProductCard({ product, reservations, now, navigate, onCheckout, isFavorite, onToggleFavorite }) {
  const status = getProductStatus(product, reservations, now);
  const selectedColor = getAvailableStockColor(product, reservations, now, product.color);
  const displayProduct = withSelectedProductColor(product, selectedColor, reservations, now);

  return (
    <article className={`product-card ${status.blocked ? 'is-blocked' : ''}`}>
      {status.blocked ? <span className="stock-badge blocked">{status.label}</span> : null}
      <FavoriteButton
        productName={product.name}
        active={isFavorite}
        onClick={() => onToggleFavorite(product.id)}
      />
      <AppLink className="product-link" to={`/produto/${product.id}`} navigate={navigate}>
        <ProductVisual product={displayProduct} />
        <span className="product-badge">{product.tag}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-meta">
          <span>{product.condition}</span>
          <span>{stockSummary(product, reservations, now)}</span>
        </div>
        <StockSwatches product={product} reservations={reservations} now={now} />
        <strong className="price">{currency.format(product.price)}</strong>
        <span className="installments">{product.installments}</span>
      </AppLink>
      <div className="card-actions">
        <button type="button" disabled={status.blocked} onClick={() => onCheckout(product, 'buy', selectedColor)}>
          Comprar
        </button>
        <button
          className="secondary-action"
          type="button"
          disabled={status.blocked}
          onClick={() => onCheckout(product, 'reserve', selectedColor)}
        >
          Reservar
        </button>
      </div>
    </article>
  );
}

function StockSwatches({ product, reservations, now }) {
  const options = getStockOptions(product, reservations, now);

  return (
    <div className="stock-swatch-row" aria-label="Cores em estoque">
      {options.map((option) => (
        <span
          className={`stock-swatch ${option.availableQuantity ? '' : 'is-empty'}`}
          key={option.id}
          title={`${colorLabel(option.color)} - ${option.availableQuantity} unidade(s)`}
        >
          <span className={`swatch ${option.color}`} />
          <span>{option.availableQuantity}</span>
        </span>
      ))}
    </div>
  );
}

function CategoryCard({ category, navigate }) {
  const Icon = ICONS[category.icon] || Smartphone;
  return (
    <AppLink className="category-card" to={`/categoria/${category.slug}`} navigate={navigate}>
      <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
      <strong>{category.name}</strong>
      <span>{category.description}</span>
    </AppLink>
  );
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="section-heading">
      <p className="section-label">{label}</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Breadcrumb({ items, current, navigate }) {
  return (
    <nav className="breadcrumb" aria-label="Caminho">
      {items.map((item) => (
        <span key={item.to}>
          <AppLink to={item.to} navigate={navigate}>
            {item.label}
          </AppLink>
          <span aria-hidden="true">/</span>
        </span>
      ))}
      <strong>{current}</strong>
    </nav>
  );
}

function StoreHours({ location }) {
  return (
    <section className="hours-section" id="horarios">
      <div className="hours-copy">
        <p className="section-label">Funcionamento</p>
        <h2>Quando nos encontrar</h2>
        <p>
          <span className="status-dot open" />
          Aberto agora
        </p>
        <p className="location-line">
          <MapPin size={18} aria-hidden="true" />
          {location}
        </p>
      </div>

      <div className="store-info-list">
        <div className="hours-list">
          <article className="hours-card">
            <Clock size={20} aria-hidden="true" />
            <span>Segunda a sexta</span>
            <strong>8h às 17h30</strong>
          </article>
          <article className="hours-card">
            <Clock size={20} aria-hidden="true" />
            <span>Sábado</span>
            <strong>8h às 12h</strong>
          </article>
        </div>
        <div className="locations-list">
          <article className="location-card">
            <MapPin size={20} aria-hidden="true" />
            <span>Unidade Catu-BA</span>
            <a href="https://maps.app.goo.gl/GtTJUAoFMqrtMWay6" target="_blank" rel="noreferrer">
              Abrir no mapa
            </a>
          </article>
          <article className="location-card">
            <MapPin size={20} aria-hidden="true" />
            <span>Unidade Alagoinhas-BA</span>
            <small>Mapa em breve</small>
          </article>
        </div>
      </div>
    </section>
  );
}

function AuthRequiredPage({ navigate }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="section-label">Conta</p>
        <h1>Entre para continuar</h1>
        <p className="auth-copy">Para comprar, reservar e favoritar produtos, crie uma conta ou entre na sua conta.</p>
        <div className="auth-actions">
          <button className="button primary" type="button" onClick={() => navigate('/cadastro')}>
            Criar conta
          </button>
          <button className="button secondary" type="button" onClick={() => navigate('/login')}>
            Entrar
          </button>
        </div>
      </div>
    </section>
  );
}

function UserAuthPage({ mode, navigate, onLogin, onRegister }) {
  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '', password: '' });
  const isRegister = mode === 'register';
  const cpfDigits = normalizeCpf(form.cpf);
  const cpfIsValid = isValidCpf(form.cpf);
  const cpfHint = !cpfDigits
    ? 'Digite o CPF com 11 numeros.'
    : cpfDigits.length < 11
      ? 'Digite os 11 numeros do CPF.'
      : cpfIsValid
        ? 'CPF valido.'
        : 'CPF invalido.';
  const cpfHintClass = cpfDigits.length === 11 ? (cpfIsValid ? ' is-valid' : ' is-invalid') : '';

  function submit(event) {
    event.preventDefault();
    if (isRegister) {
      if (!cpfIsValid) return;
      onRegister(form);
    } else {
      onLogin(form.email, form.password);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="section-label">{isRegister ? 'Cadastro' : 'Login'}</p>
        <h1>{isRegister ? 'Criar conta' : 'Entrar na conta'}</h1>
        <form className="stack-form" onSubmit={submit}>
          {isRegister ? (
            <label>
              Nome
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          ) : null}
          <label>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          {isRegister ? (
            <label>
              WhatsApp
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
          ) : null}
          {isRegister ? (
            <label>
              CPF
              <input
                required
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                value={form.cpf}
                onChange={(event) => setForm({ ...form, cpf: formatCpfInput(event.target.value) })}
                aria-invalid={cpfDigits.length === 11 && !cpfIsValid ? 'true' : undefined}
                aria-describedby="user-cpf-hint"
              />
              <span id="user-cpf-hint" className={`field-hint${cpfHintClass}`}>
                {cpfHint}
              </span>
            </label>
          ) : null}
          <label>
            Senha
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <button className="button primary" type="submit" disabled={isRegister && !cpfIsValid}>
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => navigate(isRegister ? '/login' : '/cadastro')}
        >
          {isRegister ? 'Já tenho conta' : 'Criar cadastro'}
        </button>
      </div>
    </section>
  );
}

function CustomerProfilePage({
  db,
  user,
  favoriteProducts,
  favoriteIds,
  reservations,
  now,
  navigate,
  onUpdateProfile,
  onChangePassword,
  onLogout,
  onCheckout,
  onReceipt,
  onCopyPix,
  onToggleFavorite
}) {
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    cpf: formatCpf(user.cpf)
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cpf: formatCpf(user.cpf)
    });
    setEditingProfile(false);
  }, [user.id, user.name, user.email, user.phone, user.cpf]);

  const customerOrders = useMemo(() => {
    const userCpf = normalizeCpf(user.cpf);
    const userEmail = String(user.email || '').toLowerCase();

    return db.orders
      .filter((order) => {
        const sameUserId = order.customerId && order.customerId === user.id;
        const sameCpf = userCpf && normalizeCpf(order.customerCpf) === userCpf;
        const sameEmail = userEmail && String(order.customerEmail || '').toLowerCase() === userEmail;
        return sameUserId || sameCpf || sameEmail;
      })
      .sort((a, b) => orderTime(b) - orderTime(a));
  }, [db.orders, user.cpf, user.email, user.id]);

  const pendingOrders = customerOrders.filter((order) => order.status === 'pending').length;
  const activeReservationEntries = getUserActiveReservations(reservations, user, now);

  async function submitProfile(event) {
    event.preventDefault();
    const updated = await onUpdateProfile(profileForm);
    if (updated) {
      setEditingProfile(false);
    }
  }

  function startProfileEdit() {
    setEditingProfile(true);
  }

  function cancelProfileEdit() {
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cpf: formatCpf(user.cpf)
    });
    setEditingProfile(false);
  }

  async function submitPassword(event) {
    event.preventDefault();
    const changed = await onChangePassword(passwordForm);
    if (changed) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  function logoutAndLeave() {
    onLogout();
    navigate('/');
  }

  return (
    <section className="profile-page">
      <Breadcrumb navigate={navigate} items={[{ label: 'Inicio', to: '/' }]} current="Meu perfil" />

      <div className="profile-header">
        <div>
          <p className="section-label">Minha conta</p>
          <h1>Ola, {user.name}</h1>
          <p>Dados, senha, pedidos e favoritos da sua conta iTech.</p>
        </div>
        <button className="button secondary" type="button" onClick={logoutAndLeave}>
          <LogOut size={17} aria-hidden="true" />
          Sair
        </button>
      </div>

      <div className="profile-overview" aria-label="Resumo da conta">
        <div className="profile-stat">
          <UserRound size={20} aria-hidden="true" />
          <span>CPF</span>
          <strong>{formatCpf(user.cpf)}</strong>
        </div>
        <div className="profile-stat">
          <PackageCheck size={20} aria-hidden="true" />
          <span>Pedidos</span>
          <strong>{customerOrders.length}</strong>
          {pendingOrders ? <small>{pendingOrders} em validacao</small> : null}
        </div>
        <div className="profile-stat">
          <Heart size={20} aria-hidden="true" />
          <span>Favoritos</span>
          <strong>{favoriteProducts.length}</strong>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="section-label">Compra em andamento</p>
            <h2>Concluir compra ou reserva</h2>
          </div>
          <Clock size={24} aria-hidden="true" />
        </div>

        {activeReservationEntries.length ? (
          <div className="order-list">
            {activeReservationEntries.map(({ key, reservation }) => {
              const product = db.products.find((item) => item.id === reservation.productId);
              return product ? (
                <ActiveReservationCard
                  key={key}
                  reservationKey={key}
                  reservation={reservation}
                  product={withSelectedProductColor(product, getReservationColor(key, reservation, product), reservations, now)}
                  settings={db.settings}
                  now={now}
                  onReceipt={onReceipt}
                  onCopyPix={onCopyPix}
                />
              ) : null;
            })}
          </div>
        ) : (
          <div className="profile-empty">
            <ShoppingBag size={26} aria-hidden="true" />
            <h3>Nenhuma compra ou reserva em andamento</h3>
            <AppLink className="button primary" to="/produtos" navigate={navigate}>
              Ver produtos
            </AppLink>
          </div>
        )}
      </section>

      <div className="profile-form-grid">
        <form className="profile-card stack-form" onSubmit={submitProfile}>
          <div className="profile-card-heading">
            <UserRound size={20} aria-hidden="true" />
            <h2>Dados pessoais</h2>
          </div>
          <div className="form-grid">
            <label>
              Nome
              <input
                required
                disabled={!editingProfile}
                value={profileForm.name}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
              />
            </label>
            <label>
              E-mail
              <input
                required
                type="email"
                disabled={!editingProfile}
                value={profileForm.email}
                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
              />
            </label>
            <label>
              WhatsApp
              <input
                disabled={!editingProfile}
                value={profileForm.phone}
                onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
              />
            </label>
            <label>
              CPF
              <input value={profileForm.cpf} disabled />
              <span className="field-hint">CPF nao pode ser alterado pelo site.</span>
            </label>
          </div>
          <div className="profile-edit-actions">
            {editingProfile ? (
              <>
                <button className="button primary profile-submit-button" type="submit">
                  <Save size={17} aria-hidden="true" />
                  Salvar dados
                </button>
                <button className="button secondary profile-submit-button" type="button" onClick={cancelProfileEdit}>
                  Cancelar
                </button>
              </>
            ) : (
              <button className="button primary profile-submit-button" type="button" onClick={startProfileEdit}>
                <UserRound size={17} aria-hidden="true" />
                Editar dados
              </button>
            )}
          </div>
        </form>

        <form className="profile-card stack-form" onSubmit={submitPassword}>
          <div className="profile-card-heading">
            <KeyRound size={20} aria-hidden="true" />
            <h2>Alterar senha</h2>
          </div>
          <label>
            Senha atual
            <input
              required
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
            />
          </label>
          <label>
            Nova senha
            <input
              required
              minLength={4}
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
            />
          </label>
          <label>
            Confirmar nova senha
            <input
              required
              minLength={4}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
            />
          </label>
          <button className="button primary profile-submit-button" type="submit">
            <KeyRound size={17} aria-hidden="true" />
            Alterar senha
          </button>
        </form>
      </div>

      <section className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="section-label">Historico</p>
            <h2>Meus pedidos</h2>
          </div>
          <PackageCheck size={24} aria-hidden="true" />
        </div>

        {customerOrders.length ? (
          <div className="order-list">
            {customerOrders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <div className="order-title-row">
                    <span className={`order-status ${order.status || 'pending'}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <small>{formatOrderDate(order.createdAt)}</small>
                  </div>
                  <h3>{order.productName}</h3>
                  <p>
                    {orderModeLabel(order)} - {currency.format(order.amount)}
                  </p>
                </div>
                <dl className="order-details">
                  <div>
                    <dt>Comprovante</dt>
                    <dd>
                      {order.receiptDataUrl ? (
                        <a
                          className="receipt-download-link"
                          href={order.receiptDataUrl}
                          download={order.receiptName || `comprovante-${order.id}`}
                        >
                          Baixar comprovante
                        </a>
                      ) : (
                        order.receiptName || 'Pendente'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Pagamento</dt>
                    <dd>{order.percent === 50 ? '50% do valor' : '100% do valor'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <ShoppingBag size={26} aria-hidden="true" />
            <h3>Nenhum pedido ainda</h3>
            <AppLink className="button primary" to="/produtos" navigate={navigate}>
              Ver produtos
            </AppLink>
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="section-label">Lista salva</p>
            <h2>Produtos favoritados</h2>
          </div>
          <Heart size={24} aria-hidden="true" />
        </div>

        {favoriteProducts.length ? (
          <div className="profile-product-grid">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                reservations={reservations}
                now={now}
                navigate={navigate}
                onCheckout={onCheckout}
                isFavorite={favoriteIds.has(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <Heart size={26} aria-hidden="true" />
            <h3>Nenhum favorito salvo</h3>
            <AppLink className="button primary" to="/produtos" navigate={navigate}>
              Explorar produtos
            </AppLink>
          </div>
        )}
      </section>
    </section>
  );
}

function ActiveReservationCard({ reservationKey, reservation, product, settings, now, onReceipt, onCopyPix }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const remaining = reservation.expiresAt ? reservation.expiresAt - now : 0;
  const selectedColor = reservation.color || product.selectedColor || product.color;
  const paymentLabel = reservation.percent === 50 ? '50% do valor' : '100% do valor';
  const statusLabel = reservation.proofAttached ? 'Comprovante enviado' : formatTimer(remaining);

  useEffect(() => {
    setSelectedReceipt(null);
  }, [reservationKey, reservation.proofAttached]);

  function sendReceipt() {
    if (!selectedReceipt) return;
    onReceipt(selectedReceipt, reservationKey);
  }

  return (
    <article className="order-card active-reservation-card">
      <ProductVisual product={product} />
      <div>
        <div className="order-title-row">
          <span className={`order-status ${reservation.proofAttached ? 'pending' : 'received'}`}>
            {reservation.mode === 'reserve' ? 'Reserva' : 'Compra'}
          </span>
          <strong className="timer">{statusLabel}</strong>
        </div>
        <h3>{formatProductColorName(product, selectedColor)}</h3>
        <p>
          {paymentLabel} - {currency.format(reservation.amount)}
        </p>
      </div>
      <dl className="order-details">
        <div>
          <dt>Cor</dt>
          <dd>{colorLabel(selectedColor)}</dd>
        </div>
        <div>
          <dt>Pix</dt>
          <dd>{settings.pixKey}</dd>
        </div>
        <div>
          <dt>Comprovante</dt>
          <dd>{reservation.receiptName || 'Pendente'}</dd>
        </div>
      </dl>

      {!reservation.proofAttached ? (
        <div className="modal-actions profile-reservation-actions">
          <label className="file-button">
            <Upload size={17} aria-hidden="true" />
            Escolher comprovante
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setSelectedReceipt(event.target.files?.[0] || null)}
            />
          </label>
          <button className="button primary" type="button" disabled={!selectedReceipt} onClick={sendReceipt}>
            <Upload size={17} aria-hidden="true" />
            Enviar comprovante
          </button>
          <button className="button secondary" type="button" onClick={onCopyPix}>
            <Copy size={17} aria-hidden="true" />
            Copiar chave Pix
          </button>
        </div>
      ) : (
        <p className="modal-feedback">
          Comprovante anexado. Aguarde a validação do administrador para liberar uma nova compra ou reserva.
        </p>
      )}

      {selectedReceipt && !reservation.proofAttached ? (
        <p className="selected-receipt">Arquivo selecionado: {selectedReceipt.name}</p>
      ) : null}
    </article>
  );
}

function orderTime(order) {
  const timestamp = new Date(order.validatedAt || order.createdAt || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function orderStatusLabel(status) {
  if (status === 'validated') return 'Validado';
  if (status === 'pending') return 'Em validacao';
  return 'Recebido';
}

function orderModeLabel(order) {
  return order.mode === 'reserve' ? `Reserva ${order.percent || 50}%` : 'Compra';
}

function formatOrderDate(value) {
  if (!value) return 'Data indisponivel';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponivel';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function AdminPage({ db, currentAdmin, navigate, onLogin, onRegister, onLogout, updateDb, setNotice }) {
  if (!currentAdmin) {
    return <AdminAuth onLogin={onLogin} onRegister={onRegister} navigate={navigate} />;
  }

  return (
    <AdminPanel
      db={db}
      admin={currentAdmin}
      onLogout={onLogout}
      updateDb={updateDb}
      setNotice={setNotice}
    />
  );
}

function AdminForbiddenPage({ navigate, onLogout }) {
  function logoutAndGoHome() {
    onLogout();
    navigate('/');
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="section-label">Area restrita</p>
        <h1>Acesso administrativo bloqueado</h1>
        <p className="auth-copy">
          Esta conta esta conectada como cliente. Para entrar no painel admin, saia da conta de cliente e faca login
          com uma conta administrativa aprovada.
        </p>
        <div className="auth-actions">
          <button className="button primary" type="button" onClick={() => navigate('/perfil')}>
            Voltar ao perfil
          </button>
          <button className="button secondary" type="button" onClick={logoutAndGoHome}>
            Sair da conta
          </button>
        </div>
      </div>
    </section>
  );
}

function AdminAuth({ onLogin, onRegister, navigate }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', cpf: '', password: '' });
  const isRegister = mode === 'register';
  const cpfDigits = normalizeCpf(form.cpf);
  const cpfIsValid = isValidCpf(form.cpf);
  const cpfHint = !cpfDigits
    ? 'Digite o CPF com 11 numeros.'
    : cpfDigits.length < 11
      ? 'Digite os 11 numeros do CPF.'
      : cpfIsValid
        ? 'CPF valido.'
        : 'CPF invalido.';
  const cpfHintClass = cpfDigits.length === 11 ? (cpfIsValid ? ' is-valid' : ' is-invalid') : '';

  function submit(event) {
    event.preventDefault();
    if (isRegister) {
      if (!cpfIsValid) return;
      onRegister(form);
    } else {
      onLogin(form.email, form.password);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="section-label">Administrador</p>
        <h1>{isRegister ? 'Solicitar acesso admin' : 'Login admin'}</h1>
        <form className="stack-form" onSubmit={submit}>
          {isRegister ? (
            <label>
              Nome
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          ) : null}
          <label>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          {isRegister ? (
            <label>
              CPF
              <input
                required
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                value={form.cpf}
                onChange={(event) => setForm({ ...form, cpf: formatCpfInput(event.target.value) })}
                aria-invalid={cpfDigits.length === 11 && !cpfIsValid ? 'true' : undefined}
                aria-describedby="admin-cpf-hint"
              />
              <span id="admin-cpf-hint" className={`field-hint${cpfHintClass}`}>
                {cpfHint}
              </span>
            </label>
          ) : null}
          <label>
            Senha
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <button className="button primary" type="submit" disabled={isRegister && !cpfIsValid}>
            {isRegister ? 'Enviar solicitação' : 'Entrar'}
          </button>
        </form>
        <div className="auth-actions">
          <button className="text-button" type="button" onClick={() => setMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Voltar ao login' : 'Registrar novo admin'}
          </button>
          <button className="text-button" type="button" onClick={() => navigate('/')}>
            Voltar para a loja
          </button>
        </div>
      </div>
    </section>
  );
}

function AdminPanel({ db, admin, onLogout, updateDb, setNotice }) {
  const [tab, setTab] = useState('dashboard');

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="section-label">Painel administrativo</p>
          <h1>Olá, {admin.name}</h1>
        </div>
        <button className="button secondary" type="button" onClick={onLogout}>
          Sair
        </button>
      </div>

      <div className="admin-tabs">
        {[
          ['dashboard', 'Dashboard'],
          ['settings', 'Sistema'],
          ['products', 'Produtos'],
          ['categories', 'Categorias'],
          ['receipts', 'Comprovantes'],
          ['sales', 'Vendas realizadas'],
          ['admins', 'Novos admins']
        ].map(([id, label]) => (
          <button className={tab === id ? 'active' : ''} type="button" key={id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? <DashboardManager db={db} /> : null}
      {tab === 'settings' ? <SettingsManager db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
      {tab === 'products' ? <ProductManager db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
      {tab === 'categories' ? <CategoryManager db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
      {tab === 'receipts' ? <ReceiptManager db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
      {tab === 'sales' ? <SalesManager db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
      {tab === 'admins' ? <AdminApproval db={db} updateDb={updateDb} setNotice={setNotice} /> : null}
    </section>
  );
}

function DashboardManager({ db }) {
  const nowDate = new Date();
  const todayStart = startOfDay(nowDate);
  const monthStart = startOfMonth(nowDate);
  const yearStart = startOfYear(nowDate);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const orders = Array.isArray(db.orders) ? db.orders : [];
  const sales = orders.filter((order) => order.status === 'validated');
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const visits = db.analytics?.visits || [];
  const userVisits = visits.filter((visit) => visit.role === 'user');
  const guestVisits = visits.filter((visit) => visit.role === 'guest');
  const adminVisits = visits.filter((visit) => visit.role === 'admin');

  const todaySales = sales.filter((order) => getDateKey(order.validatedAt || order.createdAt) === getDateKey(nowDate));
  const weekSales = sales.filter((order) => isDateOnOrAfter(order.validatedAt || order.createdAt, weekStart));
  const monthSales = sales.filter((order) => isDateOnOrAfter(order.validatedAt || order.createdAt, monthStart));
  const yearSales = sales.filter((order) => isDateOnOrAfter(order.validatedAt || order.createdAt, yearStart));
  const grossRevenue = sumOrderAmounts(sales);
  const averageTicket = sales.length ? grossRevenue / sales.length : 0;
  const soldUnits = sales.reduce((total, order) => total + getOrderItems(order).length, 0);

  const usersToday = db.users.filter((user) => user.createdAt && getDateKey(user.createdAt) === getDateKey(nowDate));
  const usersMonth = db.users.filter((user) => user.createdAt && isDateOnOrAfter(user.createdAt, monthStart));
  const loggedVisitsToday = userVisits.filter((visit) => visit.dateKey === getDateKey(nowDate));
  const loggedVisitsMonth = userVisits.filter((visit) => isDateOnOrAfter(visit.createdAt, monthStart));
  const allVisitsToday = visits.filter((visit) => visit.dateKey === getDateKey(nowDate));
  const activeUsersToday = countUnique(loggedVisitsToday, (visit) => visit.userId);
  const activeUsersMonth = countUnique(loggedVisitsMonth, (visit) => visit.userId);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = getDateKey(date);
    const daySales = sales.filter((order) => getDateKey(order.validatedAt || order.createdAt) === key);
    const dayUserVisits = userVisits.filter((visit) => visit.dateKey === key);
    const dayGuestVisits = guestVisits.filter((visit) => visit.dateKey === key);

    return {
      key,
      label: formatShortDate(date),
      salesCount: daySales.length,
      revenue: sumOrderAmounts(daySales),
      loggedVisits: dayUserVisits.length,
      guestVisits: dayGuestVisits.length,
      activeUsers: countUnique(dayUserVisits, (visit) => visit.userId)
    };
  });

  const maxRevenue = Math.max(...days.map((day) => day.revenue), 1);
  const maxAccesses = Math.max(...days.map((day) => day.loggedVisits + day.guestVisits), 1);
  const productRanking = buildProductRanking(sales);
  const categoryRanking = buildCategoryRanking(sales, db.products, db.categories);
  const inventory = {
    available: db.products.reduce((total, product) => total + getTotalStock(product), 0),
    sold: soldUnits,
    out: db.products.filter((product) => getTotalStock(product) === 0).length
  };
  const recentSales = [...sales]
    .sort((a, b) => getOrderTime(b) - getOrderTime(a))
    .slice(0, 6);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <DashboardStat
          icon={DollarSign}
          label="Valor bruto"
          value={currency.format(grossRevenue)}
          detail={`${sales.length} venda(s) validadas`}
        />
        <DashboardStat
          icon={CalendarDays}
          label="Vendas hoje"
          value={todaySales.length}
          detail={currency.format(sumOrderAmounts(todaySales))}
        />
        <DashboardStat
          icon={TrendingUp}
          label="Vendas no mes"
          value={monthSales.length}
          detail={currency.format(sumOrderAmounts(monthSales))}
        />
        <DashboardStat
          icon={BarChart3}
          label="Vendas no ano"
          value={yearSales.length}
          detail={currency.format(sumOrderAmounts(yearSales))}
        />
        <DashboardStat
          icon={Users}
          label="Usuarios cadastrados"
          value={db.users.length}
          detail={`${usersToday.length} hoje, ${usersMonth.length} no mes`}
        />
        <DashboardStat
          icon={Eye}
          label="Acessos logados hoje"
          value={loggedVisitsToday.length}
          detail={`${activeUsersToday} usuario(s) ativos`}
        />
        <DashboardStat
          icon={ShoppingBag}
          label="Ticket medio"
          value={currency.format(averageTicket)}
          detail={`${soldUnits} item(ns) vendidos`}
        />
        <DashboardStat
          icon={PackageCheck}
          label="Comprovantes pendentes"
          value={pendingOrders.length}
          detail={`${weekSales.length} venda(s) nos ultimos 7 dias`}
        />
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Ultimos 7 dias</p>
              <h2>Vendas semanais</h2>
            </div>
            <strong>{currency.format(sumOrderAmounts(weekSales))}</strong>
          </div>
          <div className="bar-chart">
            {days.map((day) => (
              <div className="bar-item" key={day.key}>
                <span>{day.label}</span>
                <div className="bar-track">
                  <span style={{ width: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue ? 8 : 0)}%` }} />
                </div>
                <strong>{day.salesCount}</strong>
                <small>{currency.format(day.revenue)}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Acessos</p>
              <h2>Usuarios por dia</h2>
            </div>
            <strong>{activeUsersMonth} ativos no mes</strong>
          </div>
          <div className="access-chart">
            {days.map((day) => (
              <div className="access-day" key={day.key}>
                <span>{day.label}</span>
                <div className="stacked-bar">
                  <span
                    className="logged"
                    style={{ width: `${Math.max((day.loggedVisits / maxAccesses) * 100, day.loggedVisits ? 8 : 0)}%` }}
                  />
                  <span
                    className="guest"
                    style={{ width: `${Math.max((day.guestVisits / maxAccesses) * 100, day.guestVisits ? 8 : 0)}%` }}
                  />
                </div>
                <small>{day.loggedVisits} logados / {day.guestVisits} visitantes</small>
              </div>
            ))}
          </div>
          <p className="dashboard-note">
            Acessos logados contam apenas clientes conectados. Visitantes tambem sao registrados separadamente.
          </p>
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Produtos</p>
              <h2>Mais vendidos</h2>
            </div>
          </div>
          <DashboardRanking
            rows={productRanking}
            empty="Nenhum produto vendido ainda."
            valueLabel={(row) => `${row.count} venda(s) - ${currency.format(row.revenue)}`}
          />
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Categorias</p>
              <h2>Receita por categoria</h2>
            </div>
          </div>
          <DashboardRanking
            rows={categoryRanking}
            empty="Nenhuma categoria vendida ainda."
            valueLabel={(row) => `${row.count} item(ns) - ${currency.format(row.revenue)}`}
          />
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Estoque</p>
              <h2>Status dos produtos</h2>
            </div>
          </div>
          <div className="inventory-grid">
            <div>
              <span>Disponiveis</span>
              <strong>{inventory.available}</strong>
            </div>
            <div>
              <span>Vendidos</span>
              <strong>{inventory.sold}</strong>
            </div>
            <div>
              <span>Esgotados</span>
              <strong>{inventory.out}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <p className="section-label">Movimento</p>
              <h2>Resumo de acessos</h2>
            </div>
          </div>
          <div className="inventory-grid">
            <div>
              <span>Hoje</span>
              <strong>{allVisitsToday.length}</strong>
            </div>
            <div>
              <span>Clientes hoje</span>
              <strong>{activeUsersToday}</strong>
            </div>
            <div>
              <span>Admins</span>
              <strong>{adminVisits.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <p className="section-label">Ultimas vendas</p>
            <h2>Historico recente</h2>
          </div>
        </div>
        {recentSales.length ? (
          <div className="dashboard-sales-list">
            {recentSales.map((order) => (
              <div className="dashboard-sale-row" key={order.id}>
                <span>
                  <strong>{order.productName}</strong>
                  <small>
                    {order.customerName} - {formatOrderDate(order.validatedAt || order.createdAt)}
                  </small>
                </span>
                <strong>{currency.format(order.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Nenhuma venda validada ainda.</p>
        )}
      </section>
    </div>
  );
}

function DashboardStat({ icon: Icon, label, value, detail }) {
  return (
    <article className="dashboard-stat">
      <Icon size={21} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function DashboardRanking({ rows, empty, valueLabel }) {
  if (!rows.length) return <p className="muted">{empty}</p>;

  return (
    <div className="dashboard-ranking">
      {rows.map((row, index) => (
        <div className="dashboard-rank-row" key={row.id || row.label}>
          <span>{index + 1}</span>
          <div>
            <strong>{row.label}</strong>
            <small>{valueLabel(row)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function sumOrderAmounts(orders) {
  return orders.reduce((total, order) => total + Number(order.amount || 0), 0);
}

function getOrderItems(order) {
  if (Array.isArray(order.items) && order.items.length) return order.items;
  if (Array.isArray(order.productIds) && order.productIds.length) {
    const splitAmount = Number(order.amount || 0) / order.productIds.length;
    return order.productIds.map((productId, index) => ({
      productId,
      productName: index === 0 ? order.productName : `Produto ${index + 1}`,
      color: Array.isArray(order.productColors) ? order.productColors[index] : undefined,
      amount: splitAmount,
      quantity: 1
    }));
  }

  return [
    {
      productId: order.productId || order.id,
      productName: order.productName || 'Produto',
      color: order.productColor,
      amount: Number(order.amount || 0),
      quantity: 1
    }
  ];
}

function applyAmountToOrderItems(orderItems, amount) {
  const items = Array.isArray(orderItems) ? orderItems : [];
  if (!items.length) return [];

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (!total) {
    const splitAmount = amount / items.length;
    return items.map((item) => ({ ...item, amount: splitAmount }));
  }

  return items.map((item) => ({
    ...item,
    amount: (amount * Number(item.amount || 0)) / total
  }));
}

function buildProductRanking(sales) {
  const ranking = new Map();

  sales.forEach((order) => {
    getOrderItems(order).forEach((item) => {
      const key = item.productId || item.productName;
      const current = ranking.get(key) || {
        id: key,
        label: item.productName || order.productName || 'Produto',
        count: 0,
        revenue: 0
      };

      current.count += 1;
      current.revenue += Number(item.amount || 0);
      ranking.set(key, current);
    });
  });

  return Array.from(ranking.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}

function buildCategoryRanking(sales, products, categories) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const categoryMap = new Map(categories.map((category) => [category.slug, category.name]));
  const ranking = new Map();

  sales.forEach((order) => {
    getOrderItems(order).forEach((item) => {
      const product = productMap.get(item.productId);
      const categorySlug = product?.category || 'sem-categoria';
      const current = ranking.get(categorySlug) || {
        id: categorySlug,
        label: categoryMap.get(categorySlug) || 'Sem categoria',
        count: 0,
        revenue: 0
      };

      current.count += 1;
      current.revenue += Number(item.amount || 0);
      ranking.set(categorySlug, current);
    });
  });

  return Array.from(ranking.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}

function countUnique(items, getKey) {
  return new Set(items.map(getKey).filter(Boolean)).size;
}

function SettingsManager({ db, updateDb, setNotice }) {
  const [settings, setSettings] = useState(db.settings);

  function submit(event) {
    event.preventDefault();
    updateDb((current) => ({ ...current, settings }));
    setNotice('Informações do sistema atualizadas.');
  }

  return (
    <form className="admin-card stack-form" onSubmit={submit}>
      <h2>Informações do sistema</h2>
      <div className="form-grid">
        {[
          ['storeName', 'Nome da loja'],
          ['tagline', 'Slogan'],
          ['heroBadge', 'Badge da home'],
          ['heroTitle', 'Título da home'],
          ['heroAccent', 'Palavra destacada'],
          ['phoneDisplay', 'Telefone visível'],
          ['phoneNumber', 'Telefone WhatsApp com DDI'],
          ['instagramUrl', 'Instagram'],
          ['pixKey', 'Chave Pix'],
          ['location', 'Localização']
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} />
          </label>
        ))}
        <label className="wide-field">
          Subtítulo da home
          <textarea
            value={settings.heroSubtitle}
            onChange={(event) => setSettings({ ...settings, heroSubtitle: event.target.value })}
          />
        </label>
      </div>
      <button className="button primary" type="submit">
        <Save size={17} aria-hidden="true" />
        Salvar sistema
      </button>
    </form>
  );
}

function ProductManager({ db, updateDb, setNotice }) {
  const empty = {
    id: '',
    name: '',
    category: db.categories[0]?.slug || '',
    tag: '',
    condition: 'Novo',
    price: '',
    installments: '',
    description: '',
    specsText: '',
    color: 'black',
    visual: 'phone',
    featured: false,
    saleStatus: 'available',
    stock: [{ id: getStockRowId('new-product', 'black', 0), color: 'black', quantity: 1 }],
    images: []
  };
  const [form, setForm] = useState(empty);
  const editing = Boolean(form.id);

  function edit(product) {
    setForm({
      ...product,
      stock: getProductStock(product),
      images: getProductImages(product),
      specsText: product.specs.join('\n')
    });
  }

  function reset() {
    setForm(empty);
  }

  async function attachProductImages(event) {
    const files = event.target.files;
    if (!files?.length) return;

    if (!form.name.trim()) {
      setNotice('Informe o nome do produto antes de anexar as imagens.');
      event.target.value = '';
      return;
    }

    try {
      const images = await readProductImageFiles(files, form.name);
      setForm((current) => ({ ...current, images: [...(current.images || []), ...images] }));
      setNotice(`${images.length} imagem(ns) anexada(s) ao produto.`);
    } catch {
      setNotice('Nao foi possivel anexar as imagens do produto.');
    } finally {
      event.target.value = '';
    }
  }

  function removeProductImage(imageId) {
    setForm((current) => ({
      ...current,
      images: (current.images || []).filter((image) => image.id !== imageId)
    }));
  }

  function updateStockRow(rowId, updates) {
    setForm((current) => ({
      ...current,
      stock: (current.stock || []).map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    }));
  }

  function addStockRow() {
    const usedColors = new Set((form.stock || []).map((row) => row.color));
    const nextColor = COLOR_OPTIONS.find((color) => !usedColors.has(color.value))?.value || 'black';

    setForm((current) => ({
      ...current,
      stock: [
        ...(current.stock || []),
        {
          id: `${getStockRowId(current.id || 'new-product', nextColor, (current.stock || []).length)}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          color: nextColor,
          quantity: 1
        }
      ]
    }));
  }

  function removeStockRow(rowId) {
    setForm((current) => {
      const stock = (current.stock || []).filter((row) => row.id !== rowId);
      return {
        ...current,
        stock: stock.length ? stock : [{ id: getStockRowId(current.id || 'new-product', 'black', 0), color: 'black', quantity: 0 }]
      };
    });
  }

  function submit(event) {
    event.preventDefault();
    const stock = normalizeProductStock(form);
    const stockTotal = stock.reduce((total, item) => total + item.quantity, 0);
    const primaryColor = stock.find((item) => item.quantity > 0)?.color || stock[0]?.color || form.color;
    const product = {
      ...form,
      id: form.id || createId(form.name, 'product'),
      color: primaryColor,
      price: Number(form.price || 0),
      images: getProductImages(form),
      stock,
      saleStatus: stockTotal > 0 ? 'available' : form.condition === 'Novo' ? 'out_of_stock' : 'sold',
      specs: form.specsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    };
    delete product.specsText;

    updateDb((current) => ({
      ...current,
      products: editing
        ? current.products.map((item) => (item.id === product.id ? product : item))
        : [...current.products, product]
    }));
    setNotice(editing ? 'Produto atualizado.' : 'Produto cadastrado.');
    reset();
  }

  function remove(productId) {
    updateDb((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId)
    }));
    setNotice('Produto excluído.');
  }

  return (
    <div className="product-manager-layout">
      <form className="admin-card stack-form product-form" onSubmit={submit}>
        <h2>{editing ? 'Alterar produto' : 'Adicionar produto'}</h2>
        <div className="form-grid">
          <label>
            Nome
            <input
              required
              placeholder="iPhone 16"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label>
            Categoria
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {db.categories.map((category) => (
                <option value={category.slug} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Etiqueta
            <input
              placeholder="Novo"
              value={form.tag}
              onChange={(event) => setForm({ ...form, tag: event.target.value })}
            />
          </label>
          <label>
            Condição
            <select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}>
              <option>Novo</option>
              <option>Semi-novo</option>
            </select>
          </label>
          <label>
            Preço
            <input
              min="0"
              step="0.01"
              type="number"
              placeholder="7499"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </label>
          <label>
            Parcelamento
            <input
              placeholder="12x de R$ 624,92"
              value={form.installments}
              onChange={(event) => setForm({ ...form, installments: event.target.value })}
            />
          </label>
          <label>
            Cor visual padrão
            <select value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })}>
              {COLOR_OPTIONS.map((color) => (
                <option value={color.value} key={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Visual
            <select value={form.visual} onChange={(event) => setForm({ ...form, visual: event.target.value })}>
              {VISUAL_OPTIONS.map((visual) => (
                <option value={visual.value} key={visual.value}>
                  {visual.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status calculado
            <select value={getTotalStock(form) > 0 ? 'available' : form.condition === 'Novo' ? 'out_of_stock' : 'sold'} disabled>
              <option value="available">Disponível</option>
              <option value="sold">Vendido</option>
              <option value="out_of_stock">Esgotado</option>
            </select>
          </label>
          <div className="stock-editor wide-field">
            <div className="stock-editor-heading">
              <strong>Estoque por cor</strong>
              <small>{getTotalStock(form)} unidade(s) disponivel(is) no cadastro.</small>
            </div>
            {(form.stock || []).map((row) => (
              <div className="stock-row" key={row.id}>
                <label>
                  Cor
                  <select value={row.color} onChange={(event) => updateStockRow(row.id, { color: event.target.value })}>
                    {COLOR_OPTIONS.map((color) => (
                      <option value={color.value} key={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Unidades
                  <input
                    min="0"
                    step="1"
                    type="number"
                    value={row.quantity}
                    onChange={(event) => updateStockRow(row.id, { quantity: event.target.value })}
                  />
                </label>
                <button type="button" onClick={() => removeStockRow(row.id)} aria-label="Remover cor do estoque">
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
            <button className="button secondary stock-add-button" type="button" onClick={addStockRow}>
              <Plus size={15} aria-hidden="true" />
              Adicionar cor
            </button>
          </div>
          <label className="check-inline">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm({ ...form, featured: event.target.checked })}
            />
            Destaque na home
          </label>
          <label className="wide-field">
            Descrição
            <textarea
              placeholder="Camera de 48 MP, chip A18 e pronta entrega."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Especificações, uma por linha
            <textarea
              placeholder={'128 GB\nPreto\nLacrado\nGarantia iTech'}
              value={form.specsText}
              onChange={(event) => setForm({ ...form, specsText: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Imagens do produto
            <input type="file" accept="image/*" multiple onChange={attachProductImages} />
          </label>
          {(form.images || []).length ? (
            <div className="image-preview-grid wide-field">
              {form.images.map((image, index) => (
                <div className="image-preview" key={image.id}>
                  <img src={image.url} alt={image.alt || `Imagem ${index + 1} do produto`} />
                  <button type="button" onClick={() => removeProductImage(image.id)} aria-label="Remover imagem">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="form-actions">
          <button className="button primary product-submit-button" type="submit">
            <Plus size={17} aria-hidden="true" />
            {editing ? 'Salvar produto' : 'Cadastrar produto'}
          </button>
          {editing ? (
            <button className="button secondary" type="button" onClick={reset}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-card product-list-card">
        <h2>Produtos cadastrados</h2>
        <div className="admin-list">
          {db.products.map((product) => (
            <div className="admin-list-row product-admin-row" key={product.id}>
              <div className="product-admin-summary">
                <ProductAdminImages product={product} />
                <span>
                  <strong>{product.name}</strong>
                  <small>
                  {categoryLabel(db.categories, product.category)} · {currency.format(product.price)} ·{' '}
                  {getTotalStock(product)} un. ·{' '}
                  {getProductStock(product)
                    .filter((item) => item.quantity > 0)
                    .map((item) => `${colorLabel(item.color)} (${item.quantity})`)
                    .join(', ') || 'sem estoque'}
                  </small>
                </span>
              </div>
              <button type="button" onClick={() => edit(product)}>
                Editar
              </button>
              <button className="danger" type="button" onClick={() => remove(product.id)}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductAdminImages({ product }) {
  const images = getProductImages(product);

  if (!images.length) {
    return (
      <div className="product-admin-images empty" aria-label={`Sem imagem cadastrada para ${product.name}`}>
        <DeviceShape visual={product.visual} />
      </div>
    );
  }

  return (
    <div className="product-admin-images" aria-label={`Imagens de ${product.name}`}>
      {images.map((image, index) => (
        <img src={image.url} alt={image.alt || `Imagem ${index + 1} de ${product.name}`} key={image.id} />
      ))}
    </div>
  );
}

function CategoryManager({ db, updateDb, setNotice }) {
  const empty = {
    name: '',
    slug: '',
    title: '',
    description: '',
    icon: 'smartphone',
    nav: true,
    home: true
  };
  const [form, setForm] = useState(empty);
  const [editingSlug, setEditingSlug] = useState('');
  const editing = Boolean(editingSlug);

  function reset() {
    setForm(empty);
    setEditingSlug('');
  }

  function edit(category) {
    setEditingSlug(category.slug);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      title: category.title || category.name || '',
      description: category.description || '',
      icon: category.icon || 'smartphone',
      nav: category.nav !== false,
      home: category.home !== false
    });
  }

  function submit(event) {
    event.preventDefault();
    const name = String(form.name || '').trim();
    const slug = String(form.slug || createId(name, 'category').replace(/-\w+$/, '')).trim();
    const title = String(form.title || '').trim() || name;
    const description = String(form.description || '').trim();

    if (db.categories.some((category) => category.slug === slug && category.slug !== editingSlug)) {
      setNotice('Já existe uma categoria com esse slug.');
      return;
    }

    if (editing) {
      updateDb((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.slug === editingSlug
            ? {
                ...category,
                ...form,
                name,
                slug,
                title,
                description
              }
            : category
        ),
        products: current.products.map((product) =>
          product.category === editingSlug ? { ...product, category: slug } : product
        )
      }));
      reset();
      setNotice('Categoria atualizada.');
      return;
    }

    updateDb((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          ...form,
          id: createId(form.name, 'category'),
          name,
          slug,
          title,
          description,
          sortOrder: current.categories.length + 1
        }
      ]
    }));
    reset();
    setNotice('Categoria criada.');
  }

  function remove(categorySlug) {
    if (db.products.some((product) => product.category === categorySlug)) {
      setNotice('Não dá para excluir categoria com produtos cadastrados.');
      return;
    }

    updateDb((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.slug !== categorySlug)
    }));
    if (editingSlug === categorySlug) reset();
    setNotice('Categoria excluída.');
  }

  return (
    <div className="admin-grid">
      <form className="admin-card stack-form" onSubmit={submit}>
        <h2>{editing ? 'Editar categoria' : 'Criar categoria'}</h2>
        <div className="form-grid">
          <label>
            Nome
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          </label>
          <label>
            Título
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            Ícone
            <select value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })}>
              {Object.keys(ICONS).map((icon) => (
                <option value={icon} key={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Descrição
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="check-inline">
            <input type="checkbox" checked={form.nav} onChange={(event) => setForm({ ...form, nav: event.target.checked })} />
            Mostrar na navbar
          </label>
          <label className="check-inline">
            <input type="checkbox" checked={form.home} onChange={(event) => setForm({ ...form, home: event.target.checked })} />
            Mostrar na home
          </label>
        </div>
        <div className="form-actions">
          <button className="button primary admin-submit-button" type="submit">
            {editing ? 'Salvar categoria' : 'Criar categoria'}
          </button>
          {editing ? (
            <button className="button secondary admin-submit-button" type="button" onClick={reset}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-card">
        <h2>Categorias</h2>
        <div className="admin-list">
          {db.categories.map((category) => (
            <div className="admin-list-row" key={category.id}>
              <span>
                <strong>{category.name}</strong>
                <small>{category.slug}</small>
              </span>
              <button type="button" onClick={() => edit(category)}>
                Editar
              </button>
              <button className="danger" type="button" onClick={() => remove(category.slug)}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReceiptManager({ db, updateDb, setNotice }) {
  const pending = db.orders.filter((order) => order.status === 'pending');
  const [previewOrder, setPreviewOrder] = useState(null);

  function validate(order, validationAmount) {
    const amount = Number(validationAmount ?? order.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Informe um valor valido para validar a venda.');
      return;
    }

    updateDb((current) => {
      const orderItems = getOrderItems(order);
      const updatedItems = applyAmountToOrderItems(orderItems, amount);
      const orderProductIds = orderItems.map((item) => item.productId).filter(Boolean);
      const orderProductSet = new Set(orderProductIds);
      const reservationKeys = Array.isArray(order.reservationKeys) && order.reservationKeys.length
        ? order.reservationKeys
        : orderItems.map((item) => getReservationKey(item.productId, item.color)).filter(Boolean);
      const reservations = { ...current.reservations };
      reservationKeys.forEach((reservationKey) => {
        delete reservations[reservationKey];
      });
      orderProductIds.forEach((productId) => {
        delete reservations[productId];
      });

      return {
        ...current,
        reservations,
        orders: current.orders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                amount,
                items: updatedItems,
                validatedAmount: amount,
                discountAmount: Math.max(0, Number(order.amount || 0) - amount),
                status: 'validated',
                validatedAt: new Date().toISOString()
              }
            : item
        ),
        products: current.products.map((item) => {
          if (!orderProductSet.has(item.id)) return item;
          return decreaseStockForOrder(item, orderItems);
        })
      };
    });
    setPreviewOrder(null);
    setNotice('Venda validada e enviada para vendas realizadas.');
  }

  return (
    <>
    <div className="admin-card">
      <h2>Comprovantes para validar</h2>
      {pending.length ? (
        <div className="admin-list">
          {pending.map((order) => (
            <div className="admin-list-row receipt-row" key={order.id}>
              <span>
                <strong>{order.productName}</strong>
                <small>
                  {order.customerName}
                  {order.customerCpf ? ` · CPF ${formatCpf(order.customerCpf)}` : ''} · {currency.format(order.amount)} ·{' '}
                  {order.receiptName}
                </small>
              </span>
              <button type="button" onClick={() => setPreviewOrder(order)}>
                <Eye size={15} aria-hidden="true" />
                Visualizar
              </button>
              <button className="approve" type="button" onClick={() => setPreviewOrder(order)}>
                <Check size={15} aria-hidden="true" />
                Validar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Nenhum comprovante pendente.</p>
      )}
    </div>
    {previewOrder ? (
      <ReceiptPreviewModal
        db={db}
        order={previewOrder}
        onClose={() => setPreviewOrder(null)}
        onValidate={(amount) => validate(previewOrder, amount)}
      />
    ) : null}
    </>
  );
}

function ReceiptPreviewModal({ db, order, onClose, onValidate }) {
  const [validationAmount, setValidationAmount] = useState(String(order.amount || ''));
  const receiptType = order.receiptType || '';
  const canPreview = Boolean(order.receiptDataUrl);
  const isImage = receiptType.startsWith('image/');
  const isPdf = receiptType === 'application/pdf' || order.receiptName?.toLowerCase().endsWith('.pdf');
  const orderItems = getOrderItems(order);
  const productSummaries = orderItems.map((item) => {
    const product = db.products.find((entry) => entry.id === item.productId);
    return {
      ...item,
      product,
      displayName: product ? formatProductColorName(product, item.color || order.productColor) : item.productName,
      categoryName: product ? categoryLabel(db.categories, product.category) : 'Categoria nao encontrada',
      listPrice: product ? Number(product.price || 0) : Number(item.amount || 0)
    };
  });
  const itemList = productSummaries.map((item) => item.displayName).join(', ');
  const validationAmountNumber = Number(validationAmount || 0);
  const originalAmount = Number(order.amount || 0);
  const differenceAmount = originalAmount - validationAmountNumber;

  useEffect(() => {
    setValidationAmount(String(order.amount || ''));
  }, [order.id, order.amount]);

  function submitValidation() {
    if (!Number.isFinite(validationAmountNumber) || validationAmountNumber <= 0) return;
    onValidate(validationAmountNumber);
  }

  return (
    <div className="modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card receipt-preview-card" role="dialog" aria-modal="true" aria-labelledby="receipt-preview-title">
        <div className="modal-header">
          <div>
            <span className="product-badge">Comprovante</span>
            <h2 id="receipt-preview-title">{order.productName}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="pix-box">
            <InfoLine label="Cliente" value={order.customerName || 'Nao informado'} />
            <InfoLine label="CPF" value={order.customerCpf ? formatCpf(order.customerCpf) : 'Nao informado'} />
            <InfoLine label="E-mail" value={order.customerEmail || 'Nao informado'} />
            <InfoLine label="Itens" value={itemList || order.productName} />
            <InfoLine label="Valor enviado" value={currency.format(originalAmount)} />
            <InfoLine label="Arquivo" value={order.receiptName || 'Sem nome'} />
          </div>

          <div className="receipt-product-box">
            <h3>Dados do aparelho vendido</h3>
            {productSummaries.map((item) => (
              <div className="receipt-product-row" key={`${item.productId}-${item.color || 'default'}`}>
                <span>
                  <strong>{item.displayName}</strong>
                  <small>
                    {item.categoryName} · {item.product?.condition || item.condition || 'Condicao nao informada'} ·{' '}
                    {item.quantity || 1} un.
                  </small>
                </span>
                <span>{currency.format(item.listPrice)}</span>
              </div>
            ))}
          </div>

          <label className="validation-amount-field">
            Valor validado da venda
            <input
              min="0.01"
              step="0.01"
              type="number"
              value={validationAmount}
              onChange={(event) => setValidationAmount(event.target.value)}
            />
            <span className="field-hint">
              {differenceAmount > 0
                ? `Desconto aplicado: ${currency.format(differenceAmount)}`
                : differenceAmount < 0
                  ? `Acréscimo aplicado: ${currency.format(Math.abs(differenceAmount))}`
                  : 'Sem desconto aplicado.'}
            </span>
          </label>

          <div className="receipt-preview-frame">
            {canPreview && isImage ? (
              <img src={order.receiptDataUrl} alt={`Comprovante de ${order.customerName || order.productName}`} />
            ) : null}

            {canPreview && isPdf ? (
              <iframe title="Comprovante em PDF" src={order.receiptDataUrl} />
            ) : null}

            {canPreview && !isImage && !isPdf ? (
              <div className="receipt-preview-empty">
                <FileText size={26} aria-hidden="true" />
                <p>Este tipo de arquivo nao tem pre-visualizacao no navegador.</p>
                <a className="button secondary" href={order.receiptDataUrl} target="_blank" rel="noreferrer">
                  Abrir arquivo
                </a>
              </div>
            ) : null}

            {!canPreview ? (
              <div className="receipt-preview-empty">
                <FileText size={26} aria-hidden="true" />
                <p>Este pedido foi enviado antes da pre-visualizacao ser salva.</p>
              </div>
            ) : null}
          </div>

          <div className="modal-actions">
            {canPreview ? (
              <a className="button secondary" href={order.receiptDataUrl} target="_blank" rel="noreferrer">
                <Eye size={17} aria-hidden="true" />
                Abrir em nova aba
              </a>
            ) : null}
            <button
              className="button primary"
              type="button"
              disabled={!Number.isFinite(validationAmountNumber) || validationAmountNumber <= 0}
              onClick={submitValidation}
            >
              <Check size={17} aria-hidden="true" />
              Validar comprovante
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SalesManager({ db, updateDb, setNotice }) {
  const sales = db.orders.filter((order) => order.status === 'validated');
  const creditCardPaymentMethod = 'cartao_credito';
  const paymentOptions = [
    { value: 'pix', label: 'Pix' },
    { value: creditCardPaymentMethod, label: 'Cartao de credito' },
    { value: 'cartao_debito', label: 'Cartao de debito' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'outro', label: 'Outro' }
  ];
  const installmentOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const firstProduct = db.products[0];
  const firstColor = firstProduct ? getProductStock(firstProduct)[0]?.color || firstProduct.color : '';
  const [form, setForm] = useState({
    productId: firstProduct?.id || '',
    color: firstColor,
    quantity: 1,
    amount: firstProduct ? String(firstProduct.price) : '',
    paymentMethod: paymentOptions[0].value,
    installmentCount: '1',
    userId: '',
    customerName: '',
    customerCpf: '',
    note: ''
  });
  const selectedProduct = db.products.find((product) => product.id === form.productId);
  const selectedUser = db.users.find((user) => user.id === form.userId);
  const stockOptions = selectedProduct ? getProductStock(selectedProduct) : [];
  const selectedStock = stockOptions.find((item) => item.color === form.color);
  const maxQuantity = selectedStock?.quantity || 0;
  const isCreditCard = form.paymentMethod === creditCardPaymentMethod;
  const amountValue = Number(form.amount || 0);
  const installmentCount = Math.max(1, Number.parseInt(form.installmentCount, 10) || 1);
  const installmentAmount = amountValue > 0 ? amountValue / installmentCount : 0;
  const installmentLabel = `${installmentCount}x de ${currency.format(installmentAmount)}`;

  function updateProduct(productId) {
    const product = db.products.find((item) => item.id === productId);
    const color = product ? getProductStock(product)[0]?.color || product.color : '';
    setForm((current) => ({
      ...current,
      productId,
      color,
      quantity: 1,
      amount: product ? String(product.price) : ''
    }));
  }

  function updatePaymentMethod(paymentMethod) {
    setForm((current) => ({
      ...current,
      paymentMethod,
      installmentCount: paymentMethod === creditCardPaymentMethod ? current.installmentCount || '1' : '1'
    }));
  }

  function submitManualSale(event) {
    event.preventDefault();

    if (!selectedProduct) {
      setNotice('Selecione um produto para registrar a venda.');
      return;
    }

    const quantity = normalizeQuantity(form.quantity);
    if (!quantity || quantity > maxQuantity) {
      setNotice('Informe uma quantidade disponivel em estoque.');
      return;
    }

    const customerName = selectedUser?.name || String(form.customerName || '').trim();
    const customerCpf = selectedUser?.cpf || normalizeCpf(form.customerCpf);

    if (!customerName) {
      setNotice('Informe o nome do cliente.');
      return;
    }

    if (!customerCpf || !isValidCpf(customerCpf)) {
      setNotice('Informe um CPF valido para vincular a venda.');
      return;
    }

    const amount = Number(form.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Informe o valor da venda.');
      return;
    }

    const payment = paymentOptions.find((option) => option.value === form.paymentMethod) || paymentOptions[0];
    const creditInstallments = payment.value === creditCardPaymentMethod ? installmentCount : null;
    const creditInstallmentAmount = payment.value === creditCardPaymentMethod ? amount / installmentCount : null;
    const paymentLabel =
      payment.value === creditCardPaymentMethod
        ? `${payment.label} - ${installmentCount}x de ${currency.format(creditInstallmentAmount)}`
        : payment.label;
    const nowIso = new Date().toISOString();
    const order = {
      id: createId(`${selectedProduct.id}-venda-manual`, 'order'),
      productId: selectedProduct.id,
      productColor: form.color,
      productName: formatProductColorName(selectedProduct, form.color),
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          color: form.color,
          colorLabel: colorLabel(form.color),
          amount,
          condition: selectedProduct.condition,
          quantity
        }
      ],
      customerId: selectedUser?.id || '',
      customerName,
      customerEmail: selectedUser?.email || '',
      customerCpf,
      amount,
      percent: 100,
      mode: 'manual',
      paymentMethod: payment.value,
      paymentLabel,
      installmentCount: creditInstallments,
      installmentAmount: creditInstallmentAmount,
      installmentLabel: creditInstallments ? `${creditInstallments}x de ${currency.format(creditInstallmentAmount)}` : '',
      manualNote: String(form.note || '').trim(),
      receiptName: paymentLabel,
      status: 'validated',
      createdAt: nowIso,
      validatedAt: nowIso
    };

    updateDb((current) => ({
      ...current,
      orders: [...current.orders, order],
      products: current.products.map((product) =>
        product.id === selectedProduct.id ? decreaseStockForOrder(product, order.items) : product
      )
    }));

    setNotice('Venda manual cadastrada.');
    setForm((current) => ({
      ...current,
      quantity: 1,
      amount: selectedProduct ? String(selectedProduct.price) : current.amount,
      installmentCount: '1',
      userId: '',
      customerName: '',
      customerCpf: '',
      note: ''
    }));
  }
  return (
    <div className="sales-manager-layout">
      <form className="admin-card stack-form" onSubmit={submitManualSale}>
        <h2>Cadastrar venda realizada</h2>
        <div className="form-grid">
          <label>
            Produto
            <select value={form.productId} onChange={(event) => updateProduct(event.target.value)}>
              {db.products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cor
            <select value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })}>
              {stockOptions.map((item) => (
                <option value={item.color} key={item.id}>
                  {colorLabel(item.color)} ({item.quantity} un.)
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantidade
            <input
              min="1"
              max={maxQuantity || 1}
              step="1"
              type="number"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            />
          </label>
          <label>
            Valor total
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
            />
          </label>
          <label>
            Forma de pagamento
            <select value={form.paymentMethod} onChange={(event) => updatePaymentMethod(event.target.value)}>
              {paymentOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {isCreditCard ? (
            <label>
              Parcelamento
              <select
                value={form.installmentCount}
                onChange={(event) => setForm({ ...form, installmentCount: event.target.value })}
              >
                {installmentOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}x de {currency.format(amountValue > 0 ? amountValue / option : 0)}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                Parcela: {installmentLabel} no total de {currency.format(amountValue || 0)}
              </span>
            </label>
          ) : null}
          <label>
            Usuario cadastrado
            <select value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })}>
              <option value="">Venda para cliente nao cadastrado</option>
              {db.users.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.name} - {formatCpf(user.cpf)}
                </option>
              ))}
            </select>
          </label>
          {!selectedUser ? (
            <>
              <label>
                Nome do cliente
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                />
              </label>
              <label>
                CPF do cliente
                <input
                  required
                  inputMode="numeric"
                  maxLength={14}
                  value={form.customerCpf}
                  onChange={(event) => setForm({ ...form, customerCpf: formatCpfInput(event.target.value) })}
                />
              </label>
            </>
          ) : null}
          <label className="wide-field">
            Observacao
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </label>
        </div>
        <button className="button primary admin-submit-button" type="submit" disabled={!selectedProduct || !maxQuantity}>
          <Save size={17} aria-hidden="true" />
          Registrar venda
        </button>
      </form>

      <div className="admin-card">
      <h2>Vendas realizadas</h2>
      {sales.length ? (
        <div className="admin-list">
          {sales.map((order) => (
            <div className="admin-list-row" key={order.id}>
              <span>
                <strong>{order.productName}</strong>
                <small>
                  {order.customerName}
                  {order.customerCpf ? ` · CPF ${formatCpf(order.customerCpf)}` : ''} · {currency.format(order.amount)} ·{' '}
                  {order.paymentLabel ? `${order.paymentLabel} Â· ` : ''}
                  {new Date(order.validatedAt).toLocaleDateString('pt-BR')}
                </small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Nenhuma venda validada ainda.</p>
      )}
      </div>
    </div>
  );
}

function AdminApproval({ db, updateDb, setNotice }) {
  const pending = db.admins.filter((admin) => admin.status === 'pending');
  const adminKeys = new Set(
    db.admins.map((admin) => `${String(admin.email || '').toLowerCase()}|${normalizeCpf(admin.cpf)}`)
  );
  const promotableUsers = db.users.filter(
    (user) => !adminKeys.has(`${String(user.email || '').toLowerCase()}|${normalizeCpf(user.cpf)}`)
  );

  function approve(adminId) {
    updateDb((current) => ({
      ...current,
      admins: current.admins.map((admin) =>
        admin.id === adminId ? { ...admin, status: 'approved', approvedAt: new Date().toISOString() } : admin
      )
    }));
    setNotice('Administrador aprovado.');
  }

  function promoteUser(user) {
    const promotedAdmin = {
      id: createId(user.email, 'admin'),
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone || '',
      password: user.password,
      status: 'approved',
      promotedFromUserId: user.id,
      createdAt: user.createdAt || new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    updateDb((current) => ({
      ...current,
      admins: [...current.admins, promotedAdmin]
    }));
    setNotice(`${user.name} agora pode acessar o painel admin.`);
  }

  return (
    <div className="admin-manager-layout">
      <div className="admin-card">
      <h2>Solicitações de novos administradores</h2>
      {pending.length ? (
        <div className="admin-list">
          {pending.map((admin) => (
            <div className="admin-list-row" key={admin.id}>
              <span>
                <strong>{admin.name}</strong>
                <small>
                  {admin.email}
                  {admin.cpf ? ` · CPF ${formatCpf(admin.cpf)}` : ''}
                </small>
              </span>
              <button className="approve" type="button" onClick={() => approve(admin.id)}>
                Aprovar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Nenhum admin pendente.</p>
      )}
      </div>

      <div className="admin-card">
        <h2>Promover usuario cadastrado</h2>
        {promotableUsers.length ? (
          <div className="admin-list">
            {promotableUsers.map((user) => (
              <div className="admin-list-row" key={user.id}>
                <span>
                  <strong>{user.name}</strong>
                  <small>
                    {user.email}
                    {user.cpf ? ` · CPF ${formatCpf(user.cpf)}` : ''}
                  </small>
                </span>
                <button className="approve" type="button" onClick={() => promoteUser(user)}>
                  Promover a admin
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Nenhum usuario disponivel para promover.</p>
        )}
      </div>
    </div>
  );
}

function categoryLabel(categories, slug) {
  return categories.find((category) => category.slug === slug)?.name || slug;
}

function CheckoutModal({ product, reservation, settings, now, onClose, onReceipt, onCopyPix }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    setSelectedReceipt(null);
  }, [product?.id, reservation?.orderId, reservation?.proofAttached]);

  if (!product || !reservation) return null;

  const remaining = reservation.expiresAt ? reservation.expiresAt - now : 0;
  const amountLabel = reservation.percent === 50 ? '50% do valor' : '100% do valor';
  const stockLabel = product.condition === 'Novo' ? 'Esgotado' : 'Vendido';
  const selectedColor = reservation.color || product.selectedColor || product.color;

  function sendReceipt() {
    if (!selectedReceipt) return;
    onReceipt(selectedReceipt);
    setSelectedReceipt(null);
  }

  return (
    <div className="modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="modal-header">
          <div>
            <span className="product-badge">{product.name}</span>
            <h2 id="checkout-title">{reservation.percent === 50 ? 'Reserva do produto' : 'Compra do produto'}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="timer-box">
            <strong className="timer">{reservation.proofAttached ? 'OK' : formatTimer(remaining)}</strong>
            <p>
              Produto reservado por 5 minutos. Realize o Pix, escolha o arquivo e depois clique em
              enviar comprovante para concluir.
            </p>
          </div>

          <div className="pix-box">
            <InfoLine label="Produto" value={product.name} />
            <InfoLine label="Cor" value={colorLabel(selectedColor)} />
            <InfoLine label="Produto ficará como" value={stockLabel} />
            <InfoLine label="Pagamento solicitado" value={amountLabel} />
            <InfoLine label="Valor Pix" value={currency.format(reservation.amount)} />
            <InfoLine label="Chave Pix" value={settings.pixKey} />
          </div>

          <div className="modal-actions">
            {!reservation.proofAttached ? (
              <>
                <label className="file-button">
                  <Upload size={17} aria-hidden="true" />
                  Escolher comprovante
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setSelectedReceipt(event.target.files?.[0] || null)}
                  />
                </label>
                <button className="button primary" type="button" disabled={!selectedReceipt} onClick={sendReceipt}>
                  <Upload size={17} aria-hidden="true" />
                  Enviar comprovante
                </button>
              </>
            ) : null}
            <button className="button secondary" type="button" onClick={onCopyPix}>
              <Copy size={17} aria-hidden="true" />
              Copiar chave Pix
            </button>
            <a className="button secondary" href={getWhatsAppUrl(settings)} target="_blank" rel="noreferrer">
              <MessageCircle size={17} aria-hidden="true" />
              WhatsApp
            </a>
          </div>

          {selectedReceipt && !reservation.proofAttached ? (
            <p className="selected-receipt">Arquivo selecionado: {selectedReceipt.name}</p>
          ) : null}

          {reservation.proofAttached ? (
            <p className="modal-feedback">
              Comprovante anexado: {reservation.receiptName || 'arquivo recebido'}. Aguardando
              validação do administrador.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="pix-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FavoriteButton({ productName, active, onClick }) {
  return (
    <button
      className={`favorite-button ${active ? 'is-favorite' : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remover ${productName} dos favoritos` : `Favoritar ${productName}`}
      title={active ? 'Remover dos favoritos' : 'Favoritar'}
    >
      <Heart size={18} aria-hidden="true" />
    </button>
  );
}

function ProductVisual({ product, large = false, className = '' }) {
  const images = getProductImages(product);
  const firstImage = images[0];

  return (
    <div className={`${className ? `${className} ` : ''}product-visual ${product.color}${firstImage ? ' has-photo' : ''}`}>
      {firstImage ? (
        <>
          <img className="product-photo" src={firstImage.url} alt={firstImage.alt || product.name} />
          {images.length > 1 ? <span className="image-count">{images.length} fotos</span> : null}
        </>
      ) : (
        <DeviceShape visual={product.visual} large={large} />
      )}
    </div>
  );
}

function ProductGallery({ product }) {
  const images = getProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  if (!images.length) {
    return <ProductVisual product={product} large className="detail-media" />;
  }

  const activeImage = images[Math.min(activeIndex, images.length - 1)] || images[0];

  return (
    <div className="product-gallery">
      <div className={`detail-media product-visual ${product.color} has-photo`}>
        <img className="product-photo" src={activeImage.url} alt={activeImage.alt || product.name} />
      </div>

      {images.length > 1 ? (
        <div className="gallery-thumbs" aria-label="Imagens do produto">
          {images.map((image, index) => (
            <button
              className={index === activeIndex ? 'active' : ''}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagem ${index + 1} de ${product.name}`}
              key={image.id}
            >
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DeviceShape({ visual, large = false }) {
  return <span className={`device-shape ${visual}${large ? ' large' : ''}`} />;
}

function PhoneMockup({ storeName }) {
  const tiles = ['green', 'blue', 'amber', 'red', 'violet', 'cyan', 'rose', 'graphite'];

  return (
    <div className="phone-mockup">
      <div className="phone-screen">
        <div className="dynamic-island" />
        <div className="screen-heading">
          <span>{storeName}</span>
          <strong>Pro Store</strong>
        </div>
        <div className="tile-grid">
          {tiles.map((tile, index) => (
            <span
              className={`app-tile ${tile}`}
              style={{ animationDelay: `${index * 0.08}s` }}
              key={tile}
            />
          ))}
        </div>
        <div className="phone-dock">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function Footer({ settings, categories, navigate }) {
  return (
    <footer className="footer">
      <div>
        <AppLink className="brand footer-brand" to="/" navigate={navigate}>
          <span>{settings.storeName.slice(0, 1)}</span>
          {settings.storeName.slice(1)}
        </AppLink>
        <p>{settings.tagline} · Produtos Apple e Android originais</p>
      </div>

      <div className="footer-links">
        {categories.map((category) => (
          <AppLink key={category.id} to={`/categoria/${category.slug}`} navigate={navigate}>
            {category.name}
          </AppLink>
        ))}
      </div>

      <small>Copyright © 2026 {settings.storeName}. Atendimento via WhatsApp: {settings.phoneDisplay}.</small>
    </footer>
  );
}

function NotFound({ navigate }) {
  return (
    <section className="empty-state">
      <ArrowLeft size={26} aria-hidden="true" />
      <h1>Página não encontrada</h1>
      <p>Esse endereço não está no catálogo da loja.</p>
      <AppLink className="button primary" to="/" navigate={navigate}>
        Voltar para o início
      </AppLink>
    </section>
  );
}
