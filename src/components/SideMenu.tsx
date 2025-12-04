import { X, Home, Sparkles, ShoppingBag, User, Package, LogOut, LogIn, HelpCircle, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export function SideMenu({ isOpen, onClose, onNavigate }: SideMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    onNavigate('home');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-2xl transform transition-transform">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl tracking-[0.3em]">MODAIX</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          <div className="p-6 space-y-1">
            {/* Principal Navigation */}
            <button
              onClick={() => handleNavigation('home')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">INICIO</span>
            </button>

            {/* AI Stylist - Destacado */}
            <button
              onClick={() => handleNavigation('stylist')}
              className="w-full flex items-center gap-3 p-3 bg-black text-white hover:bg-black/90 transition-colors rounded text-left"
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">AI STYLIST</span>
            </button>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="h-px bg-black/10"></div>
            </div>
            <p className="text-xs tracking-wider opacity-60 px-3 pb-2">COMPRAR</p>

            {/* Categories */}
            <button
              onClick={() => handleNavigation('men')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">👔</div>
              <span className="tracking-wider text-sm">HOMBRE</span>
            </button>

            <button
              onClick={() => handleNavigation('women')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">👗</div>
              <span className="tracking-wider text-sm">MUJER</span>
            </button>

            <button
              onClick={() => handleNavigation('collection')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">✨</div>
              <span className="tracking-wider text-sm">COLECCIÓN 2025</span>
            </button>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="h-px bg-black/10"></div>
            </div>
            <p className="text-xs tracking-wider opacity-60 px-3 pb-2">MI CUENTA</p>

            {/* Account Options */}
            {!isAuthenticated ? (
              <button
                onClick={() => handleNavigation('login')}
                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="tracking-wider text-sm">INICIAR SESIÓN</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('profile')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span className="tracking-wider text-sm">MI PERFIL</span>
                </button>

                <button
                  onClick={() => handleNavigation('orders')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <span className="tracking-wider text-sm">MIS PEDIDOS</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleNavigation('cart')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">MI CARRITO</span>
              {itemCount > 0 && (
                <span className="ml-auto bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="h-px bg-black/10"></div>
            </div>
            <p className="text-xs tracking-wider opacity-60 px-3 pb-2">AYUDA</p>

            <button
              onClick={() => handleNavigation('returns')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <RotateCcw className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">DEVOLUCIONES</span>
            </button>

            <button
              onClick={() => handleNavigation('faq')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">PREGUNTAS FRECUENTES</span>
            </button>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="h-px bg-black/10"></div>
            </div>
            <p className="text-xs tracking-wider opacity-60 px-3 pb-2">ADMINISTRACIÓN</p>

            <button
              onClick={() => handleNavigation('dashboard')}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 transition-colors rounded text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">📊</div>
              <span className="tracking-wider text-sm">DASHBOARD ADMIN</span>
            </button>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        {isAuthenticated && (
          <div className="absolute bottom-0 inset-x-0 p-6 border-t border-black/10 bg-white">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-3 border border-red-600 text-red-600 hover:bg-red-50 transition-colors rounded"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wider text-sm">CERRAR SESIÓN</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
