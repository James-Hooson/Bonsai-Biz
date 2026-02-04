import React from 'react'
import { Plus } from 'lucide-react'

interface AdminPanelProps {
  onAddProduct: () => void
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddProduct }) => {
  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-900">Admin Mode</h2>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
    </div>
  )
}
