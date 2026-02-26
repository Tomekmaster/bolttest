import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import ProductCatalog from './components/ProductCatalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import OrderHistory from './components/OrderHistory';

function App() {
  const [currentPage, setCurrentPage] = useState<'shop' | 'orders' | 'admin'>('shop');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
          <Header
            onAuthClick={() => setShowAuthModal(true)}
            onCartClick={() => setShowCart(true)}
            onNavigate={setCurrentPage}
            currentPage={currentPage}
          />

          <main>
            {currentPage === 'shop' && <ProductCatalog />}
            {currentPage === 'orders' && <OrderHistory />}
            {currentPage === 'admin' && <AdminDashboard />}
          </main>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />

          <Cart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            onCheckout={handleCheckout}
          />

          <Checkout
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
          />

          <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-2xl mb-2">🍌 Banana Threads</p>
              <p className="text-gray-400 text-sm">
                Top Banana Fashion - Making the world more appeeling since 2024
              </p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
