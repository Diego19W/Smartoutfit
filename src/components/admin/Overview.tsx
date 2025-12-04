
import { useState, useEffect } from "react";
import { DollarSign, Package, AlertTriangle, Briefcase, Check, XCircle, ChevronUp, ChevronDown, Truck, Clock } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { getOrders, getAllProducts, updateOrderStatus, updateProduct, Order, Product } from "../../utils/database";

interface QuickOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'entregado' | 'pendiente' | 'cancelado';
}

export function Overview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getAllProducts()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load overview data", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSold = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.quantity, 0);

  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

  const handleOrderStatusChange = async (orderId: string, newStatus: 'entregado' | 'pendiente' | 'cancelado' | 'enviado') => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const updateStock = async (productId: number, size: string, increment: boolean) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return;

    const currentSizeStock = productToUpdate.sizeStock || { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
    // @ts-ignore
    const currentQty = currentSizeStock[size] || 0;
    const newQty = Math.max(0, currentQty + (increment ? 1 : -1));

    if (currentQty === newQty) return;

    const newSizeStock = {
      ...currentSizeStock,
      [size]: newQty
    };

    // @ts-ignore
    const totalStock = Object.values(newSizeStock).reduce((sum: number, val: number) => sum + val, 0);

    const updatedProduct = {
      ...productToUpdate,
      sizeStock: newSizeStock,
      stock: totalStock,
      status: (totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'active') as 'active' | 'low' | 'out'
    };

    // Optimistic update
    setProducts(products.map(product =>
      product.id === productId ? updatedProduct : product
    ));

    try {
      // We must send the FULL product data because the API expects all fields
      await updateProduct(productId, updatedProduct);
    } catch (error) {
      console.error("Failed to update stock", error);
      // Rollback
      setProducts(products.map(product =>
        product.id === productId ? productToUpdate : product
      ));
      alert("Error al actualizar el stock. Por favor verifica tu conexión.");
    }
  };

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return <div className="p-8 text-center">Cargando resumen...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h3 className="tracking-wider text-2xl mb-1">
          {timeRange === 'all' ? 'RESUMEN' :
            timeRange === 'month' ? 'RESUMEN DEL MES' :
              'RESUMEN DE LA SEMANA'}
        </h3>
        <p className="text-sm opacity-60">Vista general del inventario</p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white border border-black/10 p-4 mb-6 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 opacity-60" />
          <span className="text-sm opacity-60 tracking-wider mr-4">PERÍODO:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === 'all'
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 hover:bg-neutral-50'
                }`}
            >
              Todo
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === 'month'
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 hover:bg-neutral-50'
                }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === 'week'
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 hover:bg-neutral-50'
                }`}
            >
              Esta Semana
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-black/10 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="tracking-wider opacity-70">Ingresos</h4>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl mb-1">${totalRevenue.toLocaleString('es-MX')}</p>
        </div>

        <div className="bg-white border border-black/10 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="tracking-wider opacity-70">Artículos Vendidos</h4>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl mb-1">{totalSold}</p>
        </div>

        <div className="bg-white border border-black/10 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="tracking-wider opacity-70">Artículos Bajos en Stock</h4>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl mb-1">{lowStockCount}</p>
        </div>
      </div>

      {/* Quick Order Manager */}
      <div className="bg-white border border-black/10 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-6 h-6" />
          <h4 className="tracking-wider text-xl">Pedidos Recientes</h4>
        </div>
        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-center opacity-60 py-4">No hay pedidos recientes</p>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded">
                <div className="flex items-center gap-4">
                  <span className="tracking-wider">Pedido {order.orderNumber}</span>
                  {/* Assuming customer name is not yet in API, using placeholder or product name for context */}
                  <span className="opacity-60 text-sm hidden sm:inline">{order.productName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="tracking-wider">${order.total} MX</span>
                  <span className={`px - 3 py - 1 text - xs rounded ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                      order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                    } `}>
                    <span className="capitalize">{order.status}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'entregado')}
                      className={`w - 10 h - 10 rounded - full flex items - center justify - center transition - all ${order.status === 'entregado'
                        ? 'bg-green-500 text-white shadow-lg scale-110'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                        } `}
                      title="Entregado"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'pendiente')}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'pendiente' ? 'rgb(234, 179, 8)' : '#fef9c3',
                        color: order.status === 'pendiente' ? '#ffffff' : 'rgb(234, 179, 8)',
                        transform: order.status === 'pendiente' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Pendiente"
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'enviado')}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'enviado' ? '#2563eb' : '#dbeafe',
                        color: order.status === 'enviado' ? '#ffffff' : '#2563eb',
                        transform: order.status === 'enviado' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Enviado"
                    >
                      <Truck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'cancelado')}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'cancelado' ? 'rgb(239, 68, 68)' : '#fee2e2',
                        color: order.status === 'cancelado' ? '#ffffff' : 'rgb(239, 68, 68)',
                        transform: order.status === 'cancelado' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Cancelado"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white border border-black/10 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h4 className="tracking-wider text-xl">Alerta de stock Bajo</h4>
        </div>
        <div className="space-y-3">
          {products.filter(p => (p.stock || 0) < 10).length === 0 ? (
            <p className="text-center opacity-60 py-4">No hay productos con stock bajo</p>
          ) : (
            products.filter(p => (p.stock || 0) < 10).slice(0, 5).map(product => {
              const sizes = ['XS', 'S', 'M', 'L', 'XL'];
              const sizeStock = product.sizeStock || { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
              // @ts-ignore
              const stockInfo = sizes
                // @ts-ignore
                .filter(size => sizeStock[size] > 0)
                // @ts-ignore
                .map(size => `${size}: ${sizeStock[size]} `)
                .join(', ') || 'Sin stock';

              return (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded">
                  <div className="w-16 h-16 bg-neutral-200 rounded flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-1">{product.name}</h5>
                    <p className="text-sm opacity-60">{stockInfo}</p>
                  </div>
                  <div className="text-sm opacity-60">Stock: {product.stock}</div>
                  <div className="flex items-center gap-2">
                    {sizes.map(size => (
                      <div key={size} className="flex flex-col items-center">
                        <span className="text-xs opacity-60 mb-1">{size}</span>
                        <button
                          onClick={() => updateStock(product.id, size, true)}
                          className="w-6 h-5 flex items-center justify-center hover:bg-neutral-200 transition-colors rounded-t border border-black/10"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="w-8 h-6 flex items-center justify-center border-x border-black/10 text-xs">
                          {/* @ts-ignore */}
                          {sizeStock[size] || 0}
                        </div>
                        <button
                          onClick={() => updateStock(product.id, size, false)}
                          className="w-6 h-5 flex items-center justify-center hover:bg-neutral-200 transition-colors rounded-b border border-black/10"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
