export interface Category {
  id: number
  name: string
  description: string
  slug: string
  isActive: boolean
  productCount?: number
  createdAt: string
  updatedAt: string
}

export interface CategoriesResponse {
  categories: Category[]
  total: number
}

