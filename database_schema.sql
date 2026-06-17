-- ==========================================
-- WORLD-CLASS MERCHANT ADMIN OS DATABASE SCHEMA
-- Compatible with PostgreSQL (Enterprise Level)
-- Strictly structured for high-performance indexing,
-- referential integrity, and elegant, clean layouts.
-- ==========================================

-- 1. STORES / OUTLETS REFERENCE
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    currency_symbol VARCHAR(5) DEFAULT '€',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    tax_rate DECIMAL(5,2) DEFAULT 19.00,
    plan VARCHAR(20) DEFAULT 'Basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS MASTER
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) REFERENCES stores(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vendor VARCHAR(100) DEFAULT 'Studio Nord',
    type VARCHAR(100) DEFAULT 'General',
    status VARCHAR(20) CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'draft',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    compare_at_price DECIMAL(10,2),
    cost_per_item DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    inventory INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCT IMAGES / ASSETS
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    image_key VARCHAR(50) NOT NULL, -- e.g. 'wallet', 'shirt', 'dripper'
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS ARCHIVE
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(50),
    orders_count INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    segment VARCHAR(50) DEFAULT 'All', -- All, VIP, Returning, B2B
    company VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    address_lines VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DISCOUNTS AND COUPONS
CREATE TABLE IF NOT EXISTS discounts (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(30) CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')) NOT NULL,
    value DECIMAL(10,2) NOT NULL, -- e.g. 15.00 for 15% or €15
    value_text VARCHAR(50) NOT NULL, -- e.g. "15% OFF" or "€10 OFF"
    status VARCHAR(20) CHECK (status IN ('active', 'expired', 'scheduled')) DEFAULT 'active',
    usage_count INT DEFAULT 0,
    usage_limit INT,
    min_requirement DECIMAL(10,2) DEFAULT 0.00,
    once_per_customer BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PLANNED ORDERS FLOW (CORE TRANSACTIONS)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) REFERENCES stores(id) ON DELETE SET NULL,
    name VARCHAR(20) NOT NULL UNIQUE, -- e.g. "#1001"
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_code VARCHAR(50) REFERENCES discounts(code) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'pending', 'refunded')) DEFAULT 'pending',
    fulfillment_status VARCHAR(20) CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled')) DEFAULT 'unfulfilled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDER ITEMS (LINE ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(50) DEFAULT 'wallet'
);

-- 9. DRAFT CONTRACTS (DRAFT ORDERS)
CREATE TABLE IF NOT EXISTS draft_orders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE, -- e.g. "#D-1001"
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('open', 'completed')) DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DRAFT LINE ITEMS
CREATE TABLE IF NOT EXISTS draft_order_items (
    id BIGSERIAL PRIMARY KEY,
    draft_order_id VARCHAR(50) REFERENCES draft_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL
);

-- 11. ABANDONED CHECKOUT CARTS
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
    id VARCHAR(50) PRIMARY KEY,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    recovered BOOLEAN DEFAULT false,
    recovery_email_sent BOOLEAN DEFAULT false,
    cart_data JSONB NOT NULL, -- Serialized item detail contents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recovered_at TIMESTAMP WITH TIME ZONE
);

-- 12. RETURNS MANAGEMENT (REVERSE LOGISTICS)
CREATE TABLE IF NOT EXISTS returns_requests (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(25) CHECK (status IN ('requested', 'approved', 'received', 'declined')) DEFAULT 'requested',
    item_json JSONB NOT NULL, -- Array of products and quantities to return
    tracking_number VARCHAR(100),
    merchant_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- CONSTANT PERFORMANCE OPTIMIZATION INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_abandoned_email ON abandoned_checkouts(customer_email);
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns_requests(order_id);

-- ==========================================
-- INITIAL ATELIER PORTFOLIO SEEDING
-- ==========================================

INSERT INTO stores (id, name, email, plan) 
VALUES ('store-nord', 'Atelier Nord', 'manager@atelier-nord.com', 'Advanced')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, store_id, title, description, vendor, type, status, price, sku, inventory)
VALUES 
('prod-01', 'store-nord', 'Minimalist Leather Pocket Wallet', 'An ultra-slim, full-grain leather cardholder.', 'Studio Nord', 'Accessories', 'active', 49.00, 'SN-WLT-BLK', 42),
('prod-02', 'store-nord', 'Raw Organic Hemp Tee', 'Mediumweight 100% organic European hemp.', 'EcoStitch', 'Apparel', 'active', 39.00, 'ES-HMP-RAW', 154),
('prod-03', 'store-nord', 'Ceramic Pour-Over Coffee Brewer', 'Matte charcoal clay dripper.', 'Mono Ceramics', 'Kitchenware', 'active', 35.00, 'MC-DRP-CHR', 3)
ON CONFLICT DO NOTHING;
