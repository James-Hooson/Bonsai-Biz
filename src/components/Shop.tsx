import React, { useState, useEffect, useMemo } from 'react'
import { Star, Edit, Trash2 } from 'lucide-react'
import { Header } from './Header'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Link, useSearchParams } from 'react-router-dom'
import { ADMIN_EMAILS } from '../types'
import type { Product, CartItem, PageProps } from '../types'
import { AdminPanel } from './AdminPanel'
import { CartSidebar } from './CartSidebar'
import { ProductModal } from './ProductModal'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { Enso, Blossom } from './Ornaments'

export const Shop: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  isLoading,
  firebaseReady,
  onLogout,
}) => {
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [mainCategory, setMainCategory] = useState(urlCategory || 'all')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const allCategories: { value: string; label: string }[] = [
    { value: 'bonsai', label: 'Bonsai Trees' },
    { value: 'potted-plants', label: 'Potted Plants' },
    { value: 'aquatic-plants', label: 'Aquatic Plants' },
    { value: 'tanks', label: 'Tanks' },
  ]

  const usedCategoryValues = new Set(products.map((p) => p.mainCategory))
  const visibleCategories = [
    { value: 'all', label: 'All' },
    ...allCategories.filter((c) => usedCategoryValues.has(c.value)),
  ]

  useEffect(() => {
    setMainCategory(urlCategory || 'all')
  }, [urlCategory])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        const loadedProducts: Product[] = []
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()
          loadedProducts.push({
            id: docSnap.id,
            ...data,
            mainCategory: data.mainCategory || 'bonsai',
            stock: data.stock ?? 0,
            inStock: data.stock !== undefined ? data.stock > 0 : (data.inStock ?? true),
          } as Product)
        })
        setProducts(loadedProducts)
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Product Management
  const handleSaveProduct = async (product: Product) => {
    if (!firebaseReady) {
      alert('Admin session is still syncing. Please wait a moment and try again.')
      return
    }
    if (editingProduct) {
      // Update existing
      const { id, ...productData } = product
      await updateDoc(doc(db, 'products', product.id), productData)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p)),
      )
      setEditingProduct(null)
    } else {
      // Add new
      const { id, ...productData } = product
      const docRef = await addDoc(collection(db, 'products'), productData)
      setProducts((prev) => [...prev, { ...product, id: docRef.id }])
      setShowAddProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!firebaseReady) {
      alert('Admin session is still syncing. Please wait a moment and try again.')
      return
    }
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id))
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  // Cart functions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }

  const handleCheckout = async (deliveryMethod: 'pickup' | 'delivery', idempotencyKey: string) => {
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }))

    const response = await fetch(
      `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/createCheckoutSession`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          deliveryMethod,
          userEmail: user?.email,
          idempotencyKey,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create checkout session')
    }

    const { url } = await response.json()
    window.location.href = url
  }

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) => mainCategory === 'all' || p.mainCategory === mainCategory)
        .filter(
          (p) =>
            searchQuery === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    [products, mainCategory, searchQuery],
  )

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  // Check if user is admin
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email)
  React.useEffect(() => {
    if (isAdmin) {
      setShowAdminPanel(true)
    }
  }, [isAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Enso />
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
        cartItemCount={cartItemCount}
        onCartOpen={() => setCartOpen(true)}
        onSearchClick={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
      />
      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <AdminPanel onAddProduct={() => setShowAddProduct(true)} ready={firebaseReady} />
      )}

      <PageHero
        eyebrow="Zen Oasis · Living Collection"
        title={<>Cultivate<br />Tranquility</>}
        lede="Premium bonsai trees for every skill level"
      >
        <a href="#collection" className="btn-seal">
          Browse the Collection
        </a>
        <Link to="/care-guide" className="btn-ghost">
          Care Guide
        </Link>
      </PageHero>

      {/* Category Filter */}
      <div id="collection" className="max-w-page w-full mx-auto px-gutter pt-16 pb-10 scroll-mt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-rule pb-6">
          <div>
            <p className="eyebrow mb-3">The Collection</p>
            <h2 className="text-headline text-sumi">
              {visibleCategories.find((c) => c.value === mainCategory)?.label ?? 'All'}
              {mainCategory === 'all' && ' Specimens'}
            </h2>
          </div>
          <div
            role="group"
            aria-label="Filter by category"
            className="flex gap-1 overflow-x-auto -mx-1 px-1"
          >
            {visibleCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setMainCategory(cat.value)}
                aria-pressed={mainCategory === cat.value}
                className={`group flex items-center gap-2 px-4 py-2 whitespace-nowrap text-sm border transition duration-300 ease-ink ${
                  mainCategory === cat.value
                    ? 'bg-sumi text-washi border-sumi'
                    : 'border-transparent text-sumi-soft hover:border-rule hover:text-sumi'
                }`}
              >
                <Blossom
                  centre={false}
                  className={`w-3 h-3 transition-colors ${mainCategory === cat.value ? 'text-sakura' : 'text-rule group-hover:text-sakura-deep'}`}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-page w-full mx-auto px-gutter flex-1">
        {loading ? (
          <div className="py-20">
            <Enso label="Loading products…" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="font-display text-xl text-shu mb-6">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Blossom centre={false} className="w-12 h-12 mx-auto mb-4 text-rule" />
            <p className="font-display text-xl text-sumi-soft">Nothing matches — try another search or category.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredProducts.map((product, index) => (
            <article
              key={product.id}
              className="group flex flex-col animate-rise"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-washi-deep border border-rule p-2.5 transition duration-500 ease-ink group-hover:shadow-print group-hover:-translate-x-1 group-hover:-translate-y-1">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-700 ease-ink group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute top-5 left-5 bg-kinari/90 text-sumi text-[0.65rem] uppercase tracking-[0.2em] px-2 py-1">
                  {allCategories.find((c) => c.value === product.mainCategory)?.label ?? 'Bonsai Trees'}
                </span>
                {!product.inStock && (
                  <div className="absolute inset-2.5 bg-sumi/55 flex items-center justify-center">
                    <span className="border border-kinari/80 text-kinari text-xs uppercase tracking-[0.3em] px-4 py-2">
                      Out of Stock
                    </span>
                  </div>
                )}
                {showAdminPanel && isAdmin && (
                  <div className={`absolute top-5 right-5 flex gap-2 ${!firebaseReady ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => setEditingProduct(product)}
                      disabled={!firebaseReady}
                      aria-label={`Edit ${product.name}`}
                      className="bg-kinari p-2 shadow hover:bg-washi disabled:cursor-not-allowed"
                    >
                      <Edit aria-hidden="true" className="w-4 h-4 text-ai" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={!firebaseReady}
                      aria-label={`Delete ${product.name}`}
                      className="bg-kinari p-2 shadow hover:bg-washi disabled:cursor-not-allowed"
                    >
                      <Trash2 aria-hidden="true" className="w-4 h-4 text-shu" />
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-5 flex flex-col flex-1">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="text-title text-sumi">{product.name}</h3>
                  <span className="font-display text-xl font-bold text-shu whitespace-nowrap">
                    ${product.price}
                  </span>
                </div>
                <p className="text-sm text-sumi-soft mb-4 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-sumi-soft">
                    <Star aria-hidden="true" className="w-4 h-4 fill-yamabuki text-yamabuki" />
                    <span>
                      <span className="sr-only">Rated </span>
                      {product.rating}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="btn-primary px-5 py-2.5"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}
      </main>

      <Footer />

      {/* Edit/Add Product Modal */}
      {(editingProduct || showAddProduct) && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setEditingProduct(null)
            setShowAddProduct(false)
          }}
        />
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  )
}
