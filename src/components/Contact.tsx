import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Clock, Send } from 'lucide-react'
import { Header } from './Header'
import type { PageProps } from '../types'

export const Contact: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  onLogout,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in your name, email, and message.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/sendContactEmail`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      alert('Thank you for your message! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Failed to send contact message:', error)
      alert('Sorry, something went wrong sending your message. Please email us directly at zenoasisnz@gmail.com.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-shore">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      {/* Hero Section */}
      <section className="band-water py-16">
        <div className="max-w-page mx-auto px-gutter">
          <div className="text-center">
            <p className="eyebrow mb-3">Questions, Orders & Care</p>
            <h2 className="text-display font-bold text-ink-invert mb-4">
              Get in Touch
            </h2>
            <p className="text-lede text-ink-invert-soft">
              We're here to help with all your bonsai needs
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-page mx-auto px-gutter py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-paper rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-ink mb-6">
              Send us a Message
            </h3>
            <p className="text-ink-soft mb-6">
              We would love to hear from you! Whether you have questions about
              our bonsai trees, need assistance with your order, or just want to
              share your bonsai journey, fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-stone rounded-lg px-4 py-2 focus:ring-2 focus:ring-moss focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-stone rounded-lg px-4 py-2 focus:ring-2 focus:ring-moss focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full border border-stone rounded-lg px-4 py-2 focus:ring-2 focus:ring-moss focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full border border-stone rounded-lg px-4 py-2 focus:ring-2 focus:ring-moss focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-moss text-white py-3 rounded-lg hover:bg-moss-deep transition flex items-center justify-center gap-2 disabled:bg-stone disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-paper rounded-lg shadow-sm p-6 hover:shadow-lift transition">
              <div className="flex items-start gap-4">
                <div className="bg-moss/10 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-moss" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Email Us
                  </h3>
                  <p className="text-ink-soft mb-2">
                    For general inquiries, please email us at:
                  </p>

                  <a
                    href="mailto:zenoasisnz@gmail.com"
                    className="text-moss hover:text-moss-deep font-medium"
                  >
                    zenoasisnz@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-paper rounded-lg shadow-sm p-6 hover:shadow-lift transition">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Call Us
                  </h3>
                  <p className="text-ink-soft mb-2">
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
            <div className="bg-paper rounded-lg shadow-sm p-6 hover:shadow-lift transition">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Business Hours
                  </h3>
                  <p className="text-ink-soft">Monday - Friday</p>
                  <p className="text-ink font-medium">9:00 AM - 5:00 PM</p>
                  <p className="text-ink-soft text-sm mt-2">
                    Closed on weekends and holidays
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 band-water rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ink-invert mb-4 text-center">
            Frequently Asked Questions
          </h3>
          <p className="text-ink-invert-soft text-center mb-6">
            Need quick answers? Check out our Care Guide for detailed
            information about bonsai care and maintenance.
          </p>
          <div className="text-center">
            <Link
              to="/care-guide"
              className="inline-block bg-moss text-white px-8 py-3 rounded-lg hover:bg-moss-deep transition"
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
