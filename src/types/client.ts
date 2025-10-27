export interface Client {
  id: string
  name: string
  email: string
  cnpj: string
  phone: string
  company: string
  contactPerson: string
  address: string
  city: string
  state: string
  zipCode: string
  minimumOrder: number
  creditLimit: number
  paymentTerms: string
  discountPercentage: number
  isActive: boolean
  isApproved: boolean
  registrationDate: string
  lastOrderDate: string
  totalOrders: number
  totalValue: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ClientsResponse {
  clients: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ClientFormData {
  name?: string
  email?: string
  cnpj?: string
  phone?: string
  company?: string
  contactPerson?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  minimumOrder?: number
  creditLimit?: number
  paymentTerms?: string
  discountPercentage?: number
  isActive?: boolean
  isApproved?: boolean
  notes?: string
}
