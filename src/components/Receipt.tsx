import { useState, useEffect, useRef } from "react";
import { CheckCircle, Download, Home, Package, Printer } from "lucide-react";
import { getOrders, Order } from "../utils/database";
import html2pdf from 'html2pdf.js';

interface ReceiptProps {
  onNavigate: (page: string) => void;
}

export function Receipt({ onNavigate }: ReceiptProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLatestOrder();
  }, []);

  const loadLatestOrder = async () => {
    try {
      const orders = await getOrders();
      if (orders.length > 0) {
        setOrder(orders[0]);
      }
    } catch (error) {
      console.error("Failed to load order", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!receiptRef.current || !order) return;

    const opt = {
      margin: 10,
      filename: `ticket-${order.orderNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(receiptRef.current).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="tracking-wider opacity-60">GENERANDO RECIBO...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="tracking-wider opacity-60 mb-4">No se encontró el pedido.</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-black text-white px-8 py-3 tracking-wider hover:bg-black/80 transition-colors"
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="tracking-[0.2em] mb-2">¡COMPRA EXITOSA!</h2>
          <p className="opacity-60">
            Gracias por tu compra. Hemos enviado la confirmación a tu correo.
          </p>
        </div>

        {/* Receipt Card */}
        <div ref={receiptRef} className="border-2 border-black/10 bg-white print-content">
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
                  // order.date format: "2025-12-05 14:09:45"
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
                <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm tracking-wider text-green-700 uppercase">{order.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs tracking-wider opacity-60 mb-1">MÉTODO DE PAGO</p>
                <p className="tracking-wider">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Customer Info - Placeholder as we don't store customer info in 'compras' table yet, 
                or we need to fetch it from a related table. For now, hardcoded or generic. */}
            <div className="pb-6 border-b border-black/10">
              <h4 className="tracking-wider mb-4">INFORMACIÓN DEL CLIENTE</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-60 mb-1">Cliente</p>
                  <p>Usuario Invitado</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Email</p>
                  <p>###################</p>
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
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 p-8 border-t border-black/10">
            <p className="text-center text-sm opacity-60 mb-4">
              ¿Necesitas ayuda? Contáctanos en ayuda@modaix.com
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 border border-black/20 hover:bg-black hover:text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm tracking-wider">IMPRIMIR</span>
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-black/80 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm tracking-wider">VOLVER AL INICIO</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 border border-black/20 hover:bg-black hover:text-white transition-colors no-print"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm tracking-wider">DESCARGAR PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 border border-black/10">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📧</span>
            </div>
            <h4 className="tracking-wider mb-2 text-sm">CONFIRMACIÓN</h4>
            <p className="text-xs opacity-60">
              Revisa tu correo para más detalles
            </p>
          </div>
          <div className="p-6 border border-black/10">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📦</span>
            </div>
            <h4 className="tracking-wider mb-2 text-sm">PREPARACIÓN</h4>
            <p className="text-xs opacity-60">
              Empacamos tu pedido con cuidado
            </p>
          </div>
          <div className="p-6 border border-black/10">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🚚</span>
            </div>
            <h4 className="tracking-wider mb-2 text-sm">ENTREGA</h4>
            <p className="text-xs opacity-60">
              Llega a tu puerta en 3-5 días
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
