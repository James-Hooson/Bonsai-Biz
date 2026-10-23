import React, { useState } from 'react'
import { X, Save, Upload } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import type { Product } from '../types'

export const ProductModal: React.FC<{
  product: Product | null
  onSave: (product: Product) => void
  onClose: () => void
}> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      name: '',
      price: 0,
      image: '',
      mainCategory: 'bonsai',
      rating: 5.0,
      inStock: true,
      stock: 0,
      description: '',
    },
  )
  const [uploading, setUploading] = useState(false)
  const MAX_FILE_SIZE_MB = 5

  const handleSubmit = () => {
    if (uploading) {
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
        className="fixed inset-0 bg-ai-deep/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="bg-washi border-t-4 border-shu shadow-lift max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-rule flex items-center justify-between">
            <h2 id="product-modal-title" className="font-display text-2xl text-sumi">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} aria-label="Close" className="text-sumi-soft hover:text-shu">
              <X aria-hidden="true" className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="field-label">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="field"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="field-label">
                Category
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) =>
                  setFormData({ ...formData, mainCategory: e.target.value })
                }
                className="field"
              >
                <option value="bonsai">Bonsai</option>
                <option value="potted-plants">Potted Plants</option>
                <option value="aquatic-plants">Aquatic Plants</option>
                <option value="tanks">Tanks</option>
              </select>
            </div>

            <div>
              <label className="field-label">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="field"
                rows={3}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">
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
                  className="field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="field-label">Rating</label>
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
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="field-label">
                Stock Count
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => {
                  const stock = Math.max(0, parseInt(e.target.value) || 0)
                  setFormData({ ...formData, stock, inStock: stock > 0 })
                }}
                className="field"
              />
            </div>

            <div>
              <label className="field-label">
                Product Image
              </label>
              <div className="space-y-2">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover border border-rule bg-kinari p-1"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                          alert(`File size must be under ${MAX_FILE_SIZE_MB}MB`)
                          return
                        }
                        setUploading(true)
                        try {
                          const storageRef = ref(
                            storage,
                            `products/${crypto.randomUUID()}_${file.name}`,
                          )
                          await uploadBytes(storageRef, file)
                          const downloadURL = await getDownloadURL(storageRef)
                          setFormData({ ...formData, image: downloadURL })
                        } catch {
                          alert('Failed to upload image')
                          setFormData({ ...formData, image: '' })
                        } finally {
                          setUploading(false)
                        }
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn-ghost cursor-pointer self-start"
                  >
                    <Upload aria-hidden="true" className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <span className="text-xs uppercase tracking-[0.2em] text-nezumi">or</span>
                  <input
                    type="url"
                    placeholder="Enter image URL"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="field"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="btn-primary flex-1"
              >
                <Save aria-hidden="true" className="w-4 h-4" />
                {uploading ? 'Uploading Image...' : 'Save Product'}
              </button>
              <button
                onClick={onClose}
                className="btn-ghost"
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
