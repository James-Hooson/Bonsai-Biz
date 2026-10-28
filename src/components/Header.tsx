import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import type { User } from '@auth0/auth0-spa-js'
import { ADMIN_EMAILS } from '../types'
import { Seal, Blossom } from './Ornaments'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 text-sm tracking-[0.08em] transition-colors after:absolute after:left-1/2 after:-bottom-0.5 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-shu after:transition-opacity ${
    isActive ? 'text-sumi after:opacity-100' : 'text-sumi-soft hover:text-shu after:opacity-0'
  }`

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-between py-3 border-b border-rule font-display text-xl ${
    isActive ? 'text-shu' : 'text-sumi hover:text-shu'
  }`

interface HeaderProps {
  user?: User | null
  onLogout?: () => void
  cartItemCount?: number
  onCartOpen?: () => void
  onSearchClick?: () => void
  searchOpen?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  cartItemCount = 0,
  onCartOpen,
  onSearchClick,
  searchOpen = false,
  searchQuery = '',
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [shopDropdownOpen, setShopDropdownOpen] = React.useState(false)
  const shopDropdownRef = React.useRef<HTMLDivElement>(null)
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email)

  const closeShopDropdownOnBlur = (e: React.FocusEvent) => {
    if (!shopDropdownRef.current?.contains(e.relatedTarget as Node)) {
      setShopDropdownOpen(false)
    }
  }
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-washi/85 backdrop-blur-md">
      <div role="note" className="bg-ai px-gutter py-2 text-center text-xs sm:text-sm tracking-[0.04em] text-on-ai">
        <span className="font-medium text-on-ai">Demo site:</span>{' '}
        <span className="text-on-ai-soft">this store is not currently functional and products shown are not for sale.</span>
      </div>
      <div className="max-w-page mx-auto px-gutter">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="group flex items-center gap-3" aria-label="Zen Oasis — home">
            <Seal className="w-10 h-10 transition-transform duration-500 ease-ink group-hover:-rotate-6" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-sumi">Zen Oasis</span>
              <span className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-sumi-soft">
                Bonsai &amp; Aquascape
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-8">
            <div
              ref={shopDropdownRef}
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
              onBlur={closeShopDropdownOnBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShopDropdownOpen(false)
              }}
            >
              <div className="flex items-center gap-1">
                <NavLink to="/" end className={navLinkClass}>
                  Shop
                </NavLink>
                <button
                  type="button"
                  aria-expanded={shopDropdownOpen}
                  aria-haspopup="true"
                  aria-controls="shop-dropdown-menu"
                  aria-label="Toggle shop categories"
                  onClick={() => setShopDropdownOpen((prev) => !prev)}
                  onFocus={() => setShopDropdownOpen(true)}
                  className="text-sumi-soft hover:text-shu"
                >
                  <svg
                    aria-hidden="true"
                    className={`w-4 h-4 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {shopDropdownOpen && (
                <div
                  id="shop-dropdown-menu"
                  role="menu"
                  className="absolute top-full -left-4 w-56 card-washi shadow-lift py-2 z-50 border-t-2 border-t-shu"
                >
                  <Link
                    to="/?category=bonsai"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Bonsai
                  </Link>
                  <Link
                    to="/?category=potted-plants"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Potted Plants
                  </Link>
                  <Link
                    to="/?category=aquatic-plants"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Aquatic Plants
                  </Link>
                  <Link
                    to="/?category=tanks"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Tanks
                  </Link>
                  <Link
                    to="/?category=aquascaping"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    Aquascaping
                  </Link>
                  <div className="border-t border-rule my-1 mx-5"></div>
                  <Link
                    to="/"
                    role="menuitem"
                    className="block px-5 py-2 text-sm text-sumi-soft hover:bg-washi hover:text-shu transition-colors"
                    onClick={() => setShopDropdownOpen(false)}
                  >
                    All Products
                  </Link>
                </div>
              )}
            </div>
            <NavLink
              to="/care-guide"
              className={navLinkClass}
            >
              Care Guide
            </NavLink>
            <NavLink
              to="/aquascaping"
              className={navLinkClass}
            >
              Aquascaping
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {/* Search Section */}
            <div className="flex items-center gap-2">
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search..."
                  aria-label="Search products"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="field w-40 sm:w-64 bg-transparent"
                  autoFocus
                />
              )}
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  aria-expanded={searchOpen}
                  aria-label={searchOpen ? 'Close search' : 'Open search'}
                  className="text-sumi-soft hover:text-shu"
                >
                  <Search aria-hidden="true" className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Cart Button */}
            {onCartOpen && (
              <button
                onClick={onCartOpen}
                aria-label={`Open cart${cartItemCount > 0 ? ` (${cartItemCount} item${cartItemCount === 1 ? '' : 's'})` : ''}`}
                className="relative text-sumi-soft hover:text-shu"
              >
                <ShoppingCart aria-hidden="true" className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-shu text-kinari text-[0.65rem] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {!onCartOpen && (
              <Link to="/" aria-label="Go to shop" className="text-sumi-soft hover:text-shu">
                <ShoppingCart aria-hidden="true" className="w-6 h-6" />
              </Link>
            )}

            {/* Admin Section */}
            {user && isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  aria-label="Admin"
                  className="text-sumi-soft hover:text-shu flex items-center gap-1"
                >
                  <UserIcon aria-hidden="true" className="w-5 h-5" />
                  <span className="hidden sm:inline" aria-hidden="true">Admin</span>
                </Link>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    aria-label="Log out"
                    className="text-sumi-soft hover:text-shu"
                  >
                    <LogOut aria-hidden="true" className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden text-sumi"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" className="w-6 h-6" />
              ) : (
                <Menu aria-hidden="true" className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-rule bg-washi">
          <nav aria-label="Mobile" className="px-gutter pt-2 pb-6">
            {[
              { to: '/', label: 'Shop' },
              { to: '/care-guide', label: 'Care Guide' },
              { to: '/aquascaping', label: 'Aquascaping' },
              { to: '/contact', label: 'Contact' },
              { to: '/about', label: 'About' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={mobileLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
                <Blossom centre={false} className="w-3.5 h-3.5 text-rule" />
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
