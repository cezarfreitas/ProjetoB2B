export interface Customer {
  id: string
  name: string
  email: string
  password?: string
  cnpj: string
  phone: string
  company: string
  address: string
  addressNumber: string
  addressComplement: string
  city: string
  state: string
  zipCode: string
  minimumOrder: number
  isActive: boolean
  isApproved: boolean
  brandIds?: number[]
  sellerId?: string | null
  sellerName?: string | null
  registrationDate: string
  notes: string
  createdAt: string
  updatedAt: string
  totalOrders?: number
  totalValue?: number
  lastOrderDate?: string | null
}

export interface CustomersResponse {
  customers: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CustomerFormData {
  name?: string
  email?: string
  password?: string
  cnpj?: string
  phone?: string
  company?: string
  address?: string
  addressNumber?: string
  addressComplement?: string
  city?: string
  state?: string
  zipCode?: string
  minimumOrder?: number
  isActive?: boolean
  isApproved?: boolean
  brandIds?: number[]
  sellerId?: string | null
  notes?: string
}
