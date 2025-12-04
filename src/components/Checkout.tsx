import { useState, useEffect } from "react";
import { CreditCard, Lock, MapPin, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      const parts = (user.nombre || '').split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phone: user.telefono || '',
        address: user.direccion || '',
        city: user.ciudad || '',
        state: user.estado || '',
        zip: user.codigo_postal || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const shipping = total > 2000 ? 0 : 200;
  const discount = 0;
  const finalTotal = total + shipping - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customer: formData,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.selectedSize,
        price: item.price
      })),
      total: finalTotal,
      paymentMethod: 'card'
    };

    try {
      const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error processing order');
      }

      clearCart();
      onNavigate('receipt');
    } catch (error) {
      console.error(error);
      alert('Error al procesar el pedido. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl tracking-wider mb-4">Tu carrito está vacío</h2>
          <button
            onClick={() => onNavigate('home')}
            className="bg-black text-white px-8 py-3 tracking-wider hover:bg-black/80 transition-colors"
          >
            VOLVER A LA TIENDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8" />
            <h2 className="tracking-[0.2em]">INFORMACIÓN DE PAGO</h2>
          </div>
          <p className="text-center opacity-60">
            Complete sus datos para finalizar la compra
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="border border-black/10 p-6">
                <h3 className="tracking-wider mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  INFORMACIÓN DE CONTACTO
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      NOMBRE
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      APELLIDO
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Pérez"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      TELÉFONO
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-black/10 p-6">
                <h3 className="tracking-wider mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  DIRECCIÓN DE ENVÍO
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      DIRECCIÓN
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Calle Principal 123"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm tracking-wider mb-2 opacity-70">
                        CIUDAD
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ciudad"
                        className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm tracking-wider mb-2 opacity-70">
                        ESTADO
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Estado"
                        className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm tracking-wider mb-2 opacity-70">
                        CÓDIGO POSTAL
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-black/10 p-6">
                <h3 className="tracking-wider mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  MÉTODO DE PAGO
                </h3>

                {/* Payment Options */}
                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  <button
                    type="button"
                    className="p-4 border-2 border-black bg-black text-white tracking-wider text-sm"
                  >
                    TARJETA
                  </button>
                  <button
                    type="button"
                    className="p-4 border border-black/20 hover:border-black tracking-wider text-sm transition-colors"
                  >
                    PAYPAL
                  </button>
                  <button
                    type="button"
                    className="p-4 border border-black/20 hover:border-black tracking-wider text-sm transition-colors"
                  >
                    TRANSFERENCIA
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      NÚMERO DE TARJETA
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm tracking-wider mb-2 opacity-70">
                        FECHA DE EXPIRACIÓN
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm tracking-wider mb-2 opacity-70">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        maxLength={3}
                        className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm tracking-wider mb-2 opacity-70">
                      NOMBRE EN LA TARJETA
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Como aparece en la tarjeta"
                      className="w-full p-3 border border-black/20 focus:border-black outline-none placeholder:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                {loading ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
              </button>

              <p className="text-xs text-center opacity-60">
                Al realizar tu pedido, aceptas nuestros términos y condiciones
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 border border-black/10 p-6 sticky top-24">
              <h3 className="tracking-wider mb-6 pb-4 border-b border-black/10">
                RESUMEN DEL PEDIDO
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-black/10 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                    <span className="opacity-70">{item.name} ({item.selectedSize}) x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                  </div>
                ))}
              </div>

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
              </div>

              <div className="pt-4 border-t border-black/10">
                <div className="flex justify-between items-center">
                  <span className="tracking-wider">TOTAL</span>
                  <span className="text-2xl tracking-wider">${finalTotal.toLocaleString('es-MX')}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-black/10">
                <div className="flex items-center justify-center gap-2 text-sm opacity-70">
                  <Lock className="w-4 h-4" />
                  <span className="tracking-wider">PAGO SEGURO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEBUG INFO - TO BE REMOVED */}
      <div className="bg-gray-100 p-4 mt-8 text-xs font-mono overflow-auto max-w-7xl mx-auto">
        <p><strong>Debug Info:</strong></p>
        <p>Is Authenticated: {user ? 'Yes' : 'No'}</p>
        <p>User Data:</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
