# 🗺️ Mapeo de Base de Datos - MODAIX

Este documento describe el mapeo completo entre las tablas de la base de datos SQL y las interfaces TypeScript de la aplicación.

---

## 📋 Tablas de Base de Datos

### 1. **products** - Productos de la tienda

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `Product.id: number` | ID único del producto |
| `name` | VARCHAR(255) | `Product.name: string` | Nombre del producto |
| `price` | DECIMAL(10, 2) | `Product.price: number` | Precio del producto |
| `description` | TEXT | `Product.description?: string` | Descripción detallada |
| `category` | VARCHAR(100) | `Product.category: string` | Categoría del producto |
| `brand` | VARCHAR(100) | `Product.brand?: string` | Marca del producto |
| `gender` | VARCHAR(20) | `Product.gender?: string` | 'hombre', 'mujer', 'unisex' |
| `material` | VARCHAR(100) | `Product.material?: string` | Material del producto |
| `cut` | VARCHAR(50) | `Product.cut?: string` | 'ajustado', 'regular', 'holgado', 'oversize' |
| `image` | VARCHAR(500) | `Product.image: string` | Imagen principal (URL) |
| `images` | TEXT | `Product.images?: string[]` | Array de imágenes adicionales (JSON) |
| `stock` | INTEGER | `Product.stock: number` | Stock total disponible |
| `size_stock` | JSONB | `Product.size_stock?: object` | Stock por talla {XS, S, M, L, XL} |
| `colors` | JSONB | `Product.colors?: string[]` | Array de colores disponibles |
| `status` | VARCHAR(20) | `Product.status?: string` | 'active', 'low', 'out' |
| `featured` | BOOLEAN | `Product.featured?: boolean` | Producto destacado en home |
| `created_at` | TIMESTAMP | `Product.created_at?: Date` | Fecha de creación |
| `updated_at` | TIMESTAMP | `Product.updated_at?: Date` | Fecha de última actualización |

**Ejemplo de consulta:**
```sql
SELECT * FROM products WHERE featured = true LIMIT 6;
SELECT * FROM products WHERE category = 'Vestidos' AND gender = 'mujer';
```

---

### 2. **categories** - Categorías de productos

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `Category.id: number` | ID único de la categoría |
| `name` | VARCHAR(100) UNIQUE | `Category.name: string` | Nombre de la categoría |
| `slug` | VARCHAR(100) UNIQUE | `Category.slug: string` | Slug URL-friendly |
| `description` | TEXT | `Category.description?: string` | Descripción de la categoría |
| `created_at` | TIMESTAMP | `Category.created_at?: Date` | Fecha de creación |

**Ejemplo de consulta:**
```sql
SELECT * FROM categories ORDER BY name;
```

---

### 3. **orders** - Pedidos de clientes

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `Order.id: number` | ID único del pedido |
| `order_number` | VARCHAR(50) UNIQUE | `Order.order_number: string` | Número de pedido único |
| `customer_name` | VARCHAR(255) | `Order.customer_name: string` | Nombre del cliente |
| `customer_email` | VARCHAR(255) | `Order.customer_email: string` | Email del cliente |
| `customer_phone` | VARCHAR(50) | `Order.customer_phone?: string` | Teléfono del cliente |
| `shipping_address` | TEXT | `Order.shipping_address: string` | Dirección de envío |
| `shipping_city` | VARCHAR(100) | `Order.shipping_city?: string` | Ciudad de envío |
| `shipping_state` | VARCHAR(100) | `Order.shipping_state?: string` | Estado/provincia |
| `shipping_postal_code` | VARCHAR(20) | `Order.shipping_postal_code?: string` | Código postal |
| `shipping_country` | VARCHAR(100) | `Order.shipping_country?: string` | País |
| `subtotal` | DECIMAL(10, 2) | `Order.subtotal: number` | Subtotal del pedido |
| `shipping_cost` | DECIMAL(10, 2) | `Order.shipping_cost: number` | Costo de envío |
| `tax` | DECIMAL(10, 2) | `Order.tax: number` | Impuestos |
| `total` | DECIMAL(10, 2) | `Order.total: number` | Total del pedido |
| `status` | VARCHAR(50) | `Order.status: string` | 'pending', 'processing', 'shipped', 'delivered', 'cancelled' |
| `payment_status` | VARCHAR(50) | `Order.payment_status: string` | 'pending', 'paid', 'refunded' |
| `payment_method` | VARCHAR(50) | `Order.payment_method?: string` | Método de pago |
| `created_at` | TIMESTAMP | `Order.created_at?: Date` | Fecha de creación |
| `updated_at` | TIMESTAMP | `Order.updated_at?: Date` | Fecha de actualización |

