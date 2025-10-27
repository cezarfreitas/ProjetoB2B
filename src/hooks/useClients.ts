import { useState, useEffect, useCallback } from 'react'
import { Client, ClientsResponse } from '@/types/client'

interface UseClientsOptions {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
  initialStatus?: string
}

export function useClients(options: UseClientsOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialStatus = 'all'
  } = options

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>({})
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: initialLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/clients?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }

      const data: ClientsResponse = await response.json()
      setClients(data.clients)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, initialLimit])

  const createClient = useCallback(async (clientData: Partial<Client>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar cliente')
      }

      await fetchClients() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchClients])

  const updateClient = useCallback(async (clientId: string, clientData: Partial<Client>) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar cliente')
      }

      await fetchClients() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchClients])

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar cliente')
      }

      await fetchClients() // Recarregar lista
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [fetchClients])

  // Recarregar quando os filtros mudarem
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  return {
    // Estado
    clients,
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
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  }
}
