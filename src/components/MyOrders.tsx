import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, Filter as FilterIcon, FileText } from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";

interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    size: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
}

interface MyOrdersProps {
    onNavigate: (page: string) => void;
}

type TimeRange = 'all' | '24h' | '3d' | '7d';
type OrderStatus = 'all' | 'pendiente' | 'enviado' | 'entregado' | 'cancelado';

export function MyOrders({ onNavigate }: MyOrdersProps) {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://localhost/E-commerce Fashion Store Mockup 2/api/orders.php?action=list&user_id=${user?.id}`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
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

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesTimeRange = isWithinTimeRange(order.date, timeRange);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesTimeRange && matchesStatus;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">Inicia sesión para ver tus pedidos</h2>
                    <button
                        onClick={() => onNavigate('login')}
                        className="bg-black text-white px-6 py-2"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBag className="w-8 h-8" />
                    <h1 className="text-3xl tracking-wider">MIS PEDIDOS</h1>
                </div>

                {/* Filters Section */}
                <div className="bg-white border border-black/5 p-6 mb-6 shadow-sm">
                    {/* Time Range Filter */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 opacity-60" />
                            <span className="text-sm opacity-60 tracking-wider">RANGO DE TIEMPO:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
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

                    {/* Status Filter */}
                    <div className="pt-6 border-t border-black/5">
                        <div className="flex items-center gap-3 mb-3">
                            <FilterIcon className="w-5 h-5 opacity-60" />
                            <span className="text-sm opacity-60 tracking-wider">ESTADO:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 text-sm tracking-wider transition-all ${statusFilter === 'all'
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-black/20 hover:bg-neutral-50'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setStatusFilter('pendiente')}
                                className={`px-4 py-2 text-sm tracking-wider transition-all ${statusFilter === 'pendiente'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-white border border-yellow-200 hover:bg-yellow-50'
                                    }`}
                            >
                                Pendiente
                            </button>
                            <button
                                onClick={() => setStatusFilter('enviado')}
                                className={`px-4 py-2 text-sm tracking-wider transition-all ${statusFilter === 'enviado'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-blue-200 hover:bg-blue-50'
                                    }`}
                            >
                                Enviado
                            </button>
                            <button
                                onClick={() => setStatusFilter('entregado')}
                                className={`px-4 py-2 text-sm tracking-wider transition-all ${statusFilter === 'entregado'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-green-200 hover:bg-green-50'
                                    }`}
                            >
                                Entregado
                            </button>
                            <button
                                onClick={() => setStatusFilter('cancelado')}
                                className={`px-4 py-2 text-sm tracking-wider transition-all ${statusFilter === 'cancelado'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white border border-red-200 hover:bg-red-50'
                                    }`}
                            >
                                Cancelado
                            </button>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 text-center border border-black/5">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl mb-2">No tienes pedidos aún</h3>
                        <p className="text-neutral-500 mb-6">¡Explora nuestra colección y realiza tu primera compra!</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="bg-black text-white px-8 py-3 tracking-wider hover:bg-black/80 transition-colors"
                        >
                            IR A LA TIENDA
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white border border-black/5 p-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">PEDIDO</p>
                                        <p className="font-medium">{order.orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">FECHA</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {(() => {
                                                // Manual date formatting to avoid timezone issues
                                                const [datePart, timePart] = order.date.split(' ');
                                                const [year, month, day] = datePart.split('-');
                                                const [hour, minute] = timePart.split(':');

                                                const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                                                    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

                                                const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
                                                const ampm = parseInt(hour) >= 12 ? 'p.m.' : 'a.m.';

                                                return `${day} ${monthNames[parseInt(month) - 1]} ${year}, ${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`;
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">TOTAL</p>
                                        <p className="font-medium">${order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">ESTADO</p>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status === 'entregado' ? <CheckCircle className="w-4 h-4" /> :
                                                order.status === 'pendiente' ? <Clock className="w-4 h-4" /> :
                                                    order.status === 'enviado' ? <Truck className="w-4 h-4" /> :
                                                        <XCircle className="w-4 h-4" />}
                                            <span className="capitalize">{order.status}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-20 h-24 bg-neutral-100 overflow-hidden">
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.productName}</h4>
                                                <p className="text-sm text-neutral-500">Talla: {item.size} | Cantidad: {item.quantity}</p>
                                                <p className="text-sm font-medium mt-1">${item.pricePerUnit.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View Ticket Button */}
                                <div className="mt-6 pt-4 border-t border-black/5">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white tracking-wider hover:bg-black/80 transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        VER TICKET
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {selectedOrder && (
                <ReceiptModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
