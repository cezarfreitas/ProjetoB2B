import { useState, useEffect, useCallback } from 'react'

interface Seller {
  id: string
  name: string
}

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/sellers')
      if (!response.ok) {
        throw new Error('Erro ao carregar vendedores')
      }
      
      const data = await response.json()
      setSellers(data)
    } catch (err) {
      setError('Erro ao carregar vendedores')
      console.error('Erro ao buscar vendedores:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  const createSeller = useCallback(async (data: any) => {
    try {
      setError(null)
      
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar vendedor')
      }

      const newSeller = await response.json()
      
      // Atualizar lista local adicionando o novo vendedor
      setSellers(prev => [...prev, newSeller])
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar vendedor'
      setError(errorMessage)
      console.error('Erro ao criar vendedor:', err)
      return false
    }
  }, [])

  const updateSeller = useCallback(async (sellerId: string, data: any) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar vendedor')
      }

      const updatedSeller = await response.json()
      
      // Atualizar lista local com o vendedor atualizado
      setSellers(prev => prev.map(seller => 
        seller.id === sellerId ? updatedSeller : seller
      ))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar vendedor'
      setError(errorMessage)
      console.error('Erro ao atualizar vendedor:', err)
      return false
    }
  }, [])

  const deleteSeller = useCallback(async (sellerId: string) => {
    try {
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar vendedor')
      }

      // Atualizar lista local removendo o vendedor
      setSellers(prev => prev.filter(seller => seller.id !== sellerId))
    } catch (err) {
      setError('Erro ao deletar vendedor')
      console.error('Erro ao deletar vendedor:', err)
      throw err
    }
  }, [])

  return {
    sellers,
    loading,
    error,
    setError,
    createSeller,
    updateSeller,
    deleteSeller,
    refreshSellers: fetchSellers
  }
}