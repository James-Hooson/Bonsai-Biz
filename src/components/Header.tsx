import React from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Leaf,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'

interface HeaderProps {
  user?: any | null
  onLogin?: () => void
  onLogout?: () => void
  cartItemCount?: number
  onCartOpen?: () => void
  isLoading?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  cartItemCount = 0,
  onCartOpen,
  isLoading,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const isAdmin =
    user?.['https://zenbonsai.com/roles']?.includes('admin') || false
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">ZenBonsai</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600">
              Shop
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600">
              About
            </Link>
            <Link
              to="/care-guide"
              className="text-gray-700 hover:text-green-600"
            >
              Care Guide
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-600">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-gray-700 hover:text-green-600">
              <Search className="w-6 h-6" />
            </button>

            {onCartOpen && (
              <button
                onClick={onCartOpen}
                className="relative text-gray-700 hover:text-green-600"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {!onCartOpen && (
              <Link to="/" className="text-gray-700 hover:text-green-600">
                <ShoppingCart className="w-6 h-6" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-green-600 flex items-center gap-1"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-gray-700 hover:text-green-600"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <>
                {onLogin ? (
                  <button
                    onClick={onLogin}
                    className="flex items-center gap-1 text-gray-700 hover:text-green-600"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="flex items-center gap-1 text-gray-700 hover:text-green-600"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 hover:text-green-600 py-2"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-green-600 py-2"
            >
              About
            </Link>
            <Link
              to="/care-guide"
              className="block text-gray-700 hover:text-green-600 py-2"
            >
              Care Guide
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-green-600 py-2"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
