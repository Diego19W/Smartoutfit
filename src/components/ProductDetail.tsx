import { useState } from "react";
import { X, ShoppingCart, Heart, Share2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "../utils/database";
import { useFavorites } from "../context/FavoritesContext";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Use product images or fallback to single image repeated
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image, product.image, product.image];

  const sizes = ["XS", "S", "M", "L", "XL"];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, quantity);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Side - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="border-4 border-blue-500 bg-neutral-50 aspect-square flex items-center justify-center">
              <ImageWithFallback
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 aspect-square bg-neutral-50 hover:border-black transition-colors ${selectedImage === index ? "border-blue-500" : "border-neutral-300"
                    }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} vista ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-4xl tracking-tight mb-2">
                {product.name}
              </h2>
              <p className="text-sm opacity-60 tracking-wider">SKU: MODAIX-{product.id.toString().padStart(4, '0')}</p>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <p className="tracking-wider">CORTE ELEGANTE & MODERNO</p>
              <p className="tracking-wider">100% ALGODÓN</p>
              <p className="tracking-wider">DISEÑO MINIMALISTA</p>
              <p className="tracking-wider">TEJIDO PREMIUM</p>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-black/10">
              <p className="text-4xl tracking-tight">$ {product.price.toLocaleString('es-MX')} MX</p>
              <p className="text-sm text-neutral-500 mt-1">
                o canjealo por <span className="font-medium text-black">{Math.ceil(product.price * 1.5)} Puntos</span>
              </p>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block tracking-wider mb-3 text-sm opacity-70">
                TALLA
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => {
                  const sizeKey = size as keyof typeof product.sizeStock;
                  const stockForSize = product.sizeStock?.[sizeKey] || 0;
                  const isAvailable = stockForSize > 0;

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                          // Reset quantity if it exceeds available stock
                          if (quantity > stockForSize) {
                            setQuantity(1);
                          }
                        }
                      }}
                      disabled={!isAvailable}
                      className={`py-3 border-2 tracking-wider transition-all relative ${selectedSize === size
                        ? "bg-black text-white border-black"
                        : isAvailable
                          ? "border-black/20 hover:border-black"
                          : "border-black/10 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        }`}
                      title={!isAvailable ? "Talla agotada" : `${stockForSize} disponibles`}
                    >
                      {size}
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs">✕</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs opacity-60 mt-2">
                {(() => {
                  const sizeKey = selectedSize as keyof typeof product.sizeStock;
                  const availableStock = product.sizeStock?.[sizeKey] || 0;
                  return availableStock > 0
                    ? `Stock disponible: ${availableStock} unidades`
                    : 'Talla agotada';
                })()}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block tracking-wider mb-3 text-sm opacity-70">
                CANTIDAD
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-12 h-12 border-2 border-black/20 hover:border-black transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-16 h-12 border-2 border-black/20 flex items-center justify-center tracking-wider">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const sizeKey = selectedSize as keyof typeof product.sizeStock;
                    const availableStock = product.sizeStock?.[sizeKey] || 0;
                    if (quantity < availableStock) {
                      incrementQuantity();
                    }
                  }}
                  disabled={(() => {
                    const sizeKey = selectedSize as keyof typeof product.sizeStock;
                    const availableStock = product.sizeStock?.[sizeKey] || 0;
                    return quantity >= availableStock;
                  })()}
                  className="w-12 h-12 border-2 border-black/20 hover:border-black transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <p className="text-xs opacity-60 mt-2">
                {(() => {
                  const sizeKey = selectedSize as keyof typeof product.sizeStock;
                  const availableStock = product.sizeStock?.[sizeKey] || 0;
                  return quantity >= availableStock
                    ? `Máximo disponible: ${availableStock}`
                    : `Puedes añadir ${availableStock - quantity} más`;
                })()}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={(() => {
                const sizeKey = selectedSize as keyof typeof product.sizeStock;
                const availableStock = product.sizeStock?.[sizeKey] || 0;
                return availableStock === 0;
              })()}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {(() => {
                const sizeKey = selectedSize as keyof typeof product.sizeStock;
                const availableStock = product.sizeStock?.[sizeKey] || 0;
                return availableStock === 0 ? 'SIN STOCK' : 'COMPRAR';
              })()}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`flex items-center justify-center gap-2 py-3 border-2 transition-colors ${isFavorite(product.id)
                  ? 'bg-black text-white border-black'
                  : 'border-black/20 hover:bg-black hover:text-white'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                <span className="tracking-wider text-sm">
                  {isFavorite(product.id) ? 'GUARDADO' : 'FAVORITOS'}
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-black/20 hover:bg-black hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="tracking-wider text-sm">COMPARTIR</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-black/10 space-y-4">
              <div>
                <h3 className="tracking-wider mb-2">DESCRIPCIÓN</h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  {product.description || "Vestido minimal de diseño elegante y atemporal. Confeccionado en algodón premium con corte moderno que se adapta perfectamente a tu silueta. Ideal para cualquier ocasión, desde eventos formales hasta salidas casuales."}
                </p>
              </div>

              <div>
                <h3 className="tracking-wider mb-2">DETALLES</h3>
                <ul className="text-sm opacity-70 space-y-1">
                  <li>• Material: {product.materials || "100% Algodón Premium"}</li>
                  <li>• Cuidado: Lavado a máquina en frío</li>
                  <li>• Origen: Diseñado en México</li>
                  <li>• Entrega: 3-5 días hábiles</li>
                </ul>
              </div>

              <div>
                <h3 className="tracking-wider mb-2">ENVÍO Y DEVOLUCIONES</h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  Envío gratuito en compras mayores a $1,500 MX. Devoluciones sin costo dentro
                  de los primeros 30 días.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
