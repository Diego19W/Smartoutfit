import { useRef } from "react";
import { X, Download, Printer, Package } from "lucide-react";
import html2pdf from 'html2pdf.js';

interface OrderItem {
    id: string;
    productName: string;
    size: string;
    quantity: number;
    pricePerUnit: number;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    shipping?: number;
    status: string;
    paymentMethod?: string;
    items: OrderItem[];
}

interface ReceiptModalProps {
    order: Order;
    onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = () => {
        if (!receiptRef.current) return;

        const opt = {
            margin: 10,
            filename: `ticket-${order.orderNumber}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(receiptRef.current).save();
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'entregado':
                return 'bg-green-50 text-green-700';
            case 'enviado':
                return 'bg-blue-50 text-blue-700';
            case 'pendiente':
                return 'bg-yellow-50 text-yellow-700';
            case 'cancelado':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'entregado':
                return 'bg-green-500';
            case 'enviado':
                return 'bg-blue-500';
            case 'pendiente':
                return 'bg-yellow-500';
            case 'cancelado':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors no-print z-10"
                    aria-label="Cerrar"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Receipt Content */}
                <div ref={receiptRef} className="print-content">
                    {/* Header */}
                    <div className="bg-black text-white p-8 text-center">
                        <h3 className="text-3xl tracking-[0.3em] mb-2">SMARTOUTFIT</h3>
                        <p className="text-sm tracking-wider opacity-70">TICKET DE COMPRA</p>
                    </div>

                    {/* Order Info */}
                    <div className="p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-black/10">
                            <div>
                                <p className="text-xs tracking-wider opacity-60 mb-1">NÚMERO DE PEDIDO</p>
                                <p className="tracking-wider">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs tracking-wider opacity-60 mb-1">FECHA</p>
                                <p className="tracking-wider">{(() => {
                                    // Manual date formatting to avoid timezone issues
                                    const [datePart, timePart] = order.date.split(' ');
                                    const [year, month, day] = datePart.split('-');
                                    const [hour, minute] = timePart.split(':');

                                    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

                                    const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
                                    const ampm = parseInt(hour) >= 12 ? 'p.m.' : 'a.m.';

                                    return `${day} de ${monthNames[parseInt(month) - 1]} de ${year}, ${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`;
                                })()}</p>
                            </div>
                            <div>
                                <p className="text-xs tracking-wider opacity-60 mb-1">ESTADO</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${getStatusColor(order.status)}`}>
                                    <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)}`}></div>
                                    <span className="text-sm tracking-wider uppercase">{order.status}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-wider opacity-60 mb-1">MÉTODO DE PAGO</p>
                                <p className="tracking-wider">{order.paymentMethod || 'Tarjeta'}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="pb-6 border-b border-black/10">
                            <h4 className="tracking-wider mb-4">INFORMACIÓN DEL CLIENTE</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="opacity-60 mb-1">Cliente</p>
                                    <p>Usuario Invitado</p>
                                </div>
                                <div>
                                    <p className="opacity-60 mb-1">Email</p>
                                    <p>cliente@ejemplo.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="pb-6 border-b border-black/10">
                            <h4 className="tracking-wider mb-4">ARTÍCULOS</h4>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start">
                                        <div>
                                            <p className="tracking-wider mb-1">{item.productName}</p>
                                            <p className="text-sm opacity-60">Talla: {item.size} | Cantidad: {item.quantity}</p>
                                        </div>
                                        <p className="tracking-wider">${(item.pricePerUnit * item.quantity).toLocaleString('es-MX')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70">Subtotal</span>
                                <span>${order.total.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-70">Envío</span>
                                <span>${(order.shipping ?? 0).toLocaleString('es-MX')}</span>
                            </div>
                            <div className="pt-4 border-t border-black/10">
                                <div className="flex justify-between items-center">
                                    <span className="tracking-widest text-lg">TOTAL PAGADO</span>
                                    <span className="text-3xl tracking-wider">${(order.total + (order.shipping ?? 0)).toLocaleString('es-MX')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Estimate */}
                        {order.status !== 'cancelado' && order.status !== 'entregado' && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                                <div className="flex items-start gap-3">
                                    <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="tracking-wider mb-1">Entrega Estimada</p>
                                        <p className="text-sm opacity-70">
                                            Tu pedido llegará en 3-5 días hábiles.
                                        </p>
                                        <p className="text-xs opacity-60 mt-2">
                                            Recibirás un email con el número de seguimiento
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-neutral-50 p-8 border-t border-black/10">
                        <p className="text-center text-sm opacity-60 mb-4">
                            ¿Necesitas ayuda? Contáctanos en ayuda@modaix.com
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 border border-black/20 hover:bg-black hover:text-white transition-colors no-print"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="text-sm tracking-wider">IMPRIMIR</span>
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-6 py-3 border border-black/20 hover:bg-black hover:text-white transition-colors no-print"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm tracking-wider">DESCARGAR PDF</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-black/80 transition-colors no-print"
                            >
                                <span className="text-sm tracking-wider">CERRAR</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
