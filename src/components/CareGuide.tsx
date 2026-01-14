import React from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Sun, Scissors, Sprout, Package } from 'lucide-react'
import { Header } from './Header'

export const CareGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bonsai Care Guide
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know to keep your bonsai thriving
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg text-gray-700 mb-12 text-center">
          Caring for your bonsai tree is essential to ensure its health and
          longevity. Follow these guidelines to help your miniature tree
          flourish.
        </p>

        {/* Care Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Watering Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Watering</h2>
            </div>
            <p className="text-gray-700">
              Water your bonsai when the topsoil feels dry. Avoid overwatering,
              as it can lead to root rot. Check soil moisture daily and adjust
              based on season and indoor conditions.
            </p>
          </div>

          {/* Lighting Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Lighting</h2>
            </div>
            <p className="text-gray-700">
              Place your bonsai in a location with plenty of indirect sunlight.
              Most bonsai species thrive with 4-6 hours of light daily. Rotate
              your tree weekly for even growth.
            </p>
          </div>

          {/* Pruning Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Scissors className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Pruning</h2>
            </div>
            <p className="text-gray-700">
              Regularly prune your bonsai to maintain its shape and encourage
              healthy growth. Use sharp, clean tools to avoid damaging the tree.
              Remove dead branches and trim new growth.
            </p>
          </div>

          {/* Fertilizing Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Sprout className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Fertilizing
              </h2>
            </div>
            <p className="text-gray-700">
              Feed your bonsai with a balanced fertilizer every 4-6 weeks during
              the growing season (spring and summer). Reduce feeding in fall and
              winter when growth slows.
            </p>
          </div>
        </div>

        {/* Repotting Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Repotting</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Repot your bonsai every 2-3 years to refresh the soil and provide
            more space for root growth. Spring is the best time for repotting,
            just before the growing season begins.
          </p>
          <div className="bg-green-50 border-l-4 border-green-600 p-4 mt-4">
            <p className="text-green-800 font-medium">
              Pro Tip: When repotting, trim about one-third of the root mass to
              encourage new, healthy root growth.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need supplies for your bonsai?
          </h3>
          <Link
            to="/"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Shop Our Collection
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CareGuide
