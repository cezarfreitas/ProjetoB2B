'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import { usePublicAccess } from '@/hooks/usePublicAccess'
import { PublicAccessWrapper } from './PublicAccessWrapper'

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

interface ProductShelfProps {
  title: string
  subtitle?: string
  categoryId?: number
  brandId?: number
  limit?: number
}

export default function ProductShelf({ 
  title, 
  subtitle, 
  categoryId, 
  brandId, 
  limit = 8 
}: ProductShelfProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { showProducts } = usePublicAccess()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = '/api/products'
        const params = new URLSearchParams()
        
        if (categoryId) params.append('category', categoryId.toString())
        if (brandId) params.append('brand', brandId.toString())
        if (limit) params.append('limit', limit.toString())
        
        if (params.toString()) url += `?${params.toString()}`
        
        // Enviar token automaticamente se existir
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch(url, { headers })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, brandId, limit])


  // Skeleton de loading enquanto busca produtos
  const loadingSkeleton = (
    <section className="py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
          {subtitle && <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>}
        </div>
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-square bg-gray-300"></div>
            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Grid */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-5 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  // Wrapper com PublicAccessWrapper para evitar flash de conteúdo
  return (
    <PublicAccessWrapper fallback={loadingSkeleton}>
      {loading ? (
        loadingSkeleton
      ) : !showProducts ? null : products.length === 0 ? null : (
        <section className="py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <Link 
              href="/catalog" 
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              Ver todos
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Products Grid - Desktop */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Products Grid - Mobile */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </PublicAccessWrapper>
  )
}

