import { useState, useEffect } from "react";
import { X, CreditCard, Truck, ShieldCheck, Lock, MapPin, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe("pk_test_51SbSaIPTlvFtxvvobNCY471tr8MrhyS55ootamRNGRuf14hUIRnRzP642fei75o3g3nCDFCEBfcJRtKzGJTL4E3w00d2uZSn6P"); // Replace with your Stripe Publishable Key

const StripePaymentForm = ({ onSubmit }: { onSubmit: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message ?? 'An unknown error occurred');
        setProcessing(false);
      } else {
        console.log('[PaymentMethod]', paymentMethod);
        // Here you would send paymentMethod.id to your server
        onSubmit();
        setProcessing(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="p-4 border border-black/20 rounded-md mb-4 bg-white">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#000000',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <button
        type="button"
        onClick={(e) => handleSubmit(e)}
        disabled={!stripe || processing}
        className="w-full bg-black text-white py-3 tracking-wider hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" />
        {processing ? 'PROCESANDO...' : 'PAGAR CON STRIPE'}
      </button>
    </div>
  );
};

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { cartItems, total, clearCart } = useCart();
  const { user, checkSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'stripe'>('paypal');
  const [cardExpiry, setCardExpiry] = useState("");

  // Load redeemed points from localStorage
  useEffect(() => {
    const savedPoints = localStorage.getItem('redeemedPoints');
    if (savedPoints) {
      setPointsToRedeem(parseInt(savedPoints));
    }
  }, []);

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

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    setCardExpiry(value);
  };

  const shipping = total > 2000 ? 0 : 200;
  const pointsDiscount = Math.floor(pointsToRedeem / 1.5);
  const finalTotal = Math.max(0, total + shipping - pointsDiscount);

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
      paymentMethod: paymentMethod,
      pointsRedeemed: pointsToRedeem,
      pointsDiscount: pointsDiscount
    };

    try {
      const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error processing order');
      }

      // Clear cart and redeemed points
      clearCart();
      localStorage.removeItem('redeemedPoints');

      // Refresh user session to update points
      if (user) {
        await checkSession();
      }

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
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 tracking-wider text-sm transition-colors ${paymentMethod === 'paypal' ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}
                  >
                    PAYPAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 border-2 tracking-wider text-sm transition-colors ${paymentMethod === 'stripe' ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}
                  >
                    STRIPE
                  </button>
                </div>

                {paymentMethod === 'paypal' ? (
                  <div className="mt-6">
                    <PayPalScriptProvider options={{
                      clientId: "test", // Replace with your Sandbox Client ID
                      currency: "MXN",
                      intent: "capture"
                    }}>
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "rect" }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            payer: {
                              name: {
                                given_name: formData.firstName,
                                surname: formData.lastName
                              },
                              email_address: formData.email,
                              address: {
                                address_line_1: formData.address,
                                admin_area_2: formData.city,
                                admin_area_1: formData.state,
                                postal_code: formData.zip,
                                country_code: "MX"
                              }
                            },
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "MXN",
                                  value: total.toString(),
                                  breakdown: {
                                    item_total: {
                                      currency_code: "MXN",
                                      value: total.toString()
                                    }
                                  }
                                },
                                description: "Compra en SmartOutfit",
                                shipping: {
                                  name: {
                                    full_name: `${formData.firstName} ${formData.lastName}`
                                  },
                                  address: {
                                    address_line_1: formData.address,
                                    admin_area_2: formData.city,
                                    admin_area_1: formData.state,
                                    postal_code: formData.zip,
                                    country_code: "MX"
                                  }
                                }
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (actions.order) {
                            const details = await actions.order.capture();
                            // Handle successful payment here
                            // You can call handleSubmit or a specific function for PayPal success
                            console.log("Transaction completed by " + (details.payer?.name?.given_name ?? 'Unknown'));
                            handleSubmit({ preventDefault: () => { } } as any); // Trigger existing submit logic
                          }
                        }}
                      />
                    </PayPalScriptProvider>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Serás redirigido a PayPal para completar tu pago de forma segura.
                    </p>
                  </div>
                ) : paymentMethod === 'stripe' ? (
                  <div className="mt-6 p-4 border border-black/10 rounded-md">
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm onSubmit={() => handleSubmit({ preventDefault: () => { } } as any)} />
                    </Elements>
                  </div>
                ) : null}
              </div>

              {/* Submit Button */}
              {/* Submit Button - Only show if NOT using Stripe or PayPal (they have their own buttons) */}
              {paymentMethod !== 'stripe' && paymentMethod !== 'paypal' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  {loading ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
                </button>
              )}

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
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Descuento por puntos</span>
                    <span>-${pointsDiscount.toLocaleString('es-MX')}</span>
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
      </div >

      {/* DEBUG INFO - TO BE REMOVED */}
      < div className="bg-gray-100 p-4 mt-8 text-xs font-mono overflow-auto max-w-7xl mx-auto" >
        <p><strong>Debug Info:</strong></p>
        <p>Is Authenticated: {user ? 'Yes' : 'No'}</p>
        <p>User Data:</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div >
    </div >
  );
}
