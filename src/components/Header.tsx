import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onAuthClick: () => void;
  onCartClick: () => void;
  onNavigate: (page: 'shop' | 'orders' | 'admin') => void;
  currentPage: string;
}

export default function Header({ onAuthClick, onCartClick, onNavigate, currentPage }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

  return (
    <header className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-4xl">🍌</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Banana Threads</h1>
              <p className="text-xs text-gray-700">Top Banana Fashion</p>
            </div>
          </button>

          <nav className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('shop')}
              className={`text-gray-800 hover:text-gray-900 font-medium transition-colors ${
                currentPage === 'shop' ? 'border-b-2 border-gray-800' : ''
              }`}
            >
              Shop
            </button>

            {user && (
              <button
                onClick={() => onNavigate('orders')}
                className={`text-gray-800 hover:text-gray-900 font-medium transition-colors ${
                  currentPage === 'orders' ? 'border-b-2 border-gray-800' : ''
                }`}
              >
                My Orders
              </button>
            )}

            {user && profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1 text-gray-800 hover:text-gray-900 font-medium transition-colors ${
                  currentPage === 'admin' ? 'border-b-2 border-gray-800' : ''
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-yellow-300 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-800 font-medium">
                  {profile?.full_name || 'User'}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 hover:bg-yellow-300 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6 text-gray-800" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-gray-800 text-yellow-400 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
