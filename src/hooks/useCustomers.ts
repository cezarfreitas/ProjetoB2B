import { useState, useEffect, useCallback } from 'react'
import { Customer, CustomersResponse } from '@/types/customer'

interface UseCustomersOptions {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
  initialStatus?: string
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialStatus = 'all'
  } = options

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>({})
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: initialLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/customers?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar customers')
      }

      const data: CustomersResponse = await response.json()
      setCustomers(data.customers)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, initialLimit])

  const createCustomer = useCallback(async (customerData: Partial<Customer>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar customer')
      }

      await fetchCustomers() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchCustomers])

  const updateCustomer = useCallback(async (customerId: string, customerData: Partial<Customer>) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar customer')
      }

      await fetchCustomers() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchCustomers])

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar customer')
      }

      await fetchCustomers() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchCustomers])

  // Recarregar quando os filtros mudarem
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  return {
    // Estado
    customers,
    loading,
    error,
    pagination,
    
    // Filtros
    searchTerm,
    statusFilter,
    currentPage,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setCurrentPage,
    setError,
    
    // Ações
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}