-- =====================================================
-- MODAIX - Esquema de Base de Datos
-- =====================================================
-- Este archivo contiene la estructura de base de datos
-- para la aplicación MODAIX
-- =====================================================

-- Tabla: products
-- Almacena todos los productos de la tienda
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    gender VARCHAR(20), -- 'hombre', 'mujer', 'unisex'
    material VARCHAR(100),
    cut VARCHAR(50), -- 'ajustado', 'regular', 'holgado', 'oversize'
    
    -- Imágenes (almacenar como JSON array o texto delimitado)
    image VARCHAR(500) NOT NULL, -- Imagen principal
    images TEXT, -- Array de imágenes adicionales (JSON)
    
    -- Stock
    stock INTEGER DEFAULT 0,
    size_stock JSONB, -- Stock por talla: {"XS": 5, "S": 10, "M": 15, "L": 10, "XL": 5}
    
    -- Colores disponibles (como JSON array)
    colors JSONB, -- ["black", "white", "blue"]
    
    -- Estado
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'low', 'out'
    featured BOOLEAN DEFAULT false, -- Para productos destacados en home
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: categories
-- Almacena las categorías de productos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: orders
-- Almacena los pedidos de clientes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Dirección de envío
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Detalles del pedido
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
    payment_method VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: order_items
-- Almacena los productos individuales de cada pedido
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Almacenar el nombre para histórico
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(10), -- 'XS', 'S', 'M', 'L', 'XL'
    color VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL, -- Precio al momento de la compra
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: users
-- Almacena información de usuarios/clientes
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin'
    
    -- Dirección
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Tabla: cart
-- Almacena el carrito de compras temporal
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- Para usuarios no autenticados
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(10),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: notifications
-- Almacena notificaciones del dashboard
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'order', 'stock', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    is_read BOOLEAN DEFAULT false,
    related_order_id INTEGER REFERENCES orders(id),
    related_product_id INTEGER REFERENCES products(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES para mejor performance
-- =====================================================

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_session_id ON cart(session_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar categorías
INSERT INTO categories (name, slug, description) VALUES
('Vestidos', 'vestidos', 'Vestidos elegantes y casuales'),
('Abrigos', 'abrigos', 'Abrigos y chaquetas de temporada'),
('Pantalones', 'pantalones', 'Pantalones formales y casuales'),
('Camisas', 'camisas', 'Camisas y blusas'),
('Zapatos', 'zapatos', 'Calzado de alta calidad')
ON CONFLICT (name) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (
    name, 
    price, 
    description, 
    category, 
    brand, 
    gender, 
    material, 
    cut, 
    image, 
    stock, 
    size_stock, 
    colors, 
    status, 
    featured
) VALUES
(
    'Vestido Minimal',
    1299.00,
    'Vestido elegante y minimalista perfecto para cualquier ocasión',
    'Vestidos',
    'MODAIX',
    'mujer',
    'algodon',
    'regular',
    'https://images.unsplash.com/photo-1542219550-2da790bf52e9?w=800',
    45,
    '{"XS": 5, "S": 10, "M": 15, "L": 10, "XL": 5}'::jsonb,
    '["black", "white"]'::jsonb,
    'active',
    true
),
(
    'Coat Elegante',
    2499.00,
    'Abrigo elegante para las temporadas frías',
    'Abrigos',
    'MODAIX',
    'mujer',
    'lana',
    'regular',
    'https://images.unsplash.com/photo-1565128260358-318e131efbb6?w=800',
    8,
    '{"XS": 0, "S": 2, "M": 3, "L": 2, "XL": 1}'::jsonb,
    '["black", "gray"]'::jsonb,
    'low',
    true
),
(
    'Vestido Noche',
    1899.00,
    'Vestido de noche para eventos especiales',
    'Vestidos',
    'MODAIX',
    'mujer',
    'seda',
    'ajustado',
    'https://images.unsplash.com/photo-1760287363707-851f4780b98c?w=800',
    0,
    '{"XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0}'::jsonb,
    '["black"]'::jsonb,
    'out',
    true
),
(
    'Traje Ejecutivo',
    3299.00,
    'Traje formal para hombre',
    'Formal',
    'MODAIX',
    'hombre',
    'lana',
    'regular',
    'https://images.unsplash.com/photo-1724245190409-97f3415a7d78?w=800',
    20,
    '{"XS": 2, "S": 5, "M": 7, "L": 4, "XL": 2}'::jsonb,
    '["black", "gray", "blue"]'::jsonb,
    'active',
    true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
