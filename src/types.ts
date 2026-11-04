import type { User } from '@auth0/auth0-spa-js'

export interface PageProps {
  user: User | undefined
  isAuthenticated: boolean
  isLoading: boolean
  firebaseReady: boolean
  onLogin: () => void
  onLogout: () => void
}

export const ADMIN_EMAILS = ['jmhooson48@gmail.com', 'zenoasisnz@gmail.com']

export interface Product {
  id: string
  name: string
  price: number
  image: string
  mainCategory: string
  inStock: boolean
  stock: number
  description: string
}

export interface CartItem extends Product {
  quantity: number
}

// The functions server answered checkout with an error (as opposed to the
// request never getting there).
export class CheckoutResponseError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Order ID of a checkout this tab sent to Stripe and hasn't seen paid. Stripe
// sessions hold reserved stock, so returning to the shop without paying cancels it.
export const PENDING_CHECKOUT_KEY = 'pendingCheckoutOrderId'
