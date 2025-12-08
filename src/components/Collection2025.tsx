import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";

const collection2025Products = [
  {
    id: 1,
    name: "Vestido Avant-Garde",
    price: 4599,
    image: "https://images.unsplash.com/photo-1762430815620-fcca603c240c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbW9kZWx8ZW58MXx8fHwxNzY0MTEyMTkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Nueva Temporada",
    featured: true
  },
  {
    id: 2,
    name: "Conjunto Signature",
    price: 5299,
    image: "https://images.unsplash.com/photo-1759563874676-d551447de3a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NjQyMTQ1MDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Exclusivo",
    featured: true
  },
  {
    id: 3,
    name: "Look Editorial",
    price: 3899,
    image: "https://images.unsplash.com/photo-1691520028197-ff1c86e94759?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGZhc2hpb24lMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzY0MjI5MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Limitado",
    featured: true
  },
  {
    id: 4,
    name: "Traje Ejecutivo Premium",
    price: 3299,
    image: "https://images.unsplash.com/photo-1724245190409-97f3415a7d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBmYXNoaW9uJTIwc3VpdHxlbnwxfHx8fDE3NjQyMjg2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Formal"
  },
  {
    id: 5,
    name: "Vestido Minimal Deluxe",
    price: 2899,
    image: "https://images.unsplash.com/photo-1542219550-2da790bf52e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZmFzaGlvbiUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDE1NTQ1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Minimal"
  },
  {
    id: 6,
    name: "Abrigo Statement 2025",
    price: 4299,
    image: "https://images.unsplash.com/photo-1552256028-71eb9a7ff27d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBjb2F0JTIwZmFzaGlvbnxlbnwxfHx8fDE3NjQyMjg3MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Abrigos"
  },
  {
    id: 7,
    name: "Vestido de Gala",
    price: 5499,
    image: "https://images.unsplash.com/photo-1760287363707-851f4780b98c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3MlMjBtYW5uZXF1aW58ZW58MXx8fHwxNzY0MjI3NTk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Noche"
  },
  {
    id: 8,
    name: "Conjunto Urban Luxury",
    price: 2199,
    image: "https://images.unsplash.com/photo-1635650805015-2fa50682873a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwc3RyZWV0d2VhcnxlbnwxfHx8fDE3NjQxODExNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Streetwear"
  },
  {
    id: 9,
    name: "Look Elegante",
    price: 3799,
    image: "https://images.unsplash.com/photo-1721990336298-90832e791b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZhc2hpb24lMjBkcmVzc3xlbnwxfHx8fDE3NjQyMjY0Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Casual Chic"
  }
];

export function Collection2025() {
  const featuredProducts = collection2025Products.filter(p => p.featured);
  const regularProducts = collection2025Products.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1762430815620-fcca603c240c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbW9kZWx8ZW58MXx8fHwxNzY0MTEyMTkyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Collection 2025"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <div className="inline-flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm tracking-[0.3em] opacity-70">NUEVA</span>
            </div>
            <h2 className="text-5xl sm:text-7xl tracking-[0.3em] mb-6">
              COLECCIÓN 2025
            </h2>
            <p className="text-xl tracking-wider opacity-80 mb-8">
              El Futuro de la Elegancia
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="px-4 py-2 border border-white/30 text-sm tracking-wider">
                EDICIÓN LIMITADA
              </span>
              <span className="px-4 py-2 border border-white/30 text-sm tracking-wider">
                ENVÍO GRATIS
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Products */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="tracking-[0.2em] mb-2">PIEZAS DESTACADAS</h3>
            <div className="w-16 h-px bg-black mx-auto mb-4"></div>
            <p className="opacity-60">Diseños exclusivos de la nueva temporada</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-4">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-widest">
                    {product.category}
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button className="w-full bg-white text-black py-3 tracking-wider hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      AÑADIR AL CARRITO
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="tracking-wider mb-1">{product.name}</h4>
                  <p className="opacity-60">${product.price.toLocaleString('es-MX')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Statement */}
        <div className="bg-black text-white p-12 mb-20 text-center">
          <p className="text-xl tracking-wider max-w-3xl mx-auto leading-relaxed">
            "La Colección 2025 representa la fusión perfecta entre tradición y vanguardia.
            Cada pieza ha sido diseñada para expresar individualidad y sofisticación atemporal."
          </p>
          <p className="mt-6 text-sm tracking-widest opacity-70">— SMARTOUTFIT DESIGN TEAM</p>
        </div>

        {/* All Collection Products */}
        <div>
          <div className="text-center mb-12">
            <h3 className="tracking-[0.2em] mb-2">COLECCIÓN COMPLETA</h3>
            <div className="w-16 h-px bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {regularProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-4">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white text-black px-2 py-1 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.category}
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button className="w-full bg-black text-white py-2 text-sm tracking-wider hover:bg-black/80 transition-colors">
                      AÑADIR AL CARRITO
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="tracking-wider mb-1 text-sm">{product.name}</h4>
                  <p className="opacity-60 text-sm">${product.price.toLocaleString('es-MX')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h3 className="tracking-[0.2em] mb-6">¿NECESITAS AYUDA PARA ELEGIR?</h3>
          <p className="opacity-60 mb-8 max-w-2xl mx-auto">
            Nuestro AI Stylist puede ayudarte a encontrar las piezas perfectas de la Colección 2025
            basándose en tu estilo y preferencias
          </p>
          <button className="bg-black text-white px-8 py-4 tracking-widest hover:bg-black/80 transition-colors inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            CONSULTAR AI STYLIST
          </button>
        </div>
      </div>
    </div>
  );
}