**Ejemplo de consulta:**
```sql
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
SELECT * FROM orders WHERE customer_email = 'user@example.com';
```

---

### 4. **order_items** - Items de cada pedido

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `OrderItem.id: number` | ID único del item |
| `order_id` | INTEGER FK | `OrderItem.order_id: number` | Referencia al pedido |
| `product_id` | INTEGER FK | `OrderItem.product_id: number` | Referencia al producto |
| `product_name` | VARCHAR(255) | `OrderItem.product_name: string` | Nombre del producto (histórico) |
| `product_image` | VARCHAR(500) | `OrderItem.product_image?: string` | Imagen del producto |
| `quantity` | INTEGER | `OrderItem.quantity: number` | Cantidad comprada |
| `size` | VARCHAR(10) | `OrderItem.size?: string` | Talla seleccionada |
| `color` | VARCHAR(50) | `OrderItem.color?: string` | Color seleccionado |
| `price` | DECIMAL(10, 2) | `OrderItem.price: number` | Precio al momento de compra |
| `subtotal` | DECIMAL(10, 2) | `OrderItem.subtotal: number` | Subtotal (price * quantity) |
| `created_at` | TIMESTAMP | `OrderItem.created_at?: Date` | Fecha de creación |

**Ejemplo de consulta:**
```sql
SELECT * FROM order_items WHERE order_id = 123;
SELECT oi.*, p.name FROM order_items oi 
  JOIN products p ON oi.product_id = p.id 
  WHERE oi.order_id = 123;
```

---

### 5. **users** - Usuarios/Clientes

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `User.id: number` | ID único del usuario |
| `email` | VARCHAR(255) UNIQUE | `User.email: string` | Email (único) |
| `password_hash` | VARCHAR(255) | `User.password_hash: string` | Hash de contraseña |
| `first_name` | VARCHAR(100) | `User.first_name?: string` | Nombre |
| `last_name` | VARCHAR(100) | `User.last_name?: string` | Apellido |
| `phone` | VARCHAR(50) | `User.phone?: string` | Teléfono |
| `role` | VARCHAR(20) | `User.role: string` | 'customer', 'admin' |
| `address` | TEXT | `User.address?: string` | Dirección |
| `city` | VARCHAR(100) | `User.city?: string` | Ciudad |
| `state` | VARCHAR(100) | `User.state?: string` | Estado/provincia |
| `postal_code` | VARCHAR(20) | `User.postal_code?: string` | Código postal |
| `country` | VARCHAR(100) | `User.country?: string` | País |
| `created_at` | TIMESTAMP | `User.created_at?: Date` | Fecha de registro |
| `updated_at` | TIMESTAMP | `User.updated_at?: Date` | Última actualización |
| `last_login` | TIMESTAMP | `User.last_login?: Date` | Último inicio de sesión |

**Ejemplo de consulta:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM users WHERE role = 'admin';
```

---

### 6. **cart** - Carrito de compras

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `CartItem.id: number` | ID único del item |
| `user_id` | INTEGER FK | `CartItem.user_id?: number` | Usuario autenticado |
| `session_id` | VARCHAR(255) | `CartItem.session_id?: string` | Sesión (no autenticados) |
| `product_id` | INTEGER FK | `CartItem.product_id: number` | Referencia al producto |
| `quantity` | INTEGER | `CartItem.quantity: number` | Cantidad en carrito |
| `size` | VARCHAR(10) | `CartItem.size?: string` | Talla seleccionada |
| `color` | VARCHAR(50) | `CartItem.color?: string` | Color seleccionado |
| `created_at` | TIMESTAMP | `CartItem.created_at?: Date` | Fecha de agregado |
| `updated_at` | TIMESTAMP | `CartItem.updated_at?: Date` | Última actualización |

**Ejemplo de consulta:**
```sql
SELECT c.*, p.* FROM cart c 
  JOIN products p ON c.product_id = p.id 
  WHERE c.user_id = 123;
