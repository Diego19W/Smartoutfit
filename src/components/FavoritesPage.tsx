import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, ShoppingCart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { getAllProducts, Product } from "../utils/database";
import { useCart } from "../context/CartContext";
import { ProductDetail } from "./ProductDetail";

interface FavoritesPageProps {
    onNavigate: (page: string) => void;
}

export function FavoritesPage({ onNavigate }: FavoritesPageProps) {
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductDetail, setShowProductDetail] = useState(false);

    useEffect(() => {
        loadFavoriteProducts();
    }, [favorites]);

    const loadFavoriteProducts = async () => {
        try {
            const allProducts = await getAllProducts();
            const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
            setProducts(favoriteProducts);
        } catch (error) {
            console.error("Failed to load favorites", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
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

    if (loading) {
        return <div className="py-16 text-center">Cargando favoritos...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="tracking-[0.3em] mb-4">MIS FAVORITOS</h2>
                    <div className="w-16 h-px bg-black mx-auto mb-8"></div>
                    <p className="text-center opacity-60 max-w-2xl mx-auto">
                        Tu colección personal de artículos deseados
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-50 rounded-lg">
                        <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg mb-4">No tienes productos en favoritos</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="px-6 py-3 bg-black text-white tracking-wider hover:bg-black/80 transition-colors"
                        >
                            EXPLORAR TIENDA
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(product.id);
                                        }}
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                    <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                        <button className="w-full bg-black text-white py-2 text-sm tracking-wider hover:bg-black/80 transition-colors">
                                            VER DETALLES
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

                {showProductDetail && selectedProduct && (
                    <ProductDetail
                        product={selectedProduct}
                        onClose={() => setShowProductDetail(false)}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />
                )}
            </div>
        </div>
    );
}
