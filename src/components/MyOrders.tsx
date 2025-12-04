import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";

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

export function MyOrders({ onNavigate }: MyOrdersProps) {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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
                        {orders.map((order) => (
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
                                            {new Date(order.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">TOTAL</p>
                                        <p className="font-medium">${order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 mb-1">ESTADO</p>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${order.status === 'completado' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status === 'completado' ? <CheckCircle className="w-4 h-4" /> :
                                                order.status === 'pendiente' ? <Clock className="w-4 h-4" /> :
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
