export interface OrderItem {
  id: string
  productId: string
  productName: string
  variantName?: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerCompany?: string
  customerEmail: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER' | 'BOLETO' | 'CASH'
  subtotal: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  shippingAddress: any
  trackingNumber?: string
  estimatedDeliveryDate?: string
  shippedDate?: string
  deliveredDate?: string
  notes?: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
  itemCount: number
}

export interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface OrderFormData {
  status?: string
  paymentStatus?: string
  trackingNumber?: string
  notes?: string
  internalNotes?: string
}
