'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { usePublicAccess } from '@/hooks/usePublicAccess'
import Header from '@/components/Header'
import Breadcrumb from '@/components/Breadcrumb'
import RecommendedProducts from '@/components/RecommendedProducts'
import ProductInfo from '@/components/product/ProductInfo'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'
import SEO from '@/components/SEO'
import { QuantitySelector } from '@/components/ui/quantity-selector'

interface ProductVariant {
  id: string
  variantSku: string
  stock: number
  minStock: number
  gradeId: number
  isActive: boolean
  gradeName: string
  gradeDescription: string
  gradeSizes: any
  gradeTotalPrice?: number
  totalItemsInGrade?: number
  wholesalePrice?: number
  price?: number
}

interface Product {
  id: string
  name: string
  description: string
  sku: string
  groupCode: string
  costPrice: number
  wholesalePrice: number
  price: number
  suggestedPrice: number
  stock: number
  minStock: number
  weight: number
  dimensions: string
  stockType: string
  stockFormat: string[]
  minQuantity: number
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
  brandLogo?: string
  categoryName: string
  genderName: string
  colorName: string
  colorHex: string
  collectionName: string
  variants?: ProductVariant[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addItem } = useCart()
  const { showPrices } = usePublicAccess()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedGrade, setSelectedGrade] = useState<ProductVariant | null>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchAllProducts()
    }
  }, [productId])

  const fetchAllProducts = async () => {
    try {
      // Enviar token automaticamente se existir
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/products', { headers })
      if (response.ok) {
        const data = await response.json()
        setAllProducts(data.products || [])
      }
    } catch (err) {
      console.error('Erro ao carregar produtos para sidebar:', err)
    }
  }

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedGrade) {
      setSelectedGrade(product.variants[0])
    }
  }, [product, selectedGrade])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      
      // Enviar token automaticamente se existir
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/products/${productId}`, { headers })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Produto não encontrado')
      }
      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
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

  const handleAddToCart = () => {
    if (!selectedGrade || !product) return

    const cartItem = {
      productId: productId,
      name: product.name,
      price: selectedGrade.gradeTotalPrice || selectedGrade.price || product.wholesalePrice || 0,
      quantity: quantity,
      image: product.images?.[0],
      variant: {
        id: selectedGrade.id,
        size: selectedGrade.gradeName,
        color: product.colorName
      }
    }

    addItem(cartItem)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!product || !product.images || product.images.length <= 1) return
    
    const minSwipeDistance = 50
    const distance = touchStart - touchEnd
    
    if (Math.abs(distance) < minSwipeDistance) return
    
    if (distance > 0) {
      // Swipe para esquerda - próxima imagem
      setSelectedImageIndex(prev => 
        prev < product.images.length - 1 ? prev + 1 : 0
      )
    } else {
      // Swipe para direita - imagem anterior
      setSelectedImageIndex(prev => 
        prev > 0 ? prev - 1 : product.images.length - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error || 'Produto não encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={product?.name}
        description={product?.description || `${product?.name} - ${product?.brandName} - ${product?.categoryName}`}
        image={product?.images?.[0]}
        type="product"
      />
      
      <Header />

      {/* Conteúdo Principal - Base 8px, blocos principais 40px vertical */}
      <main className="flex-1 bg-white px-2 sm:px-4 lg:px-8 py-4">
        <div className="mx-auto" style={{ maxWidth: '2000px', width: '100%' }}>
          {/* Breadcrumb */}
          {product && (
            <Breadcrumb 
              items={[
                { label: 'Catálogo', href: '/catalog' },
                { label: product.brandName || 'Marca', href: product.brandName ? `/catalog?brand=${product.brandName.toLowerCase()}` : undefined },
                { label: product.categoryName || 'Categoria', href: product.categoryName ? `/catalog?category=${product.categoryName.toLowerCase()}` : undefined },
                { label: product.name }
              ]}
            />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-20" style={{ gap: '3px' }}>
          {/* Imagens do Produto */}
          <div className="lg:col-span-11" style={{ padding: '8px' }}>
            {/* Mobile: Uma imagem por vez com swipe */}
            <div className="lg:hidden">
              {product.images && product.images.length > 0 ? (
                <div
                  className="aspect-square relative overflow-hidden bg-white border border-gray-100 rounded-lg"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={`${product.name} - Imagem ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  {/* Indicadores de posição */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Desktop: Grid de todas as imagens */}
            <div className="hidden lg:grid grid-cols-2" style={{ gap: '3px' }}>
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square relative overflow-hidden bg-white border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      padding: '8px',
                      margin: '4px'
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Produto - Espaçamento 16px entre título/preço/botão */}
          <div className="lg:col-span-9 space-y-4" style={{ padding: '8px' }}>
            <ProductInfo
              name={product.name}
              sku={product.sku}
              brandName={product.brandName}
              brandLogo={product.brandLogo}
              categoryName={product.categoryName}
              genderName={product.genderName}
              costPrice={product.costPrice}
              wholesalePrice={product.wholesalePrice}
              suggestedPrice={product.suggestedPrice || product.price}
              formatPrice={formatPrice}
              showPrices={showPrices}
            />


            {/* Tabela de Grades - Gap entre seções 48px */}
            {showPrices && product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Escolha a Grade
                </h3>
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 rounded-lg">
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr 
                          key={variant.id}
                          className={`cursor-pointer transition-colors ${
                            selectedGrade?.id === variant.id 
                              ? 'border-l-4 border-orange-400' 
                              : ''
                          }`}
                          onClick={() => setSelectedGrade(variant)}
                        >
                          <td className="py-4 px-4 border-b border-gray-200">
                            <div>
                              <div className={`font-bold text-base ${selectedGrade?.id === variant.id ? 'text-orange-900' : 'text-gray-900'}`}>
                                {variant.gradeName}
                              </div>
                              {variant.gradeDescription && (
                                <div className={`text-sm mt-1 ${selectedGrade?.id === variant.id ? 'text-orange-700' : 'text-gray-500'}`}>
                                  {variant.gradeDescription}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center border-b border-gray-200">
                            {variant.gradeSizes && (
                              <div className="space-y-3">
                                <div 
                                  className={`font-medium uppercase tracking-wide ${selectedGrade?.id === variant.id ? 'text-orange-700' : 'text-gray-500'}`}
                                  style={{ fontSize: '14px', fontWeight: 400, color: '#555' }}
                                >
                                  Composição
                                </div>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                  {Object.entries(variant.gradeSizes)
                                    .sort(([a], [b]) => {
                                      const order = ['PP', 'P', 'M', 'G', 'GG'];
                                      const indexA = order.indexOf(a);
                                      const indexB = order.indexOf(b);
                                      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                      if (indexA === -1) return 1;
                                      if (indexB === -1) return -1;
                                      return indexA - indexB;
                                    })
                                    .map(([size, quantity]) => (
                                    <span 
                                      key={size}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                        selectedGrade?.id === variant.id 
                                          ? 'text-orange-900 border border-orange-300' 
                                          : 'text-gray-700 border border-gray-200'
                                      }`}
                                    >
                                      {size}×{String(quantity)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right border-b border-gray-200">
                            {variant.totalItemsInGrade && (
                              <div className="space-y-2">
                                <div 
                                  className={`font-medium uppercase tracking-wide ${selectedGrade?.id === variant.id ? 'text-orange-700' : 'text-gray-500'}`}
                                  style={{ fontSize: '14px', fontWeight: 400, color: '#555' }}
                                >
                                  Quantidade
                                </div>
                                <div className={`text-lg font-bold ${selectedGrade?.id === variant.id ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {variant.totalItemsInGrade} peças
                                </div>
                              </div>
                            )}
                          </td>
                          {showPrices && (
                            <td className="py-4 px-4 text-right">
                              {variant.gradeTotalPrice && (
                                <div className="space-y-2">
                                  <div 
                                    className={`font-medium uppercase tracking-wide ${selectedGrade?.id === variant.id ? 'text-orange-700' : 'text-gray-500'}`}
                                    style={{ fontSize: '14px', fontWeight: 400, color: '#555' }}
                                  >
                                    Valor Grade
                                  </div>
                                  <div className={`text-lg font-bold ${selectedGrade?.id === variant.id ? 'text-orange-900' : 'text-gray-900'}`}>
                                    {formatPrice(variant.gradeTotalPrice)}
                                  </div>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className={`md:hidden grid gap-3 ${product.variants && product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`border-2 rounded-lg cursor-pointer transition-all duration-200 flex flex-col ${
                        product.variants && product.variants.length === 1 
                          ? 'p-4'
                          : 'p-3'
                      } ${
                        selectedGrade?.id === variant.id 
                          ? 'border-orange-500 bg-orange-50 shadow-md' 
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedGrade(variant)}
                    >
                      {/* Header */}
                      <div className="mb-2">
                        <div className={`font-bold ${product.variants && product.variants.length === 1 ? 'text-lg' : 'text-sm'} ${selectedGrade?.id === variant.id ? 'text-orange-900' : 'text-gray-900'}`}>
                          {variant.gradeName}
                        </div>
                      </div>

                      {/* Composição otimizada */}
                      {variant.gradeSizes && (
                        <div className={`flex-1 ${product.variants && product.variants.length === 1 ? 'mb-3' : 'mb-2.5'}`}>
                          <div className={`flex flex-wrap ${product.variants && product.variants.length === 1 ? 'gap-2' : 'gap-1.5'}`}>
                            {Object.entries(variant.gradeSizes)
                              .sort(([a], [b]) => {
                                const order = ['PP', 'P', 'M', 'G', 'GG'];
                                const indexA = order.indexOf(a);
                                const indexB = order.indexOf(b);
                                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                if (indexA === -1) return 1;
                                if (indexB === -1) return -1;
                                return indexA - indexB;
                              })
                              .map(([size, quantity]) => (
                              <span 
                                key={size}
                                className={`rounded-md font-bold ${
                                  product.variants && product.variants.length === 1 
                                    ? 'px-3 py-1.5 text-sm'
                                    : 'px-2 py-1 text-xs'
                                } ${
                                  selectedGrade?.id === variant.id 
                                    ? 'bg-white text-orange-900 border border-orange-400 shadow-sm' 
                                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}
                              >
                                {size}×{String(quantity)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer otimizado */}
                      <div className={`border-t border-gray-200 mt-auto ${product.variants && product.variants.length === 1 ? 'pt-3' : 'pt-2.5'}`}>
                        {variant.totalItemsInGrade && (
                          <div className={showPrices && variant.gradeTotalPrice ? `grid grid-cols-2 ${product.variants && product.variants.length === 1 ? 'gap-3' : 'gap-2'}` : 'text-center'}>
                            <div className="text-center">
                              <div className={`text-gray-500 font-medium uppercase tracking-wide mb-0.5 ${product.variants && product.variants.length === 1 ? 'text-xs' : 'text-[10px]'}`}>
                                Qtd
                              </div>
                              <div className={`font-semibold text-gray-700 ${product.variants && product.variants.length === 1 ? 'text-base' : 'text-xs'}`}>
                                {variant.totalItemsInGrade}
                              </div>
                            </div>
                            {showPrices && variant.gradeTotalPrice && (
                              <div className="text-center">
                                <div className={`text-gray-500 font-medium uppercase tracking-wide mb-0.5 ${product.variants && product.variants.length === 1 ? 'text-xs' : 'text-[10px]'}`}>
                                  Total
                                </div>
                                <div className={`font-bold ${selectedGrade?.id === variant.id ? 'text-orange-900' : 'text-gray-900'} ${product.variants && product.variants.length === 1 ? 'text-lg' : 'text-sm'}`}>
                                  {formatPrice(variant.gradeTotalPrice)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantidade e Adicionar ao Carrinho */}
            {(selectedGrade || !showPrices) && (
              <div className="space-y-4">
                {/* Simulação */}
                {showPrices && selectedGrade && product.price && product.price !== (product.wholesalePrice || product.price) && selectedGrade.totalItemsInGrade && (() => {
                  const wholesale = selectedGrade.gradeTotalPrice || 0
                  const retailPerItem = product.price
                  const wholesalePerItem = (product.wholesalePrice || product.price)
                  const profitPerItem = retailPerItem - wholesalePerItem
                  const totalItems = selectedGrade.totalItemsInGrade
                  const totalCost = wholesale * quantity
                  const totalRevenue = retailPerItem * totalItems * quantity
                  const totalProfit = profitPerItem * totalItems * quantity
                  
                  return (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 md:p-6 border border-green-200">
                      <div className="space-y-4">
                        {/* Título */}
                        <div className="flex items-center gap-3 justify-center">
                          <span className="text-2xl">💰</span>
                          <h4 className="text-lg font-bold text-gray-900">Simulação de Lucro</h4>
                        </div>
                        
                        {/* Cards de Simulação */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Custo */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">Você Paga</div>
                            <div className="text-xl font-bold text-red-600">{formatPrice(totalCost)}</div>
                          </div>
                          
                          {/* Receita */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Vendendo Tudo</div>
                            <div className="text-xl font-bold text-blue-600">{formatPrice(totalRevenue)}</div>
                          </div>
                          
                          {/* Lucro */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Seu Lucro</div>
                            <div className="text-2xl font-bold text-green-600">{formatPrice(totalProfit)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Quantidade e Botão */}
                <div className="space-y-4">
                  {showPrices && selectedGrade ? (
                    <div className="flex flex-row gap-4 items-stretch">
                      {/* Seletor de Quantidade */}
                      <div className="flex flex-col gap-2">
                        <QuantitySelector
                          value={quantity}
                          onChange={setQuantity}
                          min={1}
                          max={selectedGrade.stock}
                          size="lg"
                          className="w-32"
                        />
                      </div>

                      {/* Botão Adicionar */}
                      <div className="flex-1 flex flex-col gap-2">
                        <button
                          onClick={handleAddToCart}
                          disabled={selectedGrade.stock === 0}
                          className="flex-1 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-base md:text-lg cursor-pointer transition-all duration-200 ease-in-out"
                          style={{ 
                            height: '48px', 
                            borderRadius: '8px',
                            backgroundColor: selectedGrade.stock === 0 ? '#9CA3AF' : '#000',
                            color: '#FFF'
                          }}
                        >
                          {selectedGrade.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 text-center bg-white">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Faça login para ver preços e comprar
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Para visualizar os preços e adicionar produtos ao carrinho, é necessário fazer login ou criar uma conta.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors text-sm"
                        >
                          Fazer Login
                        </button>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          className="px-6 py-2.5 bg-white text-primary border-2 border-primary rounded-lg hover:bg-primary/5 font-semibold transition-colors text-sm"
                        >
                          Cadastrar-se
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mais cores */}
                  {allProducts.filter(p => p.groupCode === product.groupCode && p.id !== product.id).length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Mais cores</h4>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                        {allProducts
                          .filter(p => p.groupCode === product.groupCode && p.id !== product.id)
                          .slice(0, 10)
                          .map((relatedProduct) => (
                            <Link
                              key={relatedProduct.id}
                              href={`/catalog/${relatedProduct.id}`}
                              className="group flex-shrink-0 w-16 h-16 md:w-20 md:h-20"
                            >
                              <div className="w-full h-full relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-orange-400 active:border-orange-500 transition-colors shadow-sm">
                                {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                  <Image
                                    src={relatedProduct.images[0]}
                                    alt={relatedProduct.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-200"
                                    sizes="100vw"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Sem imagem</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Descrição e Detalhes - 16px, 400, #333, alinhamento à esquerda */}
            {product.description && (
              <div className="border-t border-gray-200 pt-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Descrição do Produto</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p 
                    className="text-left leading-relaxed"
                    style={{ 
                      fontSize: '16px', 
                      fontWeight: 400, 
                      color: '#333',
                      textAlign: 'left'
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Produtos Recomendados */}
        <RecommendedProducts 
          products={allProducts} 
          currentProductId={productId} 
        />
        </div>
      </main>

      <Footer />

      {/* Modais */}
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
    </div>
  )
}
