'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  variant?: {
    id: string
    size?: string
    color?: string
  }
  variantId?: string
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string, variantId?: string) => boolean
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Carregar carrinho do banco quando usuário logar
  useEffect(() => {
    if (user && user.role === 'customer' && !initialized) {
      loadCartFromDatabase()
      setInitialized(true)
    } else if (!user && initialized) {
      // Quando usuário deslogar, limpar carrinho
      setItems([])
      setInitialized(false)
    }
  }, [user, initialized])

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const addItem = async (newItem: Omit<CartItem, 'id'>) => {
    if (!user || user.role !== 'customer') {
      // Se não estiver logado, apenas adicionar localmente
      const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setItems(prev => [...prev, { ...newItem, id }])
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: newItem.productId,
          variantId: newItem.variant?.id || newItem.variantId,
          quantity: newItem.quantity,
          price: newItem.price,
          name: newItem.name,
          image: newItem.image,
          variant: newItem.variant
        })
      })

      if (response.ok) {
        // Recarregar carrinho do banco
        await loadCartFromDatabase()
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
    }
  }

  const removeItem = async (id: string) => {
    if (!user || user.role !== 'customer') {
      // Se não estiver logado, apenas remover localmente
      setItems(prev => prev.filter(item => item.id !== id))
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(id)
      return
    }

    if (!user || user.role !== 'customer') {
      // Se não estiver logado, apenas atualizar localmente
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ))
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      if (response.ok) {
        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        ))
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
    }
  }

  const clearCart = async () => {
    if (!user || user.role !== 'customer') {
      // Se não estiver logado, apenas limpar localmente
      setItems([])
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setItems([])
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error)
    }
  }

  const isInCart = (productId: string, variantId?: string) => {
    return items.some(item => {
      if (variantId) {
        return item.productId === productId && 
               (item.variant?.id === variantId || item.variantId === variantId)
      }
      return item.productId === productId && !item.variant?.id && !item.variantId
    })
  }

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}