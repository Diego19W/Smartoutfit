import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Trash2, Plus, Minus, Tag, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartProps {
  onNavigate: (page: string) => void;
}

export function Cart({ onNavigate }: CartProps) {
  const { cartItems, removeFromCart, updateQuantity, total } = useCart();

  const shipping = total > 2000 ? 0 : 200;
  const discount = 0; // Placeholder for now
  const finalTotal = total + shipping - discount;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8" />
            <h2 className="tracking-[0.2em]">CARRITO DE COMPRAS</h2>
          </div>
          <p className="text-center opacity-60">
            {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'} en tu carrito
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="mb-6 opacity-60">Tu carrito está vacío.</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-black text-white px-8 py-3 tracking-wider hover:bg-black/80 transition-colors"
            >
              IR A COMPRAR
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="bg-white border border-black/10 p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-32 h-32 bg-neutral-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="tracking-wider mb-1">{item.name}</h4>
                          <p className="text-sm opacity-60">Talla: {item.selectedSize}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="w-8 h-8 border border-black/20 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="w-8 h-8 border border-black/20 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="tracking-wider">
                          ${(item.price * item.quantity).toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Code */}
              <div className="bg-neutral-50 border border-black/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5" />
                  <h4 className="tracking-wider">CÓDIGO DE DESCUENTO</h4>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    className="flex-1 p-3 border border-black/20 bg-white focus:border-black outline-none placeholder:opacity-40"
                  />
                  <button className="px-6 py-3 bg-black text-white tracking-wider hover:bg-black/80 transition-colors">
                    APLICAR
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 border border-black/10 p-6 sticky top-24">
                <h3 className="tracking-wider mb-6 pb-4 border-b border-black/10">
                  RESUMEN DEL PEDIDO
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-70">Subtotal</span>
                    <span>${total.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Envío</span>
                    <span>${shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${discount.toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-blue-600 text-sm">
                    <span>Puntos a ganar</span>
                    <span>+{Math.floor(total * 0.08)} pts</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="tracking-wider">TOTAL</span>
                    <span className="text-2xl tracking-wider">${finalTotal.toLocaleString('es-MX')}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('checkout')}
                  className="w-full bg-black text-white py-4 tracking-widest hover:bg-black/80 transition-colors mb-3"
                >
                  PROCEDER AL PAGO
                </button>

                <button className="w-full border border-black/20 py-3 tracking-wider hover:bg-neutral-100 transition-colors" onClick={() => onNavigate('home')}>
                  SEGUIR COMPRANDO
                </button>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-black/10 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm tracking-wide mb-1">Envío Gratis</p>
                      <p className="text-xs opacity-60">En compras mayores a $2,000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm tracking-wide mb-1">Devoluciones</p>
                      <p className="text-xs opacity-60">30 días para cambios y devoluciones</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm tracking-wide mb-1">Pago Seguro</p>
                      <p className="text-xs opacity-60">Transacciones 100% protegidas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-16">
          <h3 className="text-center tracking-[0.2em] mb-8">TAMBIÉN TE PUEDE INTERESAR</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TODO: Conectar con productos recomendados de la base de datos */}
          </div>
        </div>
      </div>
    </div>
  );
}