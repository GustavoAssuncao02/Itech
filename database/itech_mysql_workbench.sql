CREATE DATABASE IF NOT EXISTS itech_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE itech_store;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS product_specs;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS store_locations;
DROP TABLE IF EXISTS business_hours;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS store_settings;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE store_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE users (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE admins (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'blocked') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE categories (
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
) ENGINE=InnoDB;

CREATE TABLE products (
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
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_slug) REFERENCES categories(slug)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_images (
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
) ENGINE=InnoDB;

CREATE TABLE product_specs (
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
) ENGINE=InnoDB;

CREATE TABLE user_favorites (
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
) ENGINE=InnoDB;

CREATE TABLE orders (
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
) ENGINE=InnoDB;

CREATE TABLE reservations (
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
) ENGINE=InnoDB;

CREATE TABLE business_hours (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  display_time VARCHAR(120) NOT NULL,
  weekday_start TINYINT UNSIGNED NOT NULL,
  weekday_end TINYINT UNSIGNED NOT NULL,
  open_minutes SMALLINT UNSIGNED NOT NULL,
  close_minutes SMALLINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE store_locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  state CHAR(2) NOT NULL,
  label VARCHAR(160) NOT NULL,
  maps_url TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NULL,
  product_id VARCHAR(120) NULL,
  message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leads_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO store_settings (setting_key, setting_value) VALUES
  ('storeName', 'iTech'),
  ('tagline', 'A Loja do Seu iPhone'),
  ('heroBadge', 'Novo - iPhone 16 Pro disponivel'),
  ('heroTitle', 'A Loja do Seu iPhone'),
  ('heroAccent', 'iPhone'),
  ('heroSubtitle', 'Produtos Apple originais e certificados, garantia oficial, atendimento especializado e parcelamento facilitado.'),
  ('phoneDisplay', '(71) 99670-4345'),
  ('phoneNumber', '5571996704345'),
  ('instagramUrl', 'https://www.instagram.com/itechcatu/'),
  ('pixKey', '(71) 99670-4345'),
  ('location', 'Catu-BA e Alagoinhas-BA');

INSERT INTO categories
  (id, slug, name, title, description, icon, show_in_nav, show_on_home, sort_order)
VALUES
  ('cat-iphone', 'iphone', 'iPhone', 'iPhone', 'iPhone 16, 15, SE e modelos seminovos certificados', 'smartphone', 1, 1, 1),
  ('cat-mac', 'mac', 'Mac', 'Mac', 'MacBook Air, MacBook Pro e iMac para trabalho pesado', 'laptop', 1, 1, 2),
  ('cat-watch', 'apple-watch', 'Apple Watch', 'Apple Watch', 'Serie 10, Ultra 2 e SE com pulseiras selecionadas', 'watch', 1, 1, 3),
  ('cat-airpods', 'airpods', 'AirPods', 'AirPods', 'AirPods Pro, AirPods 4 e AirPods Max', 'headphones', 1, 1, 4),
  ('cat-android', 'android', 'Android', 'Android', 'Samsung, Motorola e Xiaomi novos e seminovos', 'smartphone', 1, 1, 5),
  ('cat-speakers', 'caixas-de-som', 'Caixas de som', 'Caixas de som', 'JBL, Anker e caixas Bluetooth para qualquer rotina', 'speaker', 1, 1, 6),
  ('cat-ipad', 'ipad', 'iPad', 'iPad', 'iPad Pro, Air, mini e acessorios de produtividade', 'tablet', 0, 1, 7),
  ('cat-accessories', 'acessorios', 'Acessorios', 'Acessorios', 'Capas, cabos, fontes, MagSafe e protecao', 'cable', 0, 1, 8);

INSERT INTO products
  (id, category_slug, name, tag, product_condition, price, installments, description, color, visual, featured, sale_status, sort_order)
VALUES
  ('iphone-16-pro', 'iphone', 'iPhone 16 Pro', 'iPhone', 'Novo', 9299.00, '12x de R$ 774,92', 'Chip A18 Pro, camera de 48 MP e tela ProMotion de 6,3 polegadas.', 'blue', 'phone', 1, 'available', 1),
  ('iphone-16', 'iphone', 'iPhone 16', 'Novo', 'Novo', 7499.00, '12x de R$ 624,92', 'Camera Fusion de 48 MP, chip A18 e botao de acao para atalhos rapidos.', 'green', 'phone', 1, 'available', 2),
  ('iphone-15', 'iphone', 'iPhone 15', 'Mais vendido', 'Novo', 5299.00, '12x de R$ 441,58', 'Dynamic Island, camera principal de 48 MP e acabamento resistente.', 'black', 'phone', 1, 'available', 3),
  ('iphone-14-pro-seminovo', 'iphone', 'iPhone 14 Pro', 'Seminovo', 'Semi-novo', 4599.00, '12x de R$ 383,25', 'Tela ProMotion, Dynamic Island, cameras Pro e bateria revisada.', 'midnight', 'phone', 0, 'available', 4),
  ('macbook-air-m3', 'mac', 'MacBook Air M3', 'Mac', 'Novo', 12499.00, '12x de R$ 1.041,58', 'Chip M3, 8 GB de memoria unificada e tela Liquid Retina de 13,6 polegadas.', 'silver', 'laptop', 1, 'available', 5),
  ('macbook-pro-m3-pro', 'mac', 'MacBook Pro M3 Pro', 'Mac', 'Novo', 18999.00, '12x de R$ 1.583,25', 'Tela Liquid Retina XDR de 14 polegadas, alto desempenho e bateria longa.', 'black', 'laptop', 0, 'available', 6),
  ('apple-watch-series-10', 'apple-watch', 'Apple Watch S10', 'Watch', 'Novo', 4099.00, '12x de R$ 341,58', 'Display de 46 mm, GPS, deteccao de queda e acompanhamento de saude.', 'midnight', 'watch', 1, 'available', 7),
  ('apple-watch-ultra-2', 'apple-watch', 'Apple Watch Ultra 2', 'Watch', 'Novo', 7399.00, '12x de R$ 616,58', 'Caixa de titanio, GPS preciso, botao de acao e bateria para treinos longos.', 'orange', 'watch', 0, 'available', 8),
  ('airpods-pro-2', 'airpods', 'AirPods Pro 2', 'AirPods', 'Novo', 2299.00, '12x de R$ 191,58', 'Cancelamento ativo de ruido, audio adaptativo e estojo MagSafe.', 'white', 'audio', 1, 'available', 9),
  ('airpods-4', 'airpods', 'AirPods 4', 'AirPods', 'Novo', 1499.00, '12x de R$ 124,92', 'Novo encaixe, audio espacial personalizado e integracao rapida com iPhone.', 'white', 'audio', 0, 'available', 10),
  ('android-galaxy-s25', 'android', 'Galaxy S25 Ultra', 'Android', 'Novo', 7899.00, '12x de R$ 658,25', 'Tela grande, cameras avancadas e alto desempenho para uso intenso.', 'black', 'phone', 1, 'available', 11),
  ('android-edge-50-seminovo', 'android', 'Motorola Edge 50', 'Semi-novo', 'Semi-novo', 2299.00, '12x de R$ 191,58', 'Tela OLED, bom desempenho e aparelho revisado pela loja.', 'green', 'phone', 0, 'available', 12),
  ('speaker-jbl-flip-6', 'caixas-de-som', 'JBL Flip 6', 'Bluetooth', 'Novo', 899.00, '12x de R$ 74,92', 'Som potente, bateria longa e resistencia para levar para qualquer lugar.', 'black', 'speaker', 1, 'available', 13),
  ('speaker-go-4', 'caixas-de-som', 'JBL Go 4', 'Portatil', 'Novo', 399.00, '12x de R$ 33,25', 'Caixa compacta com bom volume, ideal para uso diario.', 'blue', 'speaker', 0, 'available', 14),
  ('ipad-air-m2', 'ipad', 'iPad Air M2', 'iPad', 'Novo', 6499.00, '12x de R$ 541,58', 'Chip M2, Wi-Fi 6E e tela Liquid Retina de 11 polegadas.', 'blue', 'tablet', 1, 'available', 15);

INSERT INTO product_specs (product_id, label, value, sort_order) VALUES
  ('iphone-16-pro', 'Capacidade', '128 GB', 1),
  ('iphone-16-pro', 'Cor', 'Titanio natural', 2),
  ('iphone-16-pro', 'Status', 'Garantia iTech', 3),
  ('iphone-16-pro', 'Entrega', 'Pronta entrega', 4),
  ('iphone-16', 'Capacidade', '128 GB', 1),
  ('iphone-16', 'Cor', 'Ultramarino', 2),
  ('iphone-16', 'Status', 'Lacrado', 3),
  ('iphone-16', 'Entrega', 'Pronta entrega', 4),
  ('iphone-15', 'Capacidade', '128 GB', 1),
  ('iphone-15', 'Cor', 'Preto', 2),
  ('iphone-15', 'Status', 'Garantia iTech', 3),
  ('iphone-15', 'Entrega', 'USB-C', 4),
  ('iphone-14-pro-seminovo', 'Capacidade', '256 GB', 1),
  ('iphone-14-pro-seminovo', 'Cor', 'Roxo profundo', 2),
  ('iphone-14-pro-seminovo', 'Status', 'Saude 89%', 3),
  ('iphone-14-pro-seminovo', 'Entrega', 'Revisado', 4),
  ('macbook-air-m3', 'Capacidade', '256 GB SSD', 1),
  ('macbook-air-m3', 'Memoria', '8 GB RAM', 2),
  ('macbook-air-m3', 'Cor', 'Meia-noite', 3),
  ('macbook-air-m3', 'Status', 'Lacrado', 4),
  ('macbook-pro-m3-pro', 'Capacidade', '512 GB SSD', 1),
  ('macbook-pro-m3-pro', 'Memoria', '18 GB RAM', 2),
  ('macbook-pro-m3-pro', 'Cor', 'Space Black', 3),
  ('macbook-pro-m3-pro', 'Status', 'Garantia iTech', 4),
  ('apple-watch-series-10', 'Tamanho', '46 mm', 1),
  ('apple-watch-series-10', 'Conexao', 'GPS', 2),
  ('apple-watch-series-10', 'Pulseira', 'M/L', 3),
  ('apple-watch-series-10', 'Status', 'Lacrado', 4),
  ('apple-watch-ultra-2', 'Tamanho', '49 mm', 1),
  ('apple-watch-ultra-2', 'Material', 'Titanio', 2),
  ('apple-watch-ultra-2', 'Conexao', 'GPS + Cellular', 3),
  ('apple-watch-ultra-2', 'Status', 'Garantia iTech', 4),
  ('airpods-pro-2', 'Conexao', 'USB-C', 1),
  ('airpods-pro-2', 'Estojo', 'MagSafe', 2),
  ('airpods-pro-2', 'Audio', 'Audio espacial', 3),
  ('airpods-pro-2', 'Status', 'Lacrado', 4),
  ('airpods-4', 'Conexao', 'USB-C', 1),
  ('airpods-4', 'Audio', 'Audio espacial', 2),
  ('airpods-4', 'Estojo', 'Compacto', 3),
  ('airpods-4', 'Status', 'Lacrado', 4),
  ('android-galaxy-s25', 'Capacidade', '256 GB', 1),
  ('android-galaxy-s25', 'Cor', 'Preto', 2),
  ('android-galaxy-s25', 'Status', 'Lacrado', 3),
  ('android-galaxy-s25', 'Entrega', 'Pronta entrega', 4),
  ('android-edge-50-seminovo', 'Capacidade', '256 GB', 1),
  ('android-edge-50-seminovo', 'Cor', 'Verde', 2),
  ('android-edge-50-seminovo', 'Status', 'Revisado', 3),
  ('android-edge-50-seminovo', 'Garantia', 'Garantia iTech', 4),
  ('speaker-jbl-flip-6', 'Conexao', 'Bluetooth', 1),
  ('speaker-jbl-flip-6', 'Cor', 'Preto', 2),
  ('speaker-jbl-flip-6', 'Status', 'Lacrada', 3),
  ('speaker-jbl-flip-6', 'Entrega', 'Pronta entrega', 4),
  ('speaker-go-4', 'Conexao', 'Bluetooth', 1),
  ('speaker-go-4', 'Cor', 'Azul', 2),
  ('speaker-go-4', 'Status', 'Lacrada', 3),
  ('speaker-go-4', 'Entrega', 'Pronta entrega', 4),
  ('ipad-air-m2', 'Capacidade', '128 GB', 1),
  ('ipad-air-m2', 'Cor', 'Azul', 2),
  ('ipad-air-m2', 'Conexao', 'Wi-Fi', 3),
  ('ipad-air-m2', 'Status', 'Lacrado', 4);

INSERT INTO business_hours
  (label, display_time, weekday_start, weekday_end, open_minutes, close_minutes, sort_order)
VALUES
  ('Segunda a sexta', '8h as 17h30', 1, 5, 480, 1050, 1),
  ('Sabado', '8h as 12h', 6, 6, 480, 720, 2);

INSERT INTO store_locations (city, state, label, maps_url, sort_order) VALUES
  ('Catu', 'BA', 'Unidade Catu-BA', 'https://maps.app.goo.gl/GtTJUAoFMqrtMWay6', 1),
  ('Alagoinhas', 'BA', 'Unidade Alagoinhas-BA', NULL, 2);

-- Exemplo para cadastrar mais de uma imagem no mesmo produto:
-- INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_cover) VALUES
--   ('iphone-16-pro', 'https://seu-site.com/imagens/iphone-16-pro-frente.jpg', 'iPhone 16 Pro frente', 1, 1),
--   ('iphone-16-pro', 'https://seu-site.com/imagens/iphone-16-pro-verso.jpg', 'iPhone 16 Pro verso', 2, 0);
