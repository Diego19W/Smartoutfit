# Guía de Conexión a Base de Datos - MODAIX

Este documento describe cómo conectar la aplicación MODAIX a una base de datos.

## 📋 Opciones de Base de Datos

Puedes usar cualquiera de estas opciones:

1. **Supabase** (Recomendado) - PostgreSQL en la nube con API automática
2. **Firebase** - Base de datos NoSQL en tiempo real
3. **PostgreSQL** - Base de datos SQL tradicional
4. **MongoDB** - Base de datos NoSQL
5. **MySQL/MariaDB** - Base de datos SQL alternativa

## 🚀 Opción 1: Supabase (Recomendado)

### Paso 1: Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota tu `URL` y `anon key`

### Paso 2: Ejecutar el esquema
1. Ve a la sección "SQL Editor" en Supabase
2. Copia y pega el contenido de `/database/schema.sql`
3. Ejecuta el script

### Paso 3: Instalar dependencias
```bash
npm install @supabase/supabase-js
```

### Paso 4: Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Paso 5: Crear cliente de Supabase
Crea el archivo `/utils/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Paso 6: Actualizar funciones en `/utils/database.ts`
Descomenta las líneas de código de Supabase en cada función y reemplaza los `throw new Error('Not implemented')`.

Ejemplo:
```typescript
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
```

## 🔥 Opción 2: Firebase

### Paso 1: Crear proyecto
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Activa Firestore Database

### Paso 2: Instalar dependencias
```bash
npm install firebase
```

### Paso 3: Configurar Firebase
Crea `/utils/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "tu_api_key",
  authDomain: "tu_auth_domain",
  projectId: "tu_project_id",
  storageBucket: "tu_storage_bucket",
  messagingSenderId: "tu_sender_id",
  appId: "tu_app_id"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

### Paso 4: Actualizar funciones en `/utils/database.ts`
Usa Firestore en lugar de Supabase:
```typescript
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getAllProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, 'products'))
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
}
```

## 🐘 Opción 3: PostgreSQL Local

### Paso 1: Instalar PostgreSQL
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`
- Windows: Descarga de [postgresql.org](https://www.postgresql.org/download/)

### Paso 2: Crear base de datos
```bash
createdb modaix
psql modaix < database/schema.sql
```

### Paso 3: Instalar dependencias
```bash
npm install pg
```

### Paso 4: Configurar conexión
Crea `/utils/pg.ts`:
```typescript
import { Pool } from 'pg'

export const pool = new Pool({
  user: 'tu_usuario',
  host: 'localhost',
  database: 'modaix',
  password: 'tu_password',
  port: 5432,
})
```

## 📝 Estructura de Datos

### Product
```typescript
{
  id: number
  name: string
  price: number
  image: string
  category: string
  description?: string
  sizes?: string[]
  colors?: string[]
  stock?: number
  gender?: 'hombre' | 'mujer' | 'unisex'
  material?: string
  brand?: string
}
```

### Order
```typescript
{
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: Date
}
```

## 🔄 Integración con Componentes

Una vez configurada la base de datos, actualiza estos archivos:

### `/data/products.ts`
```typescript
import { getAllProducts, getProductsByCategory } from '../utils/database'

export const menProducts = await getProductsByCategory('Formal')
export const womenProducts = await getProductsByCategory('Vestidos')
```

### `/components/ProductGrid.tsx`
```typescript
import { useEffect, useState } from 'react'
import { getFeaturedProducts } from '../utils/database'

