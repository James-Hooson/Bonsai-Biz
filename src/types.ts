export interface Product {
  id: string
  name: string
  price: number
  image: string
  mainCategory: string
  skillLevel: string
  rating: number
  inStock: boolean
  description: string
}

export interface CartItem extends Product {
  quantity: number
}
