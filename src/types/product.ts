export interface Product {
  id: string
  name: string
  description: string
  sku: string
  groupCode: string
  brandName: string
  categoryName: string
  genderName: string
  colorName: string
  colorHex: string
  collectionName: string
  suggestedPrice: number
  costPrice: number
  wholesalePrice: number
  weight: number
  dimensions: string
  isActive: boolean
  images: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  totalSold?: number
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

