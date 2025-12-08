import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import { ExplorePage } from "./components/ExplorePage";
import { Footer } from "./components/Footer";
import { menProducts, womenProducts } from "./data/products";

type PageType = 'home' | 'stylist' | 'dashboard' | 'men' | 'women' | 'cart' | 'collection' | 'checkout' | 'receipt' | 'login' | 'register' | 'profile' | 'returns' | 'faq' | 'orders' | 'favorites' | 'explore';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check for admin URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <ProductGrid onNavigate={handleNavigate} />
          </>
        );
      case 'stylist':
        return <AIStylist />;
      case 'dashboard':
        // Protected Admin Route
        if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

        if (!isAuthenticated) {
          return <Login onNavigate={handleNavigate} redirectPage="dashboard" />;
        }

        if (user?.role !== 'admin') {
          // If logged in but not admin, redirect to home (or show unauthorized)
          // Using setTimeout to avoid render loop warning if we change state immediately
          setTimeout(() => {
            alert("Acceso denegado. Área exclusiva para administradores.");
            handleNavigate('home');
          }, 0);
          return null;
        }

        return <Dashboard onNavigate={handleNavigate} />;
      case 'men':
        return <CategoryPage title="HOMBRE" genderFilter="hombre" onNavigate={handleNavigate} />;
      case 'women':
        return <CategoryPage title="MUJER" genderFilter="mujer" onNavigate={handleNavigate} />;
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
      case 'explore':
        return <ExplorePage onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  return (
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

      {/* Footer - Show on all pages except dashboard */}
      {currentPage !== 'dashboard' && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
