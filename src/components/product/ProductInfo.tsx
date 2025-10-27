'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import LoginModal from '../LoginModal'
import { Badge } from '../ui/badge'
import Image from 'next/image'

interface ProductInfoProps {
  name: string
  sku: string
  brandName?: string
  brandLogo?: string
  categoryName?: string
  genderName?: string
  costPrice: number
  wholesalePrice: number
  suggestedPrice: number
  formatPrice: (price: number) => string
  showPrices?: boolean
}

export default function ProductInfo({
  name,
  sku,
  brandName,
  brandLogo,
  categoryName,
  genderName,
  costPrice,
  wholesalePrice,
  suggestedPrice,
  formatPrice,
  showPrices = true
}: ProductInfoProps) {
  const wholesaleMargin = ((wholesalePrice - costPrice) / costPrice * 100).toFixed(0)
  const suggestedMargin = ((suggestedPrice - costPrice) / costPrice * 100).toFixed(0)

  return (
    <div className="space-y-4" style={{ marginBottom: '16px' }}>
      {/* Título Principal - 28-32px, peso 700, cor #111 */}
      <h1 
        className="font-bold leading-tight"
        style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: '#111',
          lineHeight: '1.2'
        }}
      >
        {name}
      </h1>

      {/* Marca */}
      {brandName && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Produto Oficial:
          </span>
          {brandLogo ? (
            <div className="relative h-10 w-auto">
              <Image
                src={brandLogo}
                alt={brandName}
                width={120}
                height={40}
                className="object-contain"
                style={{ maxHeight: '40px', width: 'auto' }}
              />
            </div>
          ) : (
            <Badge variant="outline" className="text-gray-700 border-gray-300">
              {brandName}
            </Badge>
          )}
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-600">SKU: {sku}</span>
        </div>
      )}

      {/* Preços - 22-26px, peso 600, cor #000 */}
      {showPrices && (
        <div 
          className="flex items-end gap-3"
          style={{ marginTop: '16px' }}
        >
          {/* Preço Atacado */}
          <div className="text-left">
            <div className="text-sm font-bold text-primary uppercase tracking-wide mb-0.5">
              Preço Atacado
            </div>
            <div className="text-4xl font-bold text-primary" style={{ fontSize: '36px', fontWeight: 700, color: '#f97316' }}>
              {formatPrice(wholesalePrice)}
            </div>
          </div>

          {/* Preço Sugestão - Lado a lado com menor destaque */}
          <div className="text-left">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
              Preço Sugestão
            </div>
            <div className="text-lg font-semibold text-gray-600" style={{ fontSize: '18px', fontWeight: 600, color: '#666' }}>
              {formatPrice(suggestedPrice)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

