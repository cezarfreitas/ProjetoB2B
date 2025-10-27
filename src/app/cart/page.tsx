'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { QuantitySelector } from '@/components/ui/quantity-selector'

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const router = useRouter()

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
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="cart" />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h1>
            <p className="text-gray-600 mb-6">Adicione alguns produtos para começar sua compra</p>
            <Link 
              href="/catalog"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Ver Catálogo
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="cart" />

      <main className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Carrinho de Compras</h1>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Imagem do Produto */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.variant?.size && `Tamanho: ${item.variant.size}`}
                        {item.variant?.color && ` • Cor: ${item.variant.color}`}
                        {!item.variant?.size && !item.variant?.color && item.size && `Tamanho: ${item.size}`}
                        {!item.variant?.size && !item.variant?.color && item.color && ` • Cor: ${item.color}`}
                      </p>
                      <p className="text-base sm:text-lg font-bold text-green-600 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Controles de Quantidade */}
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(quantity) => handleUpdateQuantity(item.id, quantity)}
                      min={1}
                      max={99}
                      size="md"
                    />

                    {/* Preço Total do Item */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} itens)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6"
              >
                Finalizar Compra
              </button>

              <button
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium mt-2"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
