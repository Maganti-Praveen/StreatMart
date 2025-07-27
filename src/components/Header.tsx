import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">
              Street<span className="text-orange-500">Supply</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to={user.role === 'vendor' ? '/vendor' : '/supplier'}
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'vendor' && (
                  <Link
                    to="/materials"
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Browse Materials
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Orders
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome,</span>
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button className="md:hidden p-2 text-gray-400 hover:text-gray-500">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}