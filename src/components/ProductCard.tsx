'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Lock } from 'lucide-react'
import { usePublicAccess } from '@/hooks/usePublicAccess'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

interface Product {
  id: string
  name: string
  description: string
  sku: string
  groupCode: string
  costPrice: number
  wholesalePrice: number
  price: number
  stock: number
  minStock: number
  weight: number
  dimensions: string
  isActive: boolean
  images: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  brandName: string
  categoryName: string
  genderName: string
  colorName: string
  colorHex: string
  collectionName: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter()
  const { showPrices } = usePublicAccess()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product.id)
    }
  }
  
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLoginModal(true)
  }

  return (
    <>
    <Link 
      href={`/catalog/${product.id}`}
      className="block group h-full"
    >
      <div className="bg-white border border-gray-200 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Imagem do Produto */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400 text-xs">Sem imagem</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Informações do Produto */}
        <div className="p-3 relative flex-1 flex flex-col">
          {/* Nome */}
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors mb-0.5 flex-shrink-0">
            {product.name}
          </h3>

          {/* Preços ou Aviso de Login */}
          {showPrices ? (
            <>
              <div className="space-y-0.5 flex-1">
                {/* Preço de Atacado */}
                <div>
                  <span className="text-gray-500 text-sm">Preço atacado </span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.wholesalePrice || product.price)}
                  </span>
                </div>

                {/* Sugestão de Venda (se diferente) */}
                {product.price && product.price !== (product.wholesalePrice || product.price) && (
                  <div>
                    <span className="text-gray-500 text-xs">Preço venda </span>
                    <span className="text-xs text-gray-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Botão Carrinho - Canto Inferior Direito do Card */}
              <button 
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 flex items-center justify-center w-12 h-12 text-primary hover:text-primary hover:bg-orange-50 rounded-full transition-colors"
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold mr-1">+</span>
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center py-4 bg-gray-50 rounded-lg">
              <Lock className="h-6 w-6 text-gray-400 mb-2" />
              <p className="text-xs text-gray-600 text-center mb-2">
                Faça login para<br />ver os preços
              </p>
              <button 
                onClick={handleLoginClick}
                className="text-xs text-primary hover:text-primary/80 font-semibold underline"
              >
                Fazer Login
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
    
    <LoginModal 
      isOpen={showLoginModal} 
      onClose={() => setShowLoginModal(false)}
      onSwitchToRegister={() => {
        setShowLoginModal(false)
        setShowRegisterModal(true)
      }}
    />
    <RegisterModal 
      isOpen={showRegisterModal} 
      onClose={() => setShowRegisterModal(false)}
      onSwitchToLogin={() => {
        setShowRegisterModal(false)
        setShowLoginModal(true)
      }}
    />
  </>
  )
}
