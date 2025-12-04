import { X, Check, AlertTriangle, XCircle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

interface OrderDetailModalProps {
  orderNumber: string;
  items: OrderItem[];
  orderDate: string;
  paymentMethod: string;
  status: 'entregado' | 'pendiente' | 'cancelado';
  onClose: () => void;
  onStatusChange: (newStatus: 'entregado' | 'pendiente' | 'cancelado') => void;
}

export function OrderDetailModal({
  orderNumber,
  items,
  orderDate,
  paymentMethod,
  status,
  onClose,
  onStatusChange
}: OrderDetailModalProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const statusConfig = {
    entregado: { label: 'Entregado', color: 'text-green-600' },
    pendiente: { label: 'Pendiente', color: 'text-yellow-600' },
    cancelado: { label: 'Cancelado', color: 'text-red-600' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-black/10 flex items-center justify-between">
          <h3 className="text-2xl tracking-wider">Pedido N° {orderNumber}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-black/10">
                  <div className="w-24 h-24 bg-neutral-100 rounded flex-shrink-0">
                    <ImageWithFallback
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1">{item.productName}</h4>
                    <p className="text-sm opacity-60">({item.size}) x {item.quantity}</p>
                    <p className="text-sm opacity-60 mt-1">P/u: ${item.pricePerUnit}MX</p>
                    <p className="mt-2">Total: <span className="font-medium">${item.total}MX</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Order Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm opacity-60 mb-1">Fecha de pedido:</p>
                <p className="text-lg">{orderDate}</p>
              </div>

              <div>
                <p className="text-sm opacity-60 mb-1">Método de pago:</p>
                <p className="text-lg">{paymentMethod}</p>
              </div>

              <div>
                <p className="text-sm opacity-60 mb-2">Status:</p>
                <p className={`text-2xl ${statusConfig[status].color}`}>
                  {statusConfig[status].label}
                </p>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => onStatusChange('entregado')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      status === 'entregado' 
                        ? 'bg-green-500 text-white shadow-lg scale-110' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title="Marcar como entregado"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => onStatusChange('pendiente')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      status === 'pendiente' 
                        ? 'bg-yellow-500 text-white shadow-lg scale-110' 
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                    title="Marcar como pendiente"
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => onStatusChange('cancelado')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      status === 'cancelado' 
                        ? 'bg-red-500 text-white shadow-lg scale-110' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title="Marcar como cancelado"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-xl">Total:</span>
                  <span className="text-3xl">${totalAmount.toLocaleString('es-MX')}MX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
