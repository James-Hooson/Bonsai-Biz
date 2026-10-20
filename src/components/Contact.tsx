import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Clock, Send, HelpCircle } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { Seal } from './Ornaments'
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

  const fields = [
    { key: 'name', label: 'Your Name', type: 'text', required: true, autoComplete: 'name', placeholder: 'John Doe' },
    { key: 'email', label: 'Email Address', type: 'email', required: true, autoComplete: 'email', placeholder: 'you@example.com' },
    { key: 'subject', label: 'Subject', type: 'text', required: false, autoComplete: 'off', placeholder: 'How can we help?' },
  ] as const

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      <PageHero
        eyebrow="Questions, Orders & Care"
        title="Get in Touch"
        lede="We're here to help with all your bonsai needs"
      />

      <main className="flex-1 max-w-page w-full mx-auto px-gutter pt-20">
        <div className="grid gap-16 lg:grid-cols-[3fr_2fr]">
          {/* Contact Form */}
          <section className="card-washi p-8 md:p-12 relative">
            <span aria-hidden="true" className="absolute top-0 left-8 right-8 h-0.5 bg-shu" />
            <h2 className="text-headline text-sumi mb-4">Send us a Message</h2>
            <p className="text-sumi-soft mb-10">
              We would love to hear from you! Whether you have questions about
              our bonsai trees, need assistance with your order, or just want to
              share your bonsai journey, fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key} className={f.key === 'subject' ? 'sm:col-span-2' : ''}>
                    <label htmlFor={`contact-${f.key}`} className="field-label">
                      {f.label}
                    </label>
                    <input
                      id={`contact-${f.key}`}
                      type={f.type}
                      required={f.required}
                      autoComplete={f.autoComplete}
                      value={formData[f.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.key]: e.target.value })
                      }
                      className="field"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="field resize-y"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-seal w-full sm:w-auto"
              >
                <Send aria-hidden="true" className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </section>

          {/* Contact Information */}
          <aside className="space-y-0 divide-y divide-rule border-y border-rule self-start">
            <div className="flex items-start gap-5 py-8">
              <span className="icon-tile shrink-0">
                <Mail aria-hidden="true" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-title text-sumi mb-1">Email Us</h3>
                <p className="text-sumi-soft text-sm mb-2">
                  For general inquiries, please email us at:
                </p>
                <a
                  href="mailto:zenoasisnz@gmail.com"
                  className="text-shu hover:text-shu-deep font-medium underline decoration-shu/30 underline-offset-4 break-all"
                >
                  zenoasisnz@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5 py-8">
              <span className="icon-tile shrink-0">
                <Phone aria-hidden="true" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-title text-sumi mb-1">Call Us</h3>
                <p className="text-sumi-soft text-sm mb-2">
                  You can reach us by phone at:
                </p>
                <a
                  href="tel:+11234567890"
                  className="font-display text-xl text-sumi hover:text-shu"
                >
                  (123) 456-7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5 py-8">
              <span className="icon-tile shrink-0">
                <Clock aria-hidden="true" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-title text-sumi mb-1">Business Hours</h3>
                <p className="text-sumi-soft">Monday - Friday</p>
                <p className="font-display text-xl text-sumi">9:00 AM - 5:00 PM</p>
                <p className="text-nezumi text-sm mt-2">
                  Closed on weekends and holidays
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-20 band-ai p-10 md:p-14 grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <Seal className="w-14 h-14">
            <HelpCircle className="w-7 h-7" />
          </Seal>
          <div>
            <h2 className="text-headline text-on-ai mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-on-ai-soft">
              Need quick answers? Check out our Care Guide for detailed
              information about bonsai care and maintenance.
            </p>
          </div>
          <Link to="/care-guide" className="btn-ghost">
            Visit Care Guide
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Contact
