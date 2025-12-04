import { useState, useEffect } from "react";
import { Eye, Download, Package, Search, Calendar, Filter } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { OrderDetailModal } from "./OrderDetailModal";
import { CustomSelect } from "../CustomSelect";
import { getOrders, updateOrderStatus, Order } from "../../utils/database";

type OrderStatus = 'all' | 'entregado' | 'pendiente' | 'cancelado';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersFromDB = await getOrders();
      setOrders(ordersFromDB);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeStatus === 'all' || order.status === activeStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || order.date.includes(dateFilter);

    return matchesStatus && matchesSearch && matchesDate;
  });

  const statusConfig = {
    entregado: { label: 'Entregado', color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
    pendiente: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' },
    cancelado: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-500' },
  };

  const statusCounts = {
    all: orders.length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length,
  };

  const handleStatusChange = async (orderId: string, newStatus: 'entregado' | 'pendiente' | 'cancelado') => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando pedidos...</div>;
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h3 className="text-3xl tracking-wider mb-1">Pedidos</h3>
        <p className="text-sm opacity-60">Lista de pedidos</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/10 p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por pedido o producto..."
              className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filtrar por fecha (yyyy-mm-dd)"
              className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40 z-10 pointer-events-none" />
            <CustomSelect
              value={activeStatus}
              onChange={(value) => setActiveStatus(value as OrderStatus)}
              options={[
                { value: "all", label: `Todos los estados (${statusCounts.all})` },
                { value: "entregado", label: `Entregados (${statusCounts.entregado})` },
                { value: "pendiente", label: `Pendientes (${statusCounts.pendiente})` },
                { value: "cancelado", label: `Cancelados (${statusCounts.cancelado})` },
              ]}
              placeholder="Estado"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.pendiente;
          return (
            <div
              key={order.id}
              onClick={() => handleOrderClick(order)}
              className={`bg-white border-l-4 ${config.borderColor} border border-black/10 p-6 transition-all hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-start gap-6">
                {/* Product Image with Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 bg-neutral-100 rounded">
                    <ImageWithFallback
                      src={order.productImage}
                      alt={order.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm">{order.quantity}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h4 className="mb-1">{order.productName}</h4>
                  <p className="text-sm opacity-60 mb-1">{order.size}</p>
                  <p className="text-sm opacity-60">x{order.quantity}</p>
                  <div className="mt-3">
                    <p className="text-sm opacity-60">Total:</p>
                    <p className="text-xl">${order.total}MX</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm opacity-60">Número de orden:</p>
                      <p>{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-60">Fecha de pedido:</p>
                      <p>{order.date}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-1 text-right">
                  <div className="mb-3">
                    <p className="text-sm opacity-60 mb-1">Status:</p>
                    <p className={`text-xl ${config.color}`}>{config.label}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="p-12 text-center opacity-40 bg-white border border-black/10">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <p className="tracking-wider">No hay pedidos que coincidan con los filtros</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Total de Pedidos</p>
          <h4 className="text-2xl tracking-wider">{filteredOrders.length}</h4>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Ingresos Totales</p>
          <h4 className="text-2xl tracking-wider">
            ${filteredOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString('es-MX')}
          </h4>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Artículos Vendidos</p>
          <h4 className="text-2xl tracking-wider">
            {filteredOrders.reduce((sum, order) => sum + order.quantity, 0)}
          </h4>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          orderNumber={selectedOrder.orderNumber}
          items={selectedOrder.items}
          orderDate={selectedOrder.date}
          paymentMethod={selectedOrder.paymentMethod}
          status={selectedOrder.status}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
        />
      )}
    </div>
  );
}
