import React, { useState, useEffect } from 'react'
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
import { useSearchParams } from 'react-router-dom'
import type { Product, CartItem } from '../types'
import { AdminPanel } from './AdminPanel'
import { CartSidebar } from './CartSidebar'
import { ProductModal } from './ProductModal'

interface ShopProps {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
}

export const Shop: React.FC<ShopProps> = ({
  user,
  isAuthenticated,
  isLoading,
  onLogin,
  onLogout,
}) => {
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [mainCategory, setMainCategory] = useState(urlCategory || 'all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const skillLevels = ['all', 'beginner', 'intermediate', 'advanced']

  React.useEffect(() => {
  if (urlCategory) {
    setMainCategory(urlCategory)
  }
}, [urlCategory])
  useEffect(() => {
    const loadProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'))
      const loadedProducts: Product[] = []
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        loadedProducts.push({
          id: docSnap.id,
          ...data,
          mainCategory: data.mainCategory || 'bonsai',
          skillLevel: data.skillLevel || data.category || 'beginner',
        } as Product)
      })
      setProducts(loadedProducts)
    }
    loadProducts()
  }, [])

  // Product Management
  const handleSaveProduct = async (product: Product) => {
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

  const filteredProducts = products
    .filter((p) => mainCategory === 'all' || p.mainCategory === mainCategory)
    .filter(
      (p) => selectedCategory === 'all' || p.skillLevel === selectedCategory,
    )
    .filter(
      (p) =>
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Check if user is admin
  const isAdmin =
    user?.['https://zenbonsai.com/roles']?.includes('admin') || false
  React.useEffect(() => {
    if (isAdmin) {
      setShowAdminPanel(true)
    }
  }, [isAdmin])

  // Auth Loading state, maybe change to add something fun liek as bonsai tree swaying
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        user={isAuthenticated ? user : null}
        onLogin={onLogin}
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
        <AdminPanel onAddProduct={() => setShowAddProduct(true)} />
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cultivate Tranquility
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Premium bonsai trees for every skill level
            </p>
          </div>
        </div>
      </section>

      {/* Skill Level Filter */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <p className="text-sm text-gray-600 text-center mb-2">Filter by skill level:</p>
  <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
   {skillLevels.map((level) => (
  <button
    key={level}
    onClick={() => setSelectedCategory(level)}
    className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
      selectedCategory === level
        ? 'bg-green-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {level.charAt(0).toUpperCase() + level.slice(1)}
  </button>
))}
</div>
</div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute bottom-0 left-0 right-0 bg-green-500/50 text-white text-center py-2">
                    <span className="text-sm font-semibold">Out of Stock</span>
                  </div>
                )}
                {showAdminPanel && isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                {' '}
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {' '}
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {' '}
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />{' '}
                  <span className="text-sm text-gray-600">
                    {' '}
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {' '}
                    ${product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
        />
      )}
    </div>
  )
}
