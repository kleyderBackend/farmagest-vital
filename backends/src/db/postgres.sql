CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'staff'))
);

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    presentation VARCHAR(100),
    description TEXT,
    sale_price NUMERIC(10, 2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    expiration_date DATE,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),
    CONSTRAINT chk_products_sale_price
        CHECK (sale_price >= 0),
    CONSTRAINT chk_products_stock
        CHECK (current_stock >= 0),
    CONSTRAINT chk_products_minimum_stock
        CHECK (minimum_stock >= 0)
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
    cart_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_customers
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),
    CONSTRAINT chk_carts_status
        CHECK (status IN ('active', 'converted', 'abandoned'))
);

CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_cart_items_carts
        FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id),
    CONSTRAINT fk_cart_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(product_id),
    CONSTRAINT chk_cart_items_quantity
        CHECK (quantity > 0),
    CONSTRAINT chk_cart_items_prices
        CHECK (unit_price >= 0 AND subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customers
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),
    CONSTRAINT chk_orders_total
        CHECK (total >= 0),
    CONSTRAINT chk_orders_status
        CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_orders
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id),
    CONSTRAINT fk_order_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(product_id),
    CONSTRAINT chk_order_items_quantity
        CHECK (quantity > 0),
    CONSTRAINT chk_order_items_prices
        CHECK (unit_price >= 0 AND subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    movement_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_movements_products
        FOREIGN KEY (product_id)
        REFERENCES products(product_id),
    CONSTRAINT fk_inventory_movements_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT chk_inventory_movements_quantity
        CHECK (quantity > 0),
    CONSTRAINT chk_inventory_movements_type
        CHECK (movement_type IN ('in', 'out', 'adjustment'))
);

INSERT INTO categories (name, description)
SELECT 'Medicamentos', 'Productos farmacéuticos de uso general'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Medicamentos'));

INSERT INTO categories (name, description)
SELECT 'Cuidado personal', 'Artículos para higiene y cuidado diario'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Cuidado personal'));

INSERT INTO categories (name, description)
SELECT 'Vitaminas', 'Suplementos y vitaminas para bienestar'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Vitaminas'));

INSERT INTO categories (name, description)
SELECT 'Bebés', 'Productos básicos para cuidado infantil'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER('Bebés'));

INSERT INTO products (
    category_id,
    name,
    presentation,
    description,
    sale_price,
    current_stock,
    minimum_stock,
    expiration_date,
    image_url,
    is_available
)
SELECT
    c.category_id,
    'Acetaminofén 500mg',
    'Caja x 20 tabletas',
    'Analgésico de uso común para malestares leves.',
    8500,
    40,
    8,
    CURRENT_DATE + INTERVAL '18 months',
    NULL,
    TRUE
FROM categories c
WHERE LOWER(c.name) = LOWER('Medicamentos')
  AND NOT EXISTS (SELECT 1 FROM products WHERE LOWER(name) = LOWER('Acetaminofén 500mg'));

INSERT INTO products (
    category_id,
    name,
    presentation,
    description,
    sale_price,
    current_stock,
    minimum_stock,
    expiration_date,
    image_url,
    is_available
)
SELECT
    c.category_id,
    'Alcohol antiséptico',
    'Frasco 700ml',
    'Solución para limpieza externa y desinfección básica.',
    7200,
    28,
    6,
    CURRENT_DATE + INTERVAL '24 months',
    NULL,
    TRUE
FROM categories c
WHERE LOWER(c.name) = LOWER('Cuidado personal')
  AND NOT EXISTS (SELECT 1 FROM products WHERE LOWER(name) = LOWER('Alcohol antiséptico'));

INSERT INTO products (
    category_id,
    name,
    presentation,
    description,
    sale_price,
    current_stock,
    minimum_stock,
    expiration_date,
    image_url,
    is_available
)
SELECT
    c.category_id,
    'Vitamina C',
    'Frasco x 60 tabletas',
    'Suplemento para apoyo nutricional diario.',
    18500,
    22,
    5,
    CURRENT_DATE + INTERVAL '20 months',
    NULL,
    TRUE
FROM categories c
WHERE LOWER(c.name) = LOWER('Vitaminas')
  AND NOT EXISTS (SELECT 1 FROM products WHERE LOWER(name) = LOWER('Vitamina C'));

INSERT INTO products (
    category_id,
    name,
    presentation,
    description,
    sale_price,
    current_stock,
    minimum_stock,
    expiration_date,
    image_url,
    is_available
)
SELECT
    c.category_id,
    'Pañitos húmedos',
    'Paquete x 80 unidades',
    'Pañitos suaves para limpieza y cuidado del bebé.',
    11900,
    35,
    10,
    CURRENT_DATE + INTERVAL '16 months',
    NULL,
    TRUE
FROM categories c
WHERE LOWER(c.name) = LOWER('Bebés')
  AND NOT EXISTS (SELECT 1 FROM products WHERE LOWER(name) = LOWER('Pañitos húmedos'));
