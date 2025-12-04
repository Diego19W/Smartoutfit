import { useState } from "react";
import { ChevronDown, Search, Package, CreditCard, Truck, RefreshCw, Shield, HelpCircle } from "lucide-react";

interface FAQProps {
  onNavigate: (page: string) => void;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqData: FAQItem[] = [
  // Pedidos y Pagos
  {
    id: "1",
    category: "Pedidos y Pagos",
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal, transferencias bancarias y pagos en efectivo en tiendas de conveniencia. Todos los pagos son procesados de forma segura a través de plataformas certificadas.",
    icon: CreditCard
  },
  {
    id: "2",
    category: "Pedidos y Pagos",
    question: "¿Puedo modificar o cancelar mi pedido?",
    answer: "Puedes modificar o cancelar tu pedido dentro de las primeras 2 horas después de realizarlo. Para hacerlo, contacta a nuestro servicio de atención al cliente con tu número de pedido. Una vez que el pedido haya sido procesado para envío, ya no podrá ser modificado.",
    icon: Package
  },
  {
    id: "3",
    category: "Pedidos y Pagos",
    question: "¿Emiten factura?",
    answer: "Sí, emitimos facturas electrónicas. Puedes solicitar tu factura enviando tu información fiscal (RFC, razón social, dirección) junto con tu número de pedido a facturacion@modaix.com dentro de los primeros 30 días después de tu compra.",
    icon: Package
  },
  // Envíos
  {
    id: "4",
    category: "Envíos",
    question: "¿Cuánto tiempo tarda el envío?",
    answer: "Los tiempos de entrega varían según tu ubicación: CDMX y Área Metropolitana (2-3 días hábiles), Interior de la República (4-6 días hábiles), Zonas remotas (7-10 días hábiles). Los pedidos se procesan de lunes a viernes.",
    icon: Truck
  },
  {
    id: "5",
    category: "Envíos",
    question: "¿Cuál es el costo de envío?",
    answer: "El envío es GRATIS en todos los pedidos superiores a $1,500 MX. Para pedidos menores, el costo de envío es de $150 MX. Ocasionalmente ofrecemos promociones de envío gratis sin mínimo de compra.",
    icon: Truck
  },
  {
    id: "6",
    category: "Envíos",
    question: "¿Puedo rastrear mi pedido?",
    answer: "Sí, una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de rastreo y un enlace para seguir tu paquete en tiempo real. También puedes verificar el estado de tu pedido en tu cuenta de MODAIX.",
    icon: Truck
  },
  {
    id: "7",
    category: "Envíos",
    question: "¿Realizan envíos internacionales?",
    answer: "Actualmente solo realizamos envíos dentro de México. Estamos trabajando para expandir nuestros servicios a otros países de Latinoamérica próximamente. Suscríbete a nuestro newsletter para recibir actualizaciones.",
    icon: Truck
  },
  // Devoluciones y Cambios
  {
    id: "8",
    category: "Devoluciones y Cambios",
    question: "¿Cuál es la política de devoluciones?",
    answer: "Aceptamos devoluciones dentro de los 30 días posteriores a la compra. Los productos deben estar sin uso, con todas sus etiquetas originales y en su empaque. El reembolso se procesa en 5-7 días hábiles después de recibir y verificar el producto.",
    icon: RefreshCw
  },
  {
    id: "9",
    category: "Devoluciones y Cambios",
    question: "¿Cómo inicio una devolución?",
    answer: "Para iniciar una devolución, ingresa a nuestra página de Devoluciones con tu número de pedido y correo electrónico. Completá el formulario y te enviaremos las instrucciones de recolección. La recolección es sin costo.",
    icon: RefreshCw
  },
  {
    id: "10",
    category: "Devoluciones y Cambios",
    question: "¿Puedo hacer un cambio en lugar de devolución?",
    answer: "Sí, ofrecemos cambios por talla o color (sujeto a disponibilidad). Contacta a nuestro servicio al cliente indicando tu número de pedido y el artículo que deseas recibir. El proceso es el mismo que una devolución, pero enviaremos el nuevo producto una vez recibido el original.",
    icon: RefreshCw
  },
  {
    id: "11",
    category: "Devoluciones y Cambios",
    question: "¿Qué hago si recibí un producto defectuoso?",
    answer: "Si recibiste un producto con algún defecto, contáctanos inmediatamente a soporte@modaix.com con fotos del producto y tu número de pedido. Procesaremos tu cambio o reembolso de forma prioritaria, sin costo adicional y sin necesidad de esperar los 30 días.",
    icon: RefreshCw
  },
  // Productos
  {
    id: "12",
    category: "Productos",
    question: "¿Cómo sé qué talla elegir?",
    answer: "Cada producto incluye una guía de tallas detallada. Te recomendamos medir una prenda similar que te quede bien y compararla con nuestras medidas. Si tienes dudas, nuestro equipo de atención al cliente puede ayudarte a elegir la talla correcta.",
    icon: HelpCircle
  },
  {
    id: "13",
    category: "Productos",
    question: "¿Los productos son originales?",
    answer: "Absolutamente. MODAIX es una marca de moda de lujo con diseños originales. Trabajamos con materiales de la más alta calidad y fabricamos nuestras prendas siguiendo estrictos estándares de calidad. Cada prenda incluye un certificado de autenticidad.",
    icon: Shield
  },
  {
    id: "14",
    category: "Productos",
    question: "¿Cuándo llegan nuevos productos?",
    answer: "Lanzamos nuevas colecciones cada temporada (primavera, verano, otoño, invierno) y actualizamos regularmente nuestro catálogo con piezas exclusivas. Suscríbete a nuestro newsletter o síguenos en redes sociales para ser el primero en conocer los nuevos lanzamientos.",
    icon: HelpCircle
  },
  {
    id: "15",
    category: "Productos",
    question: "¿Ofrecen servicio de personalización?",
    answer: "Sí, ofrecemos servicios de personalización premium para pedidos especiales. Contáctanos a personalización@modaix.com con tu solicitud y nuestro equipo te enviará un presupuesto y tiempos de entrega.",
    icon: HelpCircle
  },
  // Cuenta y Seguridad
  {
    id: "16",
    category: "Cuenta y Seguridad",
    question: "¿Necesito crear una cuenta para comprar?",
    answer: "No es obligatorio, pero te recomendamos crear una cuenta para disfrutar de beneficios como: seguimiento de pedidos, historial de compras, direcciones guardadas, acceso prioritario a nuevos lanzamientos y promociones exclusivas.",
    icon: Shield
  },
  {
    id: "17",
    category: "Cuenta y Seguridad",
    question: "¿Es seguro comprar en MODAIX?",
    answer: "Completamente seguro. Utilizamos encriptación SSL para proteger tu información personal y financiera. No almacenamos datos de tarjetas de crédito en nuestros servidores. Todos los pagos son procesados a través de plataformas certificadas PCI DSS.",
    icon: Shield
  },
  {
    id: "18",
    category: "Cuenta y Seguridad",
    question: "¿Cómo cambio mi contraseña?",
    answer: "Puedes cambiar tu contraseña desde tu cuenta en la sección de Configuración. Si olvidaste tu contraseña, haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión y recibirás un enlace para restablecerla.",
    icon: Shield
  },
];

export function FAQ({ onNavigate }: FAQProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["all", ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Pedidos y Pagos": return CreditCard;
      case "Envíos": return Truck;
      case "Devoluciones y Cambios": return RefreshCw;
      case "Productos": return HelpCircle;
      case "Cuenta y Seguridad": return Shield;
      default: return HelpCircle;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl tracking-[0.3em] mb-4">FAQ</h1>
          <p className="text-lg opacity-70 tracking-wider">
            PREGUNTAS FRECUENTES
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar preguntas..."
            className="w-full pl-14 pr-4 py-4 border border-black/20 bg-white shadow-lg focus:border-black outline-none"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 border transition-colors ${
                selectedCategory === category
                  ? "bg-black text-white border-black"
                  : "border-black/20 hover:bg-black/5"
              }`}
            >
              <span className="text-sm tracking-wider">
                {category === "all" ? "TODAS" : category.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="tracking-wider">No se encontraron preguntas que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedId === item.id;
              
              return (
                <div
                  key={item.id}
                  className="border border-black/10 bg-white transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full px-6 py-5 flex items-start gap-4 text-left"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs tracking-wider opacity-50 mb-1">
                        {item.category.toUpperCase()}
                      </div>
                      <h3 className="tracking-wide">{item.question}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 opacity-60 flex-shrink-0 mt-1 transition-transform ${
                        isExpanded ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-5 pl-[60px]">
                      <div className="border-t border-black/10 pt-4">
                        <p className="opacity-70 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-neutral-50 border-t border-black/10 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl tracking-wider mb-4">¿NO ENCONTRASTE LO QUE BUSCABAS?</h3>
          <p className="opacity-60 mb-8 tracking-wide">
            Nuestro equipo de atención al cliente está aquí para ayudarte
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 border border-black/10">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-60" />
              <p className="text-sm tracking-wider mb-2">Email</p>
              <p className="text-sm opacity-60">soporte@modaix.com</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-60" />
              <p className="text-sm tracking-wider mb-2">WhatsApp</p>
              <p className="text-sm opacity-60">+52 55 1234 5678</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <Shield className="w-8 h-8 mx-auto mb-3 opacity-60" />
              <p className="text-sm tracking-wider mb-2">Horario</p>
              <p className="text-sm opacity-60">Lun - Vie: 9:00 - 18:00</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="bg-black text-white px-8 py-3 hover:bg-black/90 transition-colors"
          >
            <span className="text-sm tracking-wider">VOLVER AL INICIO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
