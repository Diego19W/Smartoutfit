import { Menu, Search, User, ShoppingBag, X, LogOut, Settings, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onMenuToggle: () => void;
}

export function Header({ onNavigate, currentPage, onMenuToggle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Left - Menu */}
          <button className="p-2 hover:bg-black/5 rounded-md transition-colors" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Center - Logo */}
          {/* Center - Logo */}
          <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
            <button
              onClick={() => onNavigate('home')}
              className="pointer-events-auto"
            >
              <h1 className="text-sm sm:text-xl md:text-2xl tracking-[0.3em]">SMARTOUTFIT</h1>
            </button>
          </div>

          {/* Right - Icons */}
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <div className="absolute inset-0 z-50 bg-white flex items-center px-4 sm:static sm:z-auto sm:bg-transparent sm:flex sm:border sm:border-black sm:px-3 sm:py-1.5 sm:w-auto">
                <Search className="w-4 h-4 opacity-40 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="outline-none text-sm tracking-wider placeholder:opacity-40 flex-1 sm:w-48 sm:flex-none"
                  autoFocus
                />
                <button
                  className="p-1 hover:bg-black/5 rounded-md transition-colors ml-2"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button className="hover:opacity-70 transition-opacity" onClick={() => onNavigate('explore')}>
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            )}
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => isAuthenticated ? setUserMenuOpen(!userMenuOpen) : onNavigate('login')}
                className="p-2 hover:bg-black/5 rounded-md transition-colors flex items-center gap-2 relative z-10"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown */}
              {isAuthenticated && userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-black/10 shadow-lg rounded-md overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-sm font-medium">{user?.nombre}</p>
                    <p className="text-xs text-neutral-500 truncate mb-1">{user?.email}</p>
                    <p className="text-xs font-medium text-black/70 bg-neutral-100 inline-block px-2 py-0.5 rounded">
                      {user?.puntos || 0} Puntos
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('orders');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Mis Pedidos
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      onNavigate('home');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="p-2 hover:bg-black/5 rounded-md transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white rounded-full text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center gap-8 py-4 border-t border-black/5">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm tracking-wider hover:opacity-70 transition-opacity ${currentPage === 'home' ? 'opacity-100' : 'opacity-50'}`}
          >
            INICIO
          </button>
          <button
            onClick={() => onNavigate('stylist')}
            className={`text-sm tracking-wider hover:opacity-70 transition-opacity ${currentPage === 'stylist' ? 'opacity-100' : 'opacity-50'}`}
          >
            AI STYLIST
          </button>
          <button
            onClick={() => onNavigate('men')}
            className={`text-sm tracking-wider hover:opacity-70 transition-opacity ${currentPage === 'men' ? 'opacity-100' : 'opacity-50'}`}
          >
            HOMBRE
          </button>
          <button
            onClick={() => onNavigate('women')}
            className={`text-sm tracking-wider hover:opacity-70 transition-opacity ${currentPage === 'women' ? 'opacity-100' : 'opacity-50'}`}
          >
            MUJER
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`text-sm tracking-wider hover:opacity-70 transition-opacity ${currentPage === 'explore' ? 'opacity-100' : 'opacity-50'}`}
          >
            EXPLORAR
          </button>

        </nav>
      </div>
    </header>
  );
}