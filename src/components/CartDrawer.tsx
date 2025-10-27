'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  ArrowRight
} from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevenir scroll do body quando drawer estiver aberto
      document.body.style.overflow = 'hidden'
    } else {
      // Restaurar scroll do body quando drawer fechar
      document.body.style.overflow = 'unset'
      // Aguardar animação terminar antes de remover do DOM
      const timer = setTimeout(() => setIsVisible(false), 500)
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[9998] transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 pointer-events-none backdrop-blur-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-[9999] transform transition-all duration-500 ease-out shadow-2xl ${
        isOpen ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-full scale-95 opacity-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                Carrinho ({totalItems})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-300 ease-out"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seu carrinho está vazio
                </h3>
                <p className="text-gray-500 mb-6">
                  Adicione alguns produtos para começar sua compra
                </p>
                <Button onClick={onClose} className="w-full">
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 ease-out animate-in slide-in-from-right-5 fade-in-0"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationDuration: '400ms'
                    }}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 relative overflow-hidden rounded-md bg-gray-200 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.variant?.size && `Tamanho: ${item.variant.size}`}
                        {item.variant?.color && ` • Cor: ${item.variant.color}`}
                        {!item.variant?.size && !item.variant?.color && item.size && `Tamanho: ${item.size}`}
                        {!item.variant?.size && !item.variant?.color && item.color && ` • Cor: ${item.color}`}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(quantity) => handleUpdateQuantity(item.id, quantity)}
                      min={1}
                      max={99}
                      size="sm"
                      variant="inline"
                    />

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 hover:scale-110 transition-all duration-300 ease-out"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t bg-white p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Finalizar Compra
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
