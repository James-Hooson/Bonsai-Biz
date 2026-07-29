import React from 'react'
import { Link } from 'react-router-dom'
import { Waves, Wrench, MessageCircle, Fish, Leaf, Droplets } from 'lucide-react'
import { Header } from './Header'
import type { PageProps } from '../types'

export const Aquascaping: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  onLogout,
}) => {
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
            <p className="eyebrow mb-3">Design · Build · Maintain</p>
            <h2 className="text-display font-bold text-ink-invert mb-4">
              Aquascaping
            </h2>
            <p className="text-lede text-ink-invert-soft">
              Beautiful underwater landscapes — designed, built, and maintained by us
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <div className="bg-paper rounded-lg shadow-sm p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-ink mb-4">
              Bring Your Tank to Life
            </h3>
            <p className="text-lg text-ink-soft leading-relaxed">
              Aquascaping is the art of arranging aquatic plants, rocks, and driftwood
              into a stunning underwater garden. Whether you're starting fresh or looking
              to transform an existing tank, we offer everything from full setup and design
              through to ongoing servicing and expert consultation.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Tank Setup */}
          <div className="bg-paper rounded-lg shadow-sm p-6 text-center hover:shadow-lift transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Waves className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-3">
              Tank Setup
            </h3>
            <p className="text-ink-soft">
              Full tank builds from scratch — we handle substrate, hardscape, planting,
              lighting, and filtration to create a thriving aquascape tailored to your vision.
            </p>
          </div>

          {/* Servicing */}
          <div className="bg-paper rounded-lg shadow-sm p-6 text-center hover:shadow-lift transition">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-3">
              Servicing
            </h3>
            <p className="text-ink-soft">
              Regular maintenance visits to keep your tank in peak condition — water changes,
              plant trimming, filter cleans, and water parameter checks.
            </p>
          </div>

          {/* Consultation */}
          <div className="bg-paper rounded-lg shadow-sm p-6 text-center hover:shadow-lift transition">
            <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-3">
              Consultation
            </h3>
            <p className="text-ink-soft">
              Not sure where to start? Our experts can advise on tank size, livestock
              compatibility, plant selection, CO₂ systems, and more — in person or online.
            </p>
          </div>
        </div>

        {/* Feature Section */}
        <div className="bg-paper rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-ink mb-4">
                What We Offer
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <Fish className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Planted & Nature-Style Tanks</p>
                    <p className="text-ink-soft text-sm">Dutch, Iwagumi, jungle — any style designed to your taste.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-teal-100 p-2 rounded-full mt-0.5">
                    <Leaf className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Live Plant Selection</p>
                    <p className="text-ink-soft text-sm">Foreground carpets, midground accents, and background stems sourced fresh.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-cyan-100 p-2 rounded-full mt-0.5">
                    <Droplets className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Water Chemistry Support</p>
                    <p className="text-ink-soft text-sm">CO₂ injection, fertilisation schedules, and parameter balancing.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Ongoing Maintenance Plans</p>
                    <p className="text-ink-soft text-sm">Weekly or fortnightly visits so your tank always looks its best.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-64 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800&auto=format&fit=crop"
                alt="Aquascape planted tank"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="band-water rounded-lg shadow-lift p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-caustic">Tanks Built</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-caustic">Custom Designs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">NZ-Wide</div>
              <div className="text-caustic">Service Area</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Free</div>
              <div className="text-caustic">Initial Consult</div>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-paper rounded-lg shadow-sm p-8 mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <p className="text-blue-800 font-medium">
              Pro Tip: The key to a thriving aquascape is balancing light, CO₂, and nutrients.
              Get in touch and we'll walk you through the ideal setup for your space.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-ink mb-4">
            Ready to create your perfect aquascape?
          </h3>
          <p className="text-ink-soft mb-6">
            Reach out for a free consultation and let's design something beautiful.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Aquascaping
