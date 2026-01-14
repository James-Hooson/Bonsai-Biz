import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, Award } from 'lucide-react'
import { Header } from './Header'

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About ZenBonsai
            </h2>
            <p className="text-xl text-gray-600">
              Bringing the ancient art of bonsai to enthusiasts worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Statement */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              ZenBonsai is your premier destination for high-quality bonsai
              trees and accessories. Our mission is to bring the ancient art of
              bonsai to enthusiasts around the world, making this timeless
              practice accessible to everyone from beginners to masters.
            </p>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Quality */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Premium Quality
            </h3>
            <p className="text-gray-700">
              We source only the finest bonsai trees and materials, ensuring
              every piece meets our high standards.
            </p>
          </div>

          {/* Expertise */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Expert Guidance
            </h3>
            <p className="text-gray-700">
              Our team of bonsai experts provides comprehensive care guides and
              personalized support.
            </p>
          </div>

          {/* Passion */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Passionate Community
            </h3>
            <p className="text-gray-700">
              Join a growing community of bonsai lovers sharing knowledge, tips,
              and inspiration.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Story
              </h3>
              <p className="text-gray-700 mb-4">
                Founded in 2023, ZenBonsai began with a simple vision: to make
                the art of bonsai accessible to everyone. What started as a
                small collection has grown into a comprehensive marketplace
                offering trees for every skill level.
              </p>
              <p className="text-gray-700 mb-4">
                We specialize in providing premium bonsai trees, care guides,
                and educational resources that empower our customers to
                cultivate their own miniature masterpieces.
              </p>
              <p className="text-gray-700">
                Today, we're proud to serve thousands of bonsai enthusiasts,
                helping them discover the meditative joy and artistic expression
                that comes with nurturing these living sculptures.
              </p>
            </div>
            <div className="relative h-64 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Beautiful bonsai tree"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2023</div>
              <div className="text-green-100">Founded</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Trees Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Tree Varieties</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to start your bonsai journey?
          </h3>
          <p className="text-gray-700 mb-6">
            Explore our collection and find the perfect tree for you.
          </p>
          <Link
            to="/"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Browse Our Collection
          </Link>
        </div>
      </div>
    </div>
  )
}

export default About
