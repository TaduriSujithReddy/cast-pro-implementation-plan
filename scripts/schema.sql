-- CastPro Database Schema
-- Run this on PostgreSQL (or MySQL with minor adjustments) for local setup

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('manager','biller')),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  contact_person   VARCHAR(100),
  email            VARCHAR(150),
  phone            VARCHAR(20),
  address          TEXT,
  performance_rating NUMERIC(3,2) DEFAULT 0,
  total_orders     INT DEFAULT 0,
  on_time_delivery INT DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  sku           VARCHAR(50) UNIQUE NOT NULL,
  category      VARCHAR(100) NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  cost_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  threshold     INT NOT NULL DEFAULT 10,
  unit          VARCHAR(30) DEFAULT 'pcs',
  vendor_id     INT REFERENCES vendors(id) ON DELETE SET NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
  id              SERIAL PRIMARY KEY,
  bill_number     VARCHAR(30) UNIQUE NOT NULL,
  biller_id       INT REFERENCES users(id),
  customer_name   VARCHAR(150),
  customer_phone  VARCHAR(20),
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 5,
  tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method  VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash','upi')),
  payment_status  VARCHAR(20) DEFAULT 'completed',
  cash_received   NUMERIC(10,2) DEFAULT 0,
  change_returned NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_items (
  id         SERIAL PRIMARY KEY,
  bill_id    INT REFERENCES bills(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total      NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id           SERIAL PRIMARY KEY,
  product_id   INT REFERENCES products(id) ON DELETE CASCADE,
  alert_type   VARCHAR(30) NOT NULL,
  severity     VARCHAR(20) NOT NULL CHECK (severity IN ('critical','warning','info')),
  message      TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INT REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  message    TEXT,
  type       VARCHAR(30) DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_settings (
  id              SERIAL PRIMARY KEY,
  store_name      VARCHAR(200) DEFAULT 'CastPro Store',
  store_address   TEXT,
  store_phone     VARCHAR(20),
  tax_rate        NUMERIC(5,2) DEFAULT 5,
  receipt_footer  TEXT DEFAULT 'Thank you for your purchase!',
  upi_qr_image   TEXT,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor   ON products(vendor_id);
CREATE INDEX idx_bills_biller      ON bills(biller_id);
CREATE INDEX idx_bills_created     ON bills(created_at);
CREATE INDEX idx_stock_alerts_sev  ON stock_alerts(severity);
CREATE INDEX idx_notifications_user ON notifications(user_id);
