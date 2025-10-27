'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'

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

interface RecommendedProductsProps {
  products: Product[]
  currentProductId?: string
}

export default function RecommendedProducts({ products, currentProductId }: RecommendedProductsProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Filtrar produtos ativos e excluir o produto atual
  const activeProducts = products.filter(product => 
    product.isActive && product.id !== currentProductId
  )

  // Pegar mais produtos para o carrossel
  const recommendedProducts = activeProducts.slice(0, 10)

  if (recommendedProducts.length === 0) {
    return null
  }

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < recommendedProducts.length - 5

  const handleScroll = (direction: 'left' | 'right') => {
    if (direction === 'left' && canScrollLeft) {
      setScrollPosition(prev => Math.max(0, prev - 1))
    } else if (direction === 'right' && canScrollRight) {
      setScrollPosition(prev => Math.min(recommendedProducts.length - 5, prev + 1))
    }
  }

  return (
    <div className="mt-12 md:mt-16">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Produtos Recomendados</h2>
        
        {/* Botões de Navegação - Desktop */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid Mobile - 2 colunas */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {recommendedProducts.slice(0, 4).map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
          />
        ))}
      </div>

      {/* Carrossel Desktop - 5 por linha */}
      <div className="hidden md:block overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${scrollPosition * (100 / 5)}%)`
          }}
        >
          {recommendedProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0" style={{ width: 'calc(20% - 19.2px)' }}>
              <ProductCard 
                product={product}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
