import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { AIStylist } from "./components/AIStylist";
import { Dashboard } from "./components/Dashboard";
import { CategoryPage } from "./components/CategoryPage";
import { Cart } from "./components/Cart";
import { Collection2025 } from "./components/Collection2025";
import { Checkout } from "./components/Checkout";
import { Receipt } from "./components/Receipt";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Profile } from "./components/Profile";
import { Returns } from "./components/Returns";
import { FAQ } from "./components/FAQ";
import { SideMenu } from "./components/SideMenu";
import { MyOrders } from "./components/MyOrders";
import { FavoritesPage } from "./components/FavoritesPage";
import { menProducts, womenProducts } from "./data/products";

type PageType = 'home' | 'stylist' | 'dashboard' | 'men' | 'women' | 'cart' | 'collection' | 'checkout' | 'receipt' | 'login' | 'register' | 'profile' | 'returns' | 'faq' | 'orders' | 'favorites';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <ProductGrid />

            {/* Footer */}
            <footer className="bg-black text-white py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div>
                    <h3 className="text-2xl tracking-[0.3em] mb-6">MODAIX</h3>
                    <p className="text-sm opacity-70 leading-relaxed">
                      Elegancia redefinida para el mundo moderno.
                    </p>
                  </div>

                  <div>
                    <h4 className="tracking-wider mb-4 text-sm">COMPRAR</h4>
                    <ul className="space-y-2 text-sm opacity-70">
                      <li><button onClick={() => setCurrentPage('men')} className="hover:opacity-100 transition-opacity">Hombre</button></li>
                      <li><button onClick={() => setCurrentPage('women')} className="hover:opacity-100 transition-opacity">Mujer</button></li>
                      <li><button onClick={() => setCurrentPage('collection')} className="hover:opacity-100 transition-opacity">Nueva Colección</button></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="tracking-wider mb-4 text-sm">AYUDA</h4>
                    <ul className="space-y-2 text-sm opacity-70">
                      <li><button className="hover:opacity-100 transition-opacity">Contacto</button></li>
                      <li><button onClick={() => setCurrentPage('returns')} className="hover:opacity-100 transition-opacity">Devoluciones</button></li>
                      <li><button onClick={() => setCurrentPage('faq')} className="hover:opacity-100 transition-opacity">FAQ</button></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="tracking-wider mb-4 text-sm">NEWSLETTER</h4>
                    <p className="text-sm opacity-70 mb-4">
                      Recibe las últimas novedades
                    </p>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Email"
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white outline-none"
                      />
                      <button className="px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors">
                        →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm opacity-70">
                  <p>© 2025 MODAIX. Todos los derechos reservados.</p>
                </div>
              </div>
            </footer>
          </>
        );
      case 'stylist':
        return <AIStylist />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'men':
        return <CategoryPage title="HOMBRE" genderFilter="hombre" />;
      case 'women':
        return <CategoryPage title="MUJER" genderFilter="mujer" />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'collection':
        return <Collection2025 />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'receipt':
        return <Receipt onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'orders':
        return <MyOrders onNavigate={handleNavigate} />;
      case 'returns':
        return <Returns onNavigate={handleNavigate} />;
      case 'faq':
        return <FAQ onNavigate={handleNavigate} />;
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <div className="min-h-screen bg-white">
            {/* Header - Show on all pages except login/register/checkout/receipt */}
            {!['login', 'register', 'checkout', 'receipt'].includes(currentPage) && (
              <Header
                onNavigate={handleNavigate}
                currentPage={currentPage}
                onMenuToggle={() => setIsMenuOpen(true)}
              />
            )}

            {/* Side Menu */}
            <SideMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onNavigate={(page) => {
                handleNavigate(page);
                setIsMenuOpen(false);
              }}
            />

            {/* Main Content */}
            <main>
              {renderPage()}
            </main>
          </div>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
