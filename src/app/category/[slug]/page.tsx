'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import SEO from '@/components/SEO'

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
  brandId: number
  categoryId: number
  genderId: number
  colorId: number
  collectionId: number
  brandName: string
  categoryName: string
  genderName: string
  colorName: string
  colorHex: string
  collectionName: string
}

interface Category {
  id: number
  name: string
  description: string
  slug: string
  isActive: boolean
  productCount: number
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null)

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts()
    }
  }, [slug])

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true)
      
      // Buscar categoria pelo slug
      const categoryResponse = await fetch(`/api/categories/slug/${slug}`)
      if (!categoryResponse.ok) {
        throw new Error('Categoria não encontrada')
      }
      const categoryData = await categoryResponse.json()
      setCategory(categoryData)

      // Buscar produtos da categoria
      const productsResponse = await fetch(`/api/products/category/${categoryData.id}`)
      if (!productsResponse.ok) {
        throw new Error('Erro ao carregar produtos da categoria')
      }
      const productsData = await productsResponse.json()
      setProducts(productsData.products || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleColorFilter = (colorId: number | null) => {
    setSelectedColorId(colorId)
  }

  // Filtrar produtos por cor se selecionada
  const filteredProducts = products.filter(product => {
    const colorMatch = !selectedColorId || product.colorId === selectedColorId
    return colorMatch
  })

  const activeProducts = filteredProducts.filter(product => product.isActive)

  const handleAddToCart = (productId: string) => {
    console.log('Adicionar ao carrinho:', productId)
    // Aqui você pode implementar a lógica para adicionar ao carrinho
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando categoria...</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error || 'Categoria não encontrada'}</p>
          <Link 
            href="/catalog"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={category.name}
        description={category.description || `Confira todos os produtos da categoria ${category.name}`}
      />
      <Header currentPage="catalog" />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            products={products.filter(p => p.isActive)}
            onColorFilter={handleColorFilter}
            selectedColorId={selectedColorId}
          />
        </div>

        {/* Sidebar Mobile */}
        <div className="lg:hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            products={products.filter(p => p.isActive)}
            onColorFilter={handleColorFilter}
            selectedColorId={selectedColorId}
          />
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 bg-white px-4 sm:px-6 lg:px-8 py-4 lg:ml-0">
          {/* Header com botão do menu mobile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 mt-1 text-sm">{category.description}</p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {activeProducts.length} produto{activeProducts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Grid de Produtos */}
          {activeProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Não há produtos disponíveis nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
