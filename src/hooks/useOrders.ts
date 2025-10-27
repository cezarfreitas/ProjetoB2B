import { useState, useEffect, useCallback } from 'react'
import { Order } from '@/types/order'

interface OrderFilters {
  status?: string
  paymentStatus?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export function useOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async (currentFilters?: OrderFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      // Construir query string com filtros
      const params = new URLSearchParams()
      if (currentFilters?.status) params.append('status', currentFilters.status)
      if (currentFilters?.paymentStatus) params.append('paymentStatus', currentFilters.paymentStatus)
      if (currentFilters?.sellerId) params.append('sellerId', currentFilters.sellerId)
      if (currentFilters?.dateFrom) params.append('dateFrom', currentFilters.dateFrom)
      if (currentFilters?.dateTo) params.append('dateTo', currentFilters.dateTo)
      if (currentFilters?.search) params.append('search', currentFilters.search)
      
      const queryString = params.toString()
      const url = queryString ? `/api/orders?${queryString}` : '/api/orders'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar pedidos: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Orders fetched successfully:', data.orders?.length, 'orders')
      setOrders(data.orders || [])
    } catch (err) {
      setError('Erro ao carregar pedidos')
      console.error('Erro ao buscar pedidos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(filters)
  }, [fetchOrders, filters])

  const updateOrder = async (id: string, data: Partial<Order>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return false
      }

      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar pedido')
      }
      
      // Atualizar localmente
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...data } : order
      ))
      
      return true
    } catch (err) {
      setError('Erro ao atualizar pedido')
      console.error('Erro ao atualizar pedido:', err)
      return false
    }
  }


  return {
    orders,
    loading,
    error,
    setError,
    updateOrder,
    refetch: () => fetchOrders(filters)
  }
}
