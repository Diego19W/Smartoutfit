import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, Search } from "lucide-react";
import { CustomSelect } from "./CustomSelect";
import { ProductDetail } from "./ProductDetail";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { Product } from "../utils/database";

interface CategoryPageProps {
  title: string;
  genderFilter?: string; // 'hombre' | 'mujer'
  onNavigate: (page: string) => void;
}

export function CategoryPage({ title, genderFilter, onNavigate }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchProducts();
  }, [genderFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost/E-commerce Fashion Store Mockup 2/api/products.php';
      if (genderFilter) {
        url += `?gender=${genderFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: "price-asc", label: "Precio: Menor a Mayor" },
    { value: "price-desc", label: "Precio: Mayor a Menor" },
    { value: "recent", label: "Más Recientes" },
    { value: "popular", label: "Más Populares" },
  ];

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const handleProductClick = (productId: number) => {
    setSelectedProduct(productId);
    setShowProductDetail(true);
  };

  const handleAddToCart = (product: Product, size: string, quantity: number) => {
    addToCart(product, size, quantity);
    setShowProductDetail(false);
    alert("Producto añadido al carrito");
  };

  const handleBuyNow = () => {
    setShowProductDetail(false);
    onNavigate('cart');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-center tracking-[0.3em] mb-4">{title}</h2>
          <div className="w-16 h-px bg-black mx-auto mb-8"></div>
          <p className="text-center opacity-60 max-w-2xl mx-auto">
            Explora nuestra selección exclusiva de {title.toLowerCase()}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/10 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 border border-black/20 bg-white hover:border-black focus:border-black outline-none text-sm tracking-wider transition-colors placeholder:opacity-40"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="ORDENAR POR"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-4">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-opacity ${isFavorite(product.id) ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button
                      className="w-full bg-black text-white py-2 text-sm tracking-wider hover:bg-black/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart with default size M and quantity 1 
                        addToCart(products.find(p => p.id === product.id)!, 'M', 1);
                        alert("Producto añadido al carrito");
                      }}
                    >
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
        )}

        {/* Product Detail Modal */}
        {showProductDetail && selectedProduct !== null && products.find(p => p.id === selectedProduct) && (
          <ProductDetail
            product={products.find(p => p.id === selectedProduct)!}
            onClose={() => setShowProductDetail(false)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
      </div>
    </div>
  );
}
