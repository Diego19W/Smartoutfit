import { Heart } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { Product } from "../../utils/database";
import { useFavorites } from "../../context/FavoritesContext";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
    product: Product;
    onNavigate?: (page: string) => void;
    onClick?: (product: Product) => void;
}

export function ProductCard({ product, onNavigate, onClick }: ProductCardProps) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product, 'M', 1);
        alert("Producto añadido al carrito");
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    return (
        <div
            className="group cursor-pointer"
            onClick={() => onClick?.(product)}
        >
            <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-4">
                <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                    className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-opacity ${isFavorite(product.id) ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={handleFavoriteClick}
                >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button
                        className="w-full bg-black text-white py-2 tracking-wider hover:bg-black/80 transition-colors"
                        onClick={handleAddToCart}
                    >
                        AÑADIR AL CARRITO
                    </button>
                </div>
            </div>

            <div className="text-center">
                <h4 className="tracking-wider mb-1">{product.name}</h4>
                <p className="opacity-60">${product.price.toLocaleString('es-MX')}</p>
            </div>
        </div>
    );
}
