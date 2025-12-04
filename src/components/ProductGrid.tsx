import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart } from "lucide-react";
import { ProductDetail } from "./ProductDetail";
import { getAllProducts, Product } from "../utils/database";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      // Filter only active products if needed, or show all
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // Abrir modal de detalles para cualquier producto
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleAddToCart = (product: Product, size: string, quantity: number) => {
    addToCart(product, size, quantity);
    setShowProductDetail(false);
    // Aquí puedes agregar una notificación de "Añadido al carrito"
    alert("Producto añadido al carrito");
  };

  if (loading) {
    return <div className="py-16 text-center">Cargando productos...</div>;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h3 className="tracking-[0.2em] mb-2">DESTACADOS</h3>
        <div className="w-16 h-px bg-black mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-4">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-opacity ${isFavorite(product.id) ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform">
                <button className="w-full bg-black text-white py-2 tracking-wider hover:bg-black/80 transition-colors">
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

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setShowProductDetail(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
}
