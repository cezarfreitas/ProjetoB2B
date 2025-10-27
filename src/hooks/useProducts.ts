import { useState, useEffect, useCallback } from 'react'
import { Product, ProductsResponse } from '@/types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/products?admin=true&limit=1000')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data: ProductsResponse = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar produtos'
      setError(errorMessage)
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      setError(null)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar produto')
      }

      await fetchProducts()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao criar produto'
      setError(errorMessage)
      console.error('Erro ao criar produto:', err)
      return false
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
    try {
      setError(null)

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto')
      }

      await fetchProducts()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar produto'
      setError(errorMessage)
      console.error('Erro ao atualizar produto:', err)
      return false
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setError(null)

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar produto')
      }

      await fetchProducts()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao deletar produto'
      setError(errorMessage)
      console.error('Erro ao deletar produto:', err)
      return false
    }
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    setError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}