export function ProductGrid() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const data = await getFeaturedProducts(3)
      setProducts(data)
    }
    loadProducts()
  }, [])
  
  // resto del componente...
}
```

### `/components/admin/Inventory.tsx`
El componente de inventario ya está preparado para trabajar con una base de datos. Solo necesitas:
1. Importar las funciones CRUD de `/utils/database.ts`
2. Actualizar `handleSubmit` para usar `createProduct` o `updateProduct`
3. Cargar productos iniciales con `getAllProducts`

### `/components/admin/Orders.tsx`
El componente de pedidos está listo para conectar con la base de datos:
1. Descomentar el import: `import { getOrders, updateOrderStatus } from '../../utils/database'`
2. Descomentar el `useEffect` para cargar pedidos al montar el componente
3. La función `handleStatusChange` ya está preparada para actualizar estados en la BD

Ejemplo de uso:
```typescript
import { useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../utils/database';

export function Orders() {
  // ... estado existente ...
  
  // Cargar pedidos desde la base de datos
  useEffect(() => {
    async function loadOrders() {
      try {
        const ordersFromDB = await getOrders();
        // Transformar datos si es necesario para que coincidan con la interfaz del componente
        const transformedOrders = ordersFromDB.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          productName: order.items[0]?.productName || '',
          productImage: order.items[0]?.productImage || '',
          size: order.items[0]?.size || '',
          quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          date: new Date(order.createdAt).toLocaleDateString('es-MX'),
          total: order.total,
          status: mapStatus(order.status), // 'pending' -> 'pendiente'
          paymentMethod: order.paymentMethod,
          items: order.items
        }));
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      }
    }
    loadOrders();
  }, []);
  
  // Mapear estados de BD a estados del componente
  function mapStatus(dbStatus: string): 'entregado' | 'pendiente' | 'cancelado' {
    const statusMap = {
      'delivered': 'entregado',
      'pending': 'pendiente',
      'processing': 'pendiente',
      'shipped': 'pendiente',
      'cancelled': 'cancelado'
    };
    return statusMap[dbStatus] || 'pendiente';
  }
  
  // ... resto del componente ...
}
```

## 🛠️ Funciones Disponibles

Todas estas funciones están documentadas en `/utils/database.ts`:

### Productos
- `getAllProducts()` - Obtener todos los productos
- `getProductsByCategory(category)` - Filtrar por categoría
- `getProductById(id)` - Obtener un producto específico
- `createProduct(product)` - Crear nuevo producto
- `updateProduct(id, updates)` - Actualizar producto
- `deleteProduct(id)` - Eliminar producto
- `searchProducts(term)` - Buscar productos
- `getFeaturedProducts(limit)` - Productos destacados
- `updateProductStock(id, sizeStock)` - Actualizar inventario

### Pedidos
- `getOrders()` - Obtener todos los pedidos
- `getOrderById(id)` - Obtener un pedido específico
- `createOrder(order)` - Crear nuevo pedido
- `updateOrderStatus(id, status)` - Actualizar estado del pedido
- `getOrdersByStatus(status)` - Filtrar pedidos por estado

### Devoluciones
Para manejar devoluciones, necesitas crear una tabla adicional en tu base de datos:

```sql
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    order_number VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    return_address TEXT NOT NULL,
    return_city VARCHAR(100),
    return_postal_code VARCHAR(20),
    return_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
    tracking_number VARCHAR(100),
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

El componente `/components/Returns.tsx` ya está preparado con:
- Validación de pedido por número de orden y correo
- Formulario completo de devolución
- Estados de flujo (validación → formulario → éxito)
- Instrucciones para el usuario

## 🔒 Seguridad

### Para producción:
1. Nunca expongas tus credenciales en el código
2. Usa variables de entorno
3. Implementa autenticación
4. Valida datos en el backend
5. Usa Row Level Security (RLS) en Supabase
6. Implementa rate limiting

### Ejemplo de RLS en Supabase:
```sql
-- Permitir lectura pública de productos
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Solo admins pueden modificar
CREATE POLICY "Allow admin full access" ON products
  FOR ALL USING (auth.role() = 'admin');
```

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Firebase](https://firebase.google.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [TypeScript Database Patterns](https://www.typescriptlang.org/docs/)

## ❓ Preguntas Frecuentes

**P: ¿Cuál base de datos debería usar?**  
R: Para prototipado rápido, Supabase es la mejor opción. Para aplicaciones empresariales, PostgreSQL.

**P: ¿Cómo manejo las imágenes de productos?**  
R: Usa Supabase Storage, Firebase Storage, o servicios como Cloudinary/AWS S3.

**P: ¿Necesito un backend separado?**  
R: No con Supabase o Firebase. Sí con PostgreSQL/MySQL tradicional.

**P: ¿Cómo manejo autenticación?**  
R: Supabase y Firebase incluyen autenticación. Para otras opciones, considera NextAuth.js.

## 🔐 Autenticación

MODAIX incluye componentes de Login y Registro listos para usar con Supabase Auth.

### Configuración de Supabase Auth

1. **Habilitar proveedores en Supabase Dashboard:**
   - Ve a Authentication > Providers
   - Habilita Email/Password
   - Habilita Google OAuth (necesitas Client ID y Secret de Google Cloud Console)
   - Habilita Facebook OAuth (necesitas App ID y Secret de Facebook Developers)
   - Habilita Azure OAuth (necesitas Client ID y Secret de Azure AD)

2. **Configurar URLs de redirección:**
   - Site URL: `https://tudominio.com`
   - Redirect URLs: `https://tudominio.com/auth/callback`

3. **Actualizar funciones en `/utils/auth.ts`:**

```typescript
import { supabase } from './supabase';

export async function login(credentials: LoginCredentials): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })
  
  if (error) throw error
  
  return {
    id: data.user.id,
    email: data.user.email!,
    // ... más datos
  }
}
```

4. **Conectar componentes:**
   - Los componentes `/components/Login.tsx` y `/components/Register.tsx` ya están listos
   - Solo necesitas descomentar el código de Supabase en los handlers
   - Los botones OAuth están implementados y listos para usar

### Funciones disponibles en `/utils/auth.ts`:

- `login(credentials)` - Iniciar sesión con email/contraseña
- `register(data)` - Registrar nuevo usuario
- `loginWithOAuth(provider)` - Login con Google/Facebook/Azure
- `logout()` - Cerrar sesión
- `getCurrentUser()` - Obtener usuario actual
- `resetPassword(email)` - Enviar email de recuperación
- `updatePassword(newPassword)` - Actualizar contraseña
- `isAuthenticated()` - Verificar si hay sesión activa
