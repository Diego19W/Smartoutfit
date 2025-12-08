import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ProductCard } from "./figma/ProductCard";
import { Heart } from "lucide-react";
import { ProductDetail } from "./ProductDetail";
import { getAllProducts, Product } from "../utils/database";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

interface ProductGridProps {
  onNavigate: (page: string) => void;
}

export function ProductGrid({ onNavigate }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [navigateToCart, setNavigateToCart] = useState(false);

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

  const handleBuyNow = () => {
    // Close modal and navigate to cart
    setShowProductDetail(false);
    onNavigate('cart');
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={handleProductClick}
          />
        ))}
      </div>

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setShowProductDetail(false)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </section>
  );
}
