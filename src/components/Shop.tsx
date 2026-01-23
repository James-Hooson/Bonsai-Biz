import React, { useState } from 'react'
import { X, Star, Edit, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Header } from './Header'

interface Product {
  id: number
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

interface AuthUser {
  email: string
  name: string
  isAdmin: boolean
}

export const Shop: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Hardcoded products, will need to cloudify for uploads
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Japanese Maple Bonsai',
      price: 89.99,
      image:
        'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.8,
      inStock: true,
      description:
        'Beautiful Japanese Maple with vibrant red foliage. Perfect for beginners.',
    },
    {
      id: 2,
      name: 'Juniper Bonsai Tree',
      price: 124.99,
      image:
        'https://images.unsplash.com/photo-1599598177991-ec67b5c37318?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'intermediate',
      rating: 4.9,
      inStock: true,
      description:
        'Classic juniper bonsai with traditional styling. Great for intermediate growers.',
    },
    {
      id: 3,
      name: 'Cherry Blossom Bonsai',
      price: 159.99,
      image:
        'https://images.unsplash.com/photo-1526397751294-331021109fbd?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'advanced',
      rating: 5.0,
      inStock: true,
      description:
        'Stunning cherry blossom that blooms in spring. Requires advanced care.',
    },
    {
      id: 4,
      name: 'Pine Bonsai',
      price: 99.99,
      image:
        'https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.7,
      inStock: true,
      description:
        'Hardy pine bonsai that thrives indoors and outdoors. Low maintenance.',
    },
    {
      id: 5,
      name: 'Pine Bonsai',
      price: 99.99,
      image:
        'https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.7,
      inStock: true,
      description:
        'Hardy pine bonsai that thrives indoors and outdoors. Low maintenance.',
    },
    {
      id: 6,
      name: 'Mimic Pine Bonsai',
      price: 99.99,
      image:
        'https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.7,
      inStock: false,
      description:
        'Hardy pine bonsai that thrives indoors and outdoors. Low maintenance.',
    },
    {
      id: 7,
      name: 'Pine Bonsai',
      price: 99.99,
      image:
        'https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.7,
      inStock: true,
      description:
        'Hardy pine bonsai that thrives indoors and outdoors. Low maintenance.',
    },
    {
      id: 8,
      name: 'Pine Bonsai',
      price: 99.99,
      image:
        'https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'beginner',
      rating: 4.7,
      inStock: true,
      description:
        'Hardy pine bonsai that thrives indoors and outdoors. Low maintenance.',
    },
  ])

  const categories = ['all', 'beginner', 'intermediate', 'advanced']

  // Simulated Auth0 login

  const handleLogin = () => {
    // In a real implementation, this would integrate with Auth0
    const mockUser: AuthUser = {
      email: 'admin@zenbonsai.com',
      name: 'Admin User',
      isAdmin: true, // In real app, this would come from Auth0 user metadata
    }
    setUser(mockUser)
    alert('Login successful! (In production, this would use Auth0)')
  }

  const handleLogout = () => {
    setUser(null)
    setShowAdminPanel(false)
    alert('Logged out successfully')
  }

  // Product Management
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      )
      setEditingProduct(null)
    } else {
      setProducts((prev) => [...prev, { ...product, id: Date.now() }])
      setShowAddProduct(false)
    }
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
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
            : item
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
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory)

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartItemCount={cartItemCount}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Admin Panel */}
      {showAdminPanel && user?.isAdmin && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {showAdminPanel && user?.isAdmin && (
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
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
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
          onImageUpload={handleImageUpload}
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
    setImageUrl: (url: string) => void
  ) => void
}> = ({ product, onSave, onClose, onImageUpload }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: 0,
      name: '',
      price: 0,
      image: '',
      category: 'beginner',
      rating: 5.0,
      inStock: true,
      description: '',
    }
  )

  const handleSubmit = () => {
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
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      onImageUpload(e, (url) =>
                        setFormData({ ...formData, image: url })
                      )
                    }
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>
                  <span className="text-sm text-gray-500">or</span>
                  <input
                    type="url"
                    placeholder="Enter image URL"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Product
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
