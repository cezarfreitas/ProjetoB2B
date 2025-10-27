'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSidebar } from '@/hooks/useSidebar'
import { SidebarProps } from '@/types/sidebar'
import { 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  X, 
  Search,
  Star,
  TrendingUp,
  Package
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  productCount: number
}

interface Brand {
  id: number
  name: string
  slug: string
  categories: Category[]
}

// Componente para cada marca
function BrandSection({ brand }: { brand: Brand }) {
  const searchParams = useSearchParams()
  const currentBrandSlug = searchParams.get('brand')
  const currentCategorySlug = searchParams.get('category')
  
  // Verificar se esta marca está ativa
  const isBrandActive = currentBrandSlug === brand.slug
  const isCategoryActive = currentCategorySlug && brand.categories.some(cat => cat.slug === currentCategorySlug)
  
  // Expandir se a marca estiver ativa ou se alguma categoria estiver ativa
  const [isExpanded, setIsExpanded] = useState(isBrandActive || isCategoryActive)

  // Atualizar estado quando os parâmetros mudarem
  useEffect(() => {
    const shouldExpand = isBrandActive || isCategoryActive
    setIsExpanded(shouldExpand)
  }, [isBrandActive, isCategoryActive])

  const handleBrandClick = () => {
    if (brand.categories.length > 0) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBrandClick}
          className={`text-sm font-medium transition-colors px-2 py-1.5 rounded flex-1 text-left ${
            isBrandActive 
              ? 'text-white bg-primary/80' 
              : 'text-orange-50 hover:text-white hover:bg-primary/80'
          }`}
        >
          {brand.name}
        </button>
        {brand.categories.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-primary/80 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-orange-100" />
            ) : (
              <ChevronRight className="h-4 w-4 text-orange-100" />
            )}
          </button>
        )}
      </div>
      
      {isExpanded && brand.categories.length > 0 && (
        <div className="pl-4 space-y-1">
          {brand.categories.map((category) => {
            const isThisCategoryActive = currentCategorySlug === category.slug
            return (
              <Link
                key={category.id}
                href={`/catalog?brand=${brand.slug}&category=${category.slug}`}
                className={`block text-xs transition-colors px-2 py-1 rounded ${
                  isThisCategoryActive
                    ? 'text-white bg-primary/80 font-medium'
                    : 'text-orange-100 hover:text-white hover:bg-primary/80'
                }`}
              >
                {category.name} ({category.productCount})
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  products, 
  onBrandFilter,
  onCategoryFilter, 
  onColorFilter,
  selectedBrandId,
  selectedCategoryId,
  selectedColorId
}: SidebarProps) {
  const { categories, colors, loading, error } = useSidebar()
  const [brands, setBrands] = useState<Brand[]>([])
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: true,
    price: false
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar marcas com suas categorias
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Enviar token automaticamente se existir
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch('/api/brands-with-categories', { headers })
        if (response.ok) {
          const data = await response.json()
          setBrands(data)
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error)
      }
    }
    fetchBrands()
  }, [])

  const handleCategoryClick = (categoryId: number, categorySlug: string) => {
    if (onCategoryFilter) {
      // Se a categoria já está selecionada, deselecionar (mostrar todas)
      const newCategoryId = selectedCategoryId === categoryId ? null : categoryId
      onCategoryFilter(newCategoryId)
    }
  }

  const handleColorClick = (colorId: number) => {
    if (onColorFilter) {
      // Se a cor já está selecionada, deselecionar (mostrar todas)
      const newColorId = selectedColorId === colorId ? null : colorId
      onColorFilter(newColorId)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const clearAllFilters = () => {
    if (onCategoryFilter) onCategoryFilter(null)
    if (onColorFilter) onColorFilter(null)
    setSearchTerm('')
  }

  const hasActiveFilters = selectedCategoryId !== null || selectedColorId !== null

  // Filtrar categorias por busca
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar cores por busca
  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading state
  if (loading) {
    return (
      <>
        <div className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-orange-500 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen`}>
          <div className="pt-20 px-4 pb-4 space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-orange-400 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-orange-400 rounded"></div>
                ))}
              </div>
              <div className="h-4 bg-orange-400 rounded w-1/2 mb-3 mt-6"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-orange-400 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {isOpen && (
          <div
            className="fixed top-16 left-0 right-0 bottom-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <div className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-orange-500 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen`}>
          <div className="pt-20 px-4 pb-4">
            <div className="text-center text-white text-sm bg-orange-600 p-3 rounded">
              {error}
            </div>
          </div>
        </div>
        {isOpen && (
          <div
            className="fixed top-16 left-0 right-0 bottom-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 w-64 bg-primary transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static shadow-lg`} style={{ height: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-primary/90 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-white" />
            <h2 className="font-semibold text-white text-lg">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-primary/80 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">

          {/* Marcas */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Marcas</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <BrandSection key={brand.id} brand={brand} />
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-left font-semibold text-white mb-3 text-sm uppercase tracking-wide hover:text-orange-100 transition-colors"
            >
              <span>Categorias</span>
              {expandedSections.categories ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.categories && (
              <div className="space-y-1">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.slug}`}
                    className={`block w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-orange-600 text-white font-medium'
                        : 'text-orange-50 hover:text-white hover:bg-orange-600'
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cores */}
          <div>
            <button
              onClick={() => toggleSection('colors')}
              className="flex items-center justify-between w-full text-left font-semibold text-white mb-3 text-sm uppercase tracking-wide hover:text-orange-100 transition-colors"
            >
              <span>Cores</span>
              {expandedSections.colors ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.colors && (
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorClick(color.id)}
                    className={`group relative p-1.5 rounded transition-colors ${
                      selectedColorId === color.id
                        ? 'bg-orange-600 ring-2 ring-white'
                        : 'hover:bg-orange-600'
                    }`}
                    title={color.name}
                  >
                    <div 
                      className={`w-6 h-6 rounded border-2 ${
                        selectedColorId === color.id
                          ? 'border-white'
                          : 'border-orange-200'
                      }`}
                      style={{ backgroundColor: color.hexCode || '#cccccc' }}
                    />
                    {selectedColorId === color.id && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtros Ativos */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-orange-400">
              <h4 className="font-semibold text-white mb-2 text-xs uppercase tracking-wide">Filtros Ativos</h4>
              <div className="space-y-2">
                {selectedCategoryId && (
                  <div className="flex items-center justify-between bg-orange-600 px-3 py-2 rounded text-sm">
                    <span className="text-white font-medium">
                      {categories.find(c => c.id === selectedCategoryId)?.name}
                    </span>
                    <button
                      onClick={() => onCategoryFilter?.(null)}
                      className="text-white hover:text-orange-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {selectedColorId && (
                  <div className="flex items-center justify-between bg-orange-600 px-3 py-2 rounded text-sm">
                    <span className="text-white font-medium">
                      {colors.find(c => c.id === selectedColorId)?.name}
                    </span>
                    <button
                      onClick={() => onColorFilter?.(null)}
                      className="text-white hover:text-orange-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
