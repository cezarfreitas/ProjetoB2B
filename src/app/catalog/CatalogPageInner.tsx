'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import SEO from '@/components/SEO'
import { useCart } from '@/contexts/CartContext'
import { usePublicAccess } from '@/hooks/usePublicAccess'
import { Lock } from 'lucide-react'

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

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function CatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showProducts, mode } = usePublicAccess()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null)
  const [brandName, setBrandName] = useState<string>('')
  const [categoryName, setCategoryName] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Obter parâmetros da URL
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentSortBy = searchParams.get('sortBy') || 'createdAt'
  const currentSortOrder = searchParams.get('sortOrder') || 'DESC'
  const brandId = searchParams.get('brand')
  const categoryId = searchParams.get('category')

  useEffect(() => {
    fetchProducts()
  }, [currentPage, currentSortBy, currentSortOrder, brandId, categoryId])

  const handleBrandFilter = (brandId: number | null) => {
    setSelectedBrandId(brandId)
  }

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
  }

  const handleColorFilter = (colorId: number | null) => {
    setSelectedColorId(colorId)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/catalog?${params.toString()}`)
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    params.set('page', '1') // Reset to first page when sorting changes
    router.push(`/catalog?${params.toString()}`)
  }

  // Filtrar produtos baseado nos filtros selecionados
  const filteredProducts = products.filter(product => {
    // Se temos filtros de URL (brand/category), não aplicar filtros adicionais
    // pois a API já filtrou corretamente
    if (brandId || categoryId) {
      const colorMatch = !selectedColorId || product.colorId === selectedColorId
      return colorMatch
    }
    
    // Apenas aplicar filtros de sidebar se não há filtros de URL
    const brandMatch = !selectedBrandId || product.brandId === selectedBrandId
    const categoryMatch = !selectedCategoryId || product.categoryId === selectedCategoryId
    const colorMatch = !selectedColorId || product.colorId === selectedColorId
    return brandMatch && categoryMatch && colorMatch
  })

  const activeProducts = filteredProducts.filter(product => product.isActive)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Resetar nomes antes de buscar
      setBrandName('')
      setCategoryName('')
      
      // Construir query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      })
      
      if (brandId) params.append('brand', brandId)
      if (categoryId) params.append('category', categoryId)
      
      // Enviar token automaticamente se existir
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/products?${params.toString()}`, { headers })
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }
      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
      
      console.log('Filtros ativos:', { brandId, categoryId })
      console.log('Produtos retornados:', data.products.length)
      
      // Buscar nomes da marca e categoria dos produtos retornados
      if (data.products.length > 0) {
        const firstProduct = data.products[0]
        console.log('Primeiro produto:', { brandName: firstProduct.brandName, categoryName: firstProduct.categoryName })
        
        if (brandId && firstProduct.brandName) {
          setBrandName(firstProduct.brandName)
        }
        if (categoryId && firstProduct.categoryName) {
          setCategoryName(firstProduct.categoryName)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const { addItem } = useCart()

  const handleAddToCart = (productId: string) => {
    // Encontrar o produto na lista
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Adicionar ao carrinho (sempre 1 unidade por clique no catálogo)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.wholesalePrice || product.price,
      quantity: 1,
      image: product.images?.[0]
    })
  }

  // Se o modo é CLOSED e não deve mostrar produtos, redirecionar para home
  if (mode === 'CLOSED' && !showProducts) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header currentPage="catalog" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Catálogo Restrito</h2>
            <p className="text-gray-600 mb-6">
              Faça login para acessar nosso catálogo completo de produtos.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Fazer Login
              </button>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Catálogo de Produtos"
        description="Explore nosso catálogo completo de produtos atacadistas"
      />
      <Header currentPage="catalog" />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar Component */}
        <div className="hidden lg:block">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            products={activeProducts}
            onBrandFilter={handleBrandFilter}
            onCategoryFilter={handleCategoryFilter}
            onColorFilter={handleColorFilter}
            selectedBrandId={selectedBrandId}
            selectedCategoryId={selectedCategoryId}
            selectedColorId={selectedColorId}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            products={activeProducts}
            onBrandFilter={handleBrandFilter}
            onCategoryFilter={handleCategoryFilter}
            onColorFilter={handleColorFilter}
            selectedBrandId={selectedBrandId}
            selectedCategoryId={selectedCategoryId}
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {brandName && categoryName 
                    ? `${brandName} - ${categoryName}` 
                    : brandName 
                    ? brandName
                    : categoryName
                    ? categoryName
                    : 'Catálogo de Produtos'}
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages} - {pagination.total} produtos
              </div>
              
              {/* Seletor de Ordenação */}
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm text-gray-600">Ordenar por:</label>
                <select
                  id="sort"
                  value={`${currentSortBy}-${currentSortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    handleSortChange(sortBy, sortOrder)
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="createdAt-DESC">Mais recentes</option>
                  <option value="createdAt-ASC">Mais antigos</option>
                  <option value="name-ASC">Nome A-Z</option>
                  <option value="name-DESC">Nome Z-A</option>
                  <option value="price-ASC">Menor preço</option>
                  <option value="price-DESC">Maior preço</option>
                  <option value="wholesalePrice-ASC">Menor preço atacado</option>
                  <option value="wholesalePrice-DESC">Maior preço atacado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          {activeProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Não há produtos disponíveis no momento.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {activeProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Controles de Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {/* Números das páginas */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2)
                      const pageNum = startPage + i
                      if (pageNum > pagination.totalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
