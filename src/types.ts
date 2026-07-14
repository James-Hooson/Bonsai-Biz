import type { User } from '@auth0/auth0-spa-js'

export interface PageProps {
  user: User | undefined
  isAuthenticated: boolean
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
}

export const AUTH0_ROLES_CLAIM = 'https://zenbonsai.com/roles'

export const ADMIN_EMAILS = ['jmhooson48@gmail.com', 'zenoasisnz@gmail.com']

export interface Product {
  id: string
  name: string
  price: number
  image: string
  mainCategory: string
  rating: number
  inStock: boolean
  stock: number
  description: string
}

export interface CartItem extends Product {
  quantity: number
}
