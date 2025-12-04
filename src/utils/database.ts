/**
 * Utilidades para conexión con Base de Datos
 */

const API_BASE_URL = 'http://localhost/E-commerce Fashion Store Mockup 2/api';

// Interface para Productos
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category: string;
  brand?: string;
  gender?: string;
  materials?: string; // Changed from material to match Inventory.tsx
  cut?: string;
  image: string;
  images?: string[];
  stock: number;
  sizeStock?: { // Changed from size_stock to match Inventory.tsx
    XS: number;
    S: number;
    M: number;
    L: number;
    XL: number;
  };
  colors?: string[];
  status?: 'active' | 'low' | 'out';
  featured?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Obtener todos los productos
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Crear un nuevo producto
 */
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating product');
    }

    const result = await response.json();
    return { ...product, id: result.id };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Actualizar un producto existente
 */
export async function updateProduct(
  id: number,
  updates: Partial<Product>
): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ...updates, id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating product');
    }

    return { id, ...updates } as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Eliminar un producto
 */
export async function deleteProduct(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Subir una imagen
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error uploading image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Placeholder functions for other features not yet implemented in API
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(p => p.category === category);
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const products = await getAllProducts();
  return products.slice(0, limit);
}

// Order Interfaces
export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  date: string;
  total: number;
  status: 'entregado' | 'pendiente' | 'cancelado' | 'enviado';
  paymentMethod: string;
  items: OrderItem[];
}

/**
 * Obtener todos los pedidos
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders.php`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Actualizar estado del pedido
 */
export async function updateOrderStatus(id: string, status: 'entregado' | 'pendiente' | 'cancelado' | 'enviado'): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