SELECT * FROM cart WHERE session_id = 'abc123';
```

---

### 7. **notifications** - Notificaciones del sistema

| Campo SQL | Tipo SQL | Interface TypeScript | Descripción |
|-----------|----------|---------------------|-------------|
| `id` | SERIAL PRIMARY KEY | `Notification.id: number` | ID único de notificación |
| `type` | VARCHAR(50) | `Notification.type: string` | 'order', 'stock', 'system' |
| `title` | VARCHAR(255) | `Notification.title: string` | Título de la notificación |
| `message` | TEXT | `Notification.message: string` | Mensaje completo |
| `priority` | VARCHAR(20) | `Notification.priority: string` | 'low', 'medium', 'high' |
| `is_read` | BOOLEAN | `Notification.is_read: boolean` | Leída o no |
| `related_order_id` | INTEGER FK | `Notification.related_order_id?: number` | Pedido relacionado |
| `related_product_id` | INTEGER FK | `Notification.related_product_id?: number` | Producto relacionado |
| `created_at` | TIMESTAMP | `Notification.created_at?: Date` | Fecha de creación |

**Ejemplo de consulta:**
```sql
SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC;
SELECT * FROM notifications WHERE type = 'order' AND priority = 'high';
```

---

## 🔗 Relaciones entre Tablas

```
users (1) ----< (N) cart
users (1) ----< (N) orders

products (1) ----< (N) cart
products (1) ----< (N) order_items

orders (1) ----< (N) order_items
orders (1) ----< (N) notifications

products (1) ----< (N) notifications

categories (1) ----< (N) products (via category field)
```

---

## 📊 Consultas Comunes

### Dashboard - Métricas de Ventas
```sql
-- Total de ventas del día
SELECT SUM(total) as total_sales 
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE;

-- Pedidos pendientes
SELECT COUNT(*) as pending_orders 
FROM orders 
WHERE status = 'pending';

-- Productos con bajo stock
SELECT * FROM products 
WHERE stock < 10 AND stock > 0;

-- Productos agotados
SELECT * FROM products 
WHERE stock = 0;
```

### Home - Productos Destacados
```sql
-- Obtener productos destacados
SELECT * FROM products 
WHERE featured = true 
AND status = 'active' 
ORDER BY created_at DESC 
LIMIT 6;
```

### Carrito - Items del usuario
```sql
-- Carrito de usuario autenticado
SELECT c.*, p.name, p.price, p.image 
FROM cart c 
JOIN products p ON c.product_id = p.id 
WHERE c.user_id = ?;

-- Carrito de sesión anónima
SELECT c.*, p.name, p.price, p.image 
FROM cart c 
JOIN products p ON c.product_id = p.id 
WHERE c.session_id = ?;
```

### Pedidos - Detalles completos
```sql
-- Pedido con todos sus items
SELECT 
  o.*,
  json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = ?
GROUP BY o.id;
```

---

## 🚀 Próximos Pasos para Conexión

1. **Crear cuenta en Supabase** (o tu proveedor de DB)
2. **Ejecutar el archivo `/database/schema.sql`** en tu base de datos
3. **Obtener las credenciales** de conexión (URL, API Key)
4. **Configurar variables de entorno** con tus credenciales
5. **Implementar las funciones** en `/utils/database.ts` usando las interfaces ya definidas
6. **Probar las consultas** con datos de ejemplo

---

## 📝 Notas Importantes

- ✅ Todos los campos están mapeados con `snake_case` en SQL y `snake_case` en TypeScript (para coincidir exactamente)
- ✅ Los tipos están correctamente mapeados (DECIMAL → number, JSONB → object/array, etc.)
- ✅ Las relaciones FK están documentadas
- ✅ Los índices están creados para mejor performance
- ✅ Los triggers para `updated_at` están configurados
- ⚠️ Recuerda nunca exponer las contraseñas - siempre usa `password_hash`
- ⚠️ Valida los datos antes de insertar en la base de datos
