import { useState } from "react";
import { Package, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ReturnsProps {
  onNavigate: (page: string) => void;
}

export function Returns({ onNavigate }: ReturnsProps) {
  const [step, setStep] = useState<'validate' | 'form' | 'success'>('validate');
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [validatedOrder, setValidatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnAddress, setReturnAddress] = useState("");
  const [returnCity, setReturnCity] = useState("");
  const [returnPostalCode, setReturnPostalCode] = useState("");
  const [returnPhone, setReturnPhone] = useState("");

  const validateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: Implementar validación con base de datos
    // Ejemplo con Supabase:
    // const { data, error } = await supabase
    //   .from('orders')
    //   .select('*')
    //   .eq('order_number', orderNumber)
    //   .eq('customer_email', email)
    //   .single()
    // 
    // if (error || !data) {
    //   setError('No se encontró un pedido con este número y correo electrónico')
    //   setLoading(false)
    //   return
    // }
    // 
    // // Verificar que el pedido sea elegible para devolución (ej: menos de 30 días)
    // const orderDate = new Date(data.created_at)
    // const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    // 
    // if (daysSinceOrder > 30) {
    //   setError('Este pedido ya no es elegible para devolución (más de 30 días)')
    //   setLoading(false)
    //   return
    // }
    // 
    // if (data.status === 'cancelled' || data.status === 'refunded') {
    //   setError('Este pedido ya fue cancelado o reembolsado')
    //   setLoading(false)
    //   return
    // }
    // 
    // setValidatedOrder(data)
    // setStep('form')

    // Simulación - remover en producción
    setTimeout(() => {
      if (orderNumber.startsWith('#')) {
        setValidatedOrder({
          orderNumber,
          email,
          total: 1299,
          date: '21/10/2025'
        });
        setStep('form');
      } else {
        setError('No se encontró un pedido con este número y correo electrónico');
      }
      setLoading(false);
    }, 1000);
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Crear registro de devolución en base de datos
    // const { data, error } = await supabase
    //   .from('returns')
    //   .insert([{
    //     order_id: validatedOrder.id,
    //     order_number: orderNumber,
    //     reason: reason,
    //     description: description,
    //     return_address: returnAddress,
    //     return_city: returnCity,
    //     return_postal_code: returnPostalCode,
    //     return_phone: returnPhone,
    //     status: 'pending',
    //     created_at: new Date()
    //   }])
    // 
    // if (error) {
    //   setError('Error al procesar la devolución. Intenta nuevamente.')
    //   setLoading(false)
    //   return
    // }
    // 
    // // Enviar email de confirmación
    // // TODO: Implementar envío de email

    console.log("Return submitted:", {
      orderNumber,
      reason,
      description,
      returnAddress,
      returnCity,
      returnPostalCode,
      returnPhone
    });

    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center py-12">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          </div>
          <h1 className="text-3xl tracking-wider mb-4">SOLICITUD RECIBIDA</h1>
          <p className="text-lg opacity-60 mb-8 tracking-wide">
            Hemos recibido tu solicitud de devolución para el pedido <strong>{orderNumber}</strong>
          </p>
          <div className="bg-neutral-50 p-6 border border-black/10 mb-8 text-left">
            <h3 className="tracking-wider mb-4">PRÓXIMOS PASOS</h3>
            <ol className="space-y-3 opacity-70">
              <li className="flex gap-3">
                <span className="flex-shrink-0">1.</span>
                <span>Recibirás un correo de confirmación con las instrucciones detalladas en las próximas 24 horas.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">2.</span>
                <span>Prepara el producto en su empaque original con todas sus etiquetas.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">3.</span>
                <span>Un servicio de mensajería pasará a recoger tu paquete en la dirección proporcionada.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">4.</span>
                <span>Una vez recibido y verificado, procesaremos tu reembolso en 5-7 días hábiles.</span>
              </li>
            </ol>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-black text-white py-3 hover:bg-black/90 transition-colors"
            >
              <span className="text-sm tracking-wider">VOLVER AL INICIO</span>
            </button>
            <button
              onClick={() => {
                setStep('validate');
                setOrderNumber("");
                setEmail("");
                setValidatedOrder(null);
                setError("");
              }}
              className="w-full border border-black/20 py-3 hover:bg-black/5 transition-colors"
            >
              <span className="text-sm tracking-wider">NUEVA DEVOLUCIÓN</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl tracking-wider mb-2">FORMULARIO DE DEVOLUCIÓN</h1>
            <p className="text-sm opacity-60 tracking-wider">
              Pedido: {orderNumber}
            </p>
          </div>

          {/* Validated Order Info */}
          <div className="bg-neutral-50 p-6 border border-black/10 mb-8">
            <h3 className="tracking-wider mb-3">INFORMACIÓN DEL PEDIDO</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-60 mb-1">Número de pedido:</p>
                <p>{validatedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="opacity-60 mb-1">Fecha:</p>
                <p>{validatedOrder.date}</p>
              </div>
              <div>
                <p className="opacity-60 mb-1">Correo:</p>
                <p>{validatedOrder.email}</p>
              </div>
              <div>
                <p className="opacity-60 mb-1">Total:</p>
                <p>${validatedOrder.total} MX</p>
              </div>
            </div>
          </div>

          {/* Return Form */}
          <form onSubmit={submitReturn} className="space-y-6">
            {/* Reason for Return */}
            <div>
              <label className="block text-sm tracking-wider mb-2 opacity-60">
                MOTIVO DE LA DEVOLUCIÓN *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
              >
                <option value="">Selecciona un motivo</option>
                <option value="size">Talla incorrecta</option>
                <option value="defect">Producto defectuoso</option>
                <option value="different">No es lo que esperaba</option>
                <option value="duplicate">Pedido duplicado</option>
                <option value="changed_mind">Cambié de opinión</option>
                <option value="other">Otro motivo</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm tracking-wider mb-2 opacity-60">
                DESCRIPCIÓN DETALLADA *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe el motivo de tu devolución..."
                className="w-full px-4 py-3 border border-black/20 bg-white focus:border-black outline-none resize-none"
              />
            </div>

            {/* Return Address */}
            <div>
              <label className="block text-sm tracking-wider mb-2 opacity-60">
                DIRECCIÓN DE RECOLECCIÓN *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <input
                  type="text"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  required
                  placeholder="Calle y número"
                  className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
                />
              </div>
            </div>

            {/* City and Postal Code */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm tracking-wider mb-2 opacity-60">
                  CIUDAD *
                </label>
                <input
                  type="text"
                  value={returnCity}
                  onChange={(e) => setReturnCity(e.target.value)}
                  required
                  placeholder="Ciudad"
                  className="w-full px-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm tracking-wider mb-2 opacity-60">
                  CÓDIGO POSTAL *
                </label>
                <input
                  type="text"
                  value={returnPostalCode}
                  onChange={(e) => setReturnPostalCode(e.target.value)}
                  required
                  placeholder="00000"
                  className="w-full px-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm tracking-wider mb-2 opacity-60">
                TELÉFONO DE CONTACTO *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
                <input
                  type="tel"
                  value={returnPhone}
                  onChange={(e) => setReturnPhone(e.target.value)}
                  required
                  placeholder="+52 123 456 7890"
                  className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
                />
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 border border-amber-200 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm opacity-70">
                  <p className="mb-2">
                    <strong>Importante:</strong> Para procesar tu devolución, el producto debe estar:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>En perfectas condiciones y sin uso</li>
                    <li>Con todas sus etiquetas originales</li>
                    <li>En su empaque original</li>
                    <li>Con todos sus accesorios incluidos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm tracking-wider">
                  {loading ? "PROCESANDO..." : "ENVIAR SOLICITUD"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('validate');
                  setValidatedOrder(null);
                }}
                className="w-full border border-black/20 py-3 hover:bg-black/5 transition-colors"
              >
                <span className="text-sm tracking-wider">CANCELAR</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h1 className="text-3xl tracking-wider mb-2">DEVOLUCIONES</h1>
          <p className="text-sm opacity-60 tracking-wider">
            Ingresa tu número de pedido para iniciar una devolución
          </p>
        </div>

        {/* Validation Form */}
        <form onSubmit={validateOrder} className="space-y-6">
          {/* Order Number */}
          <div>
            <label className="block text-sm tracking-wider mb-2 opacity-60">
              NÚMERO DE PEDIDO
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  setError("");
                }}
                required
                placeholder="#279"
                className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm tracking-wider mb-2 opacity-60">
              CORREO ELECTRÓNICO
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                placeholder="tu@email.com"
                className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm tracking-wider">
              {loading ? "VALIDANDO..." : "VALIDAR PEDIDO"}
            </span>
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-neutral-50 p-6 border border-black/10">
          <h3 className="tracking-wider mb-3 text-sm">POLÍTICA DE DEVOLUCIONES</h3>
          <ul className="text-sm opacity-70 space-y-2">
            <li>• Aceptamos devoluciones dentro de los 30 días posteriores a la compra</li>
            <li>• Los productos deben estar sin uso y con etiquetas</li>
            <li>• El reembolso se procesará en 5-7 días hábiles</li>
            <li>• La recolección es sin costo</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm tracking-wider opacity-40 hover:opacity-70 transition-opacity"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
