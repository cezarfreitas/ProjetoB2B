import { useState, useEffect, useCallback } from 'react'
import { Category } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias')
      }

      const data = await response.json()
      setCategories(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar categorias'
      setError(errorMessage)
      console.error('Erro ao carregar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: Partial<Category>) => {
    try {
      setError(null)

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar categoria')
      }

      await fetchCategories()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao criar categoria'
      setError(errorMessage)
      console.error('Erro ao criar categoria:', err)
      return false
    }
  }, [fetchCategories])

  const updateCategory = useCallback(async (categoryId: number, categoryData: Partial<Category>) => {
    try {
      setError(null)

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar categoria')
      }

      await fetchCategories()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar categoria'
      setError(errorMessage)
      console.error('Erro ao atualizar categoria:', err)
      return false
    }
  }, [fetchCategories])

  const deleteCategory = useCallback(async (categoryId: number) => {
    try {
      setError(null)

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar categoria')
      }

      await fetchCategories()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao deletar categoria'
      setError(errorMessage)
      console.error('Erro ao deletar categoria:', err)
      return false
    }
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    setError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

