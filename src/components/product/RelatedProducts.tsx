'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface RelatedProduct {
  id: string
  name: string
  sku: string
  groupCode: string
  price: number
  wholesalePrice: number
  images: string[]
  isActive: boolean
  brandName: string
  categoryName: string
  colorName: string
  colorHex: string
}

interface RelatedProductsProps {
  currentProductId: string
  groupCode: string
}

export default function RelatedProducts({ currentProductId, groupCode }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (groupCode) {
      fetchRelatedProducts()
    }
  }, [groupCode])

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/group/${encodeURIComponent(groupCode)}`)
      
      if (response.ok) {
        const data = await response.json()
        // Filtrar o produto atual da lista
        const filtered = data.products.filter((product: RelatedProduct) => product.id !== currentProductId)
        setRelatedProducts(filtered)
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos relacionados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Carregando produtos relacionados...</h4>
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 pt-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Mais cores
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/catalog/${product.id}`}
            className="group flex-shrink-0 w-16 h-16 md:w-20 md:h-20"
          >
            <div className="w-full h-full relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-orange-400 active:border-orange-500 transition-colors shadow-sm">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">?</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
