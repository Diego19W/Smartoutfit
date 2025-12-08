import { useState, useEffect } from "react";
import { Eye, Download, Package, Search, Calendar, Filter, Clock, Check, AlertTriangle, XCircle, Truck } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { OrderDetailModal } from "./OrderDetailModal";
import { CustomSelect } from "../CustomSelect";
import { getOrders, updateOrderStatus, Order } from "../../utils/database";

type OrderStatus = 'all' | 'entregado' | 'pendiente' | 'cancelado' | 'enviado';
type TimeRange = 'all' | '24h' | '3d' | '7d';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersFromDB = await getOrders(true); // true = admin mode, get ALL orders
      setOrders(ordersFromDB);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if order is within time range
  const isWithinTimeRange = (orderDate: string, range: TimeRange): boolean => {
    if (range === 'all') return true;

    const orderTime = new Date(orderDate).getTime();
    const now = new Date().getTime();
    const hourInMs = 60 * 60 * 1000;
    const dayInMs = 24 * hourInMs;

    switch (range) {
      case '24h':
        return (now - orderTime) <= dayInMs;
      case '3d':
        return (now - orderTime) <= (3 * dayInMs);
      case '7d':
        return (now - orderTime) <= (7 * dayInMs);
      default:
        return true;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeStatus === 'all' || order.status === activeStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || order.date.includes(dateFilter);
    const matchesTimeRange = isWithinTimeRange(order.date, timeRange);

    return matchesStatus && matchesSearch && matchesDate && matchesTimeRange;
  });

  const statusConfig = {
    entregado: { label: 'Entregado', color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
    pendiente: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' },
    enviado: { label: 'Enviado', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
    cancelado: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-500' },
  };

  const statusCounts = {
    all: orders.length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    enviado: orders.filter(o => o.status === 'enviado').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length,
  };

  const handleStatusChange = async (orderId: string, newStatus: 'entregado' | 'pendiente' | 'cancelado' | 'enviado') => {
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

      {/* Summary - Moved to top */}
      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-black/10 shadow-sm">
          <p className="text-sm opacity-60 mb-2">
            {timeRange === 'all' ? 'Total de Pedidos' :
              timeRange === '24h' ? 'Pedidos hace 24 horas' :
                timeRange === '3d' ? 'Pedidos hace 3 días' :
                  'Pedidos hace 7 días'}
          </p>
          <h4 className="text-2xl tracking-wider">{filteredOrders.length}</h4>
        </div>
        <div className="bg-white p-6 border border-black/10 shadow-sm">
          <p className="text-sm opacity-60 mb-2">
            {timeRange === 'all' ? 'Ingresos Totales' :
              timeRange === '24h' ? 'Ingresos hace 24 horas' :
                timeRange === '3d' ? 'Ingresos hace 3 días' :
                  'Ingresos hace 7 días'}
          </p>
          <h4 className="text-2xl tracking-wider">
            ${filteredOrders.filter(o => o.status !== 'cancelado').reduce((sum, order) => sum + order.total, 0).toLocaleString('es-MX')}
          </h4>
        </div>
        <div className="bg-white p-6 border border-black/10 shadow-sm">
          <p className="text-sm opacity-60 mb-2">
            {timeRange === 'all' ? 'Artículos Vendidos' :
              timeRange === '24h' ? 'Artículos hace 24 horas' :
                timeRange === '3d' ? 'Artículos hace 3 días' :
                  'Artículos hace 7 días'}
          </p>
          <h4 className="text-2xl tracking-wider">
            {filteredOrders.filter(o => o.status !== 'cancelado').reduce((sum, order) => sum + order.quantity, 0)}
          </h4>
        </div>
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

        {/* Time Range Filter */}
        <div className="mt-4 pt-4 border-t border-black/10">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 opacity-60" />
            <span className="text-sm opacity-60 tracking-wider">RANGO DE TIEMPO:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white border border-black/20 hover:bg-neutral-50'
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === '24h'
                  ? 'bg-black text-white'
                  : 'bg-white border border-black/20 hover:bg-neutral-50'
                  }`}
              >
                Últimas 24h
              </button>
              <button
                onClick={() => setTimeRange('3d')}
                className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === '3d'
                  ? 'bg-black text-white'
                  : 'bg-white border border-black/20 hover:bg-neutral-50'
                  }`}
              >
                Últimos 3 días
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 text-sm tracking-wider transition-all ${timeRange === '7d'
                  ? 'bg-black text-white'
                  : 'bg-white border border-black/20 hover:bg-neutral-50'
                  }`}
              >
                Últimos 7 días
              </button>
            </div>
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

                  {/* Status Control Buttons */}
                  <div className="flex items-center justify-end gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'entregado');
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'entregado' ? 'rgb(34, 197, 94)' : '#dcfce7',
                        color: order.status === 'entregado' ? '#ffffff' : 'rgb(34, 197, 94)',
                        transform: order.status === 'entregado' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Marcar como entregado"
                    >
                      <Check className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'pendiente');
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'pendiente' ? 'rgb(234, 179, 8)' : '#fef9c3',
                        color: order.status === 'pendiente' ? '#ffffff' : 'rgb(234, 179, 8)',
                        transform: order.status === 'pendiente' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Marcar como pendiente"
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'enviado');
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'enviado' ? 'rgb(59, 130, 246)' : '#dbeafe',
                        color: order.status === 'enviado' ? '#ffffff' : 'rgb(59, 130, 246)',
                        transform: order.status === 'enviado' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Marcar como enviado"
                    >
                      <Truck className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'cancelado');
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: order.status === 'cancelado' ? 'rgb(239, 68, 68)' : '#fee2e2',
                        color: order.status === 'cancelado' ? '#ffffff' : 'rgb(239, 68, 68)',
                        transform: order.status === 'cancelado' ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title="Marcar como cancelado"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
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
