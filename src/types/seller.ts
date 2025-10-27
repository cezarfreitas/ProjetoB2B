export interface Seller {
  id: string
  name: string
  email: string
  password?: string
  phone?: string
  commissionRate: number
  region?: string
  isActive: boolean
  brandIds?: number[]
  brands?: { id: number; name: string }[]
  createdAt: string
  updatedAt: string
}

export interface SellersResponse {
  sellers: Seller[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SellerFormData {
  name?: string
  email?: string
  phone?: string
  commission?: number
  isActive?: boolean
}

