import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Header } from './Header'
interface PageProps {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
}
export const Contact: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  isLoading,
  onLogin,
  onLogout,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={isAuthenticated ? user : null}
        onLogin={onLogin}
        onLogout={onLogout}
        isLoading={isLoading}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              We're here to help with all your bonsai needs
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h3>
            <p className="text-gray-700 mb-6">
              We would love to hear from you! Whether you have questions about
              our bonsai trees, need assistance with your order, or just want to
              share your bonsai journey, fill out the form below.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Email Us
                  </h3>
                  <p className="text-gray-700 mb-2">
                    For general inquiries, please email us at:
                  </p>

                  <a
                    href="mailto:support@zenbonsai.com"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    support@zenbonsai.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Call Us
                  </h3>
                  <p className="text-gray-700 mb-2">
                    You can reach us by phone at:
                  </p>

                  <a
                    href="tel:+11234567890"
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                  >
                    (123) 456-7890
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Business Hours
                  </h3>
                  <p className="text-gray-700">Monday - Friday</p>
                  <p className="text-gray-900 font-medium">9:00 AM - 5:00 PM</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Closed on weekends and holidays
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Visit Our Store
                  </h3>
                  <p className="text-gray-700 mb-1">123 Bonsai Lane</p>
                  <p className="text-gray-700 mb-1">Green City, GC 12345</p>

                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-medium inline-block mt-2"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h3>
          <p className="text-gray-700 text-center mb-6">
            Need quick answers? Check out our Care Guide for detailed
            information about bonsai care and maintenance.
          </p>
          <div className="text-center">
            <Link
              to="/care-guide"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Visit Care Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
