import React, { useState, useEffect } from 'react'
import { X, Star, Edit, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Header } from './Header'
import { useAuth0 } from '@auth0/auth0-react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
  description: string
}

interface CartItem extends Product {
  quantity: number
}

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
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => {
    const loadProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'))
      const loadedProducts: Product[] = []
      querySnapshot.forEach((docSnap) => {
        loadedProducts.push({ id: docSnap.id, ...docSnap.data() } as Product)
      })
      setProducts(loadedProducts)
    }
    loadProducts()
  }, [])
  const categories = ['all', 'beginner', 'intermediate', 'advanced']

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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: (url: string) => void,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setImageUrl(downloadURL)
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

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }

  const filteredProducts = products
    .filter(
      (p) => selectedCategory === 'all' || p.category === selectedCategory,
    )
    .filter(
      (p) =>
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
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
        isLoading={isLoading}
        onSearchClick={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
      />
      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-900">
                Admin Mode
              </h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>
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

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
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
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-green-600 font-bold">
                          ${item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Product Modal Component
export const ProductModal: React.FC<{
  product: Product | null
  onSave: (product: Product) => void
  onClose: () => void
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: (url: string) => void,
  ) => void
}> = ({ product, onSave, onClose, onImageUpload }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      name: '',
      price: 0,
      image: '',
      category: 'beginner',
      rating: 5.0,
      inStock: true,
      description: '',
    },
  )

  const handleSubmit = () => {
    if (formData.image === 'uploading...') {
      alert('Please wait for the image to finish uploading')
      return
    }
    if (!formData.name || !formData.description || !formData.image) {
      alert('Please fill in all required fields')
      return
    }

    onSave(formData)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Status
                </label>
                <select
                  value={formData.inStock ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inStock: e.target.value === 'true',
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Product Image
              </label>
              <div className="space-y-2">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Show loading state
                        setFormData({ ...formData, image: 'uploading...' })
                        try {
                          // Upload to Firebase Storage
                          const storageRef = ref(
                            storage,
                            `products/${Date.now()}_${file.name}`,
                          )
                          await uploadBytes(storageRef, file)
                          const downloadURL = await getDownloadURL(storageRef)
                          setFormData({ ...formData, image: downloadURL })
                        } catch (error) {
                          console.error('Upload error:', error)
                          alert('Failed to upload image')
                          setFormData({ ...formData, image: '' })
                        }
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <Upload className="w-4 h-4" />
                    {formData.image === 'uploading...'
                      ? 'Uploading...'
                      : 'Upload Image'}
                  </label>
                  <span className="text-sm text-gray-500 text-center">or</span>
                  <input
                    type="url"
                    placeholder="Enter image URL"
                    value={
                      formData.image === 'uploading...' ? '' : formData.image
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                    disabled={formData.image === 'uploading...'}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={formData.image === 'uploading...'}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {formData.image === 'uploading...'
                  ? 'Uploading Image...'
                  : 'Save Product'}
              </button>
              <button
                onClick={onClose}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
