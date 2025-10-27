'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

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

interface AllCategory {
  id: number
  name: string
  slug: string
  productCount: number
  brandName?: string
}

interface DesktopMenuProps {
  brands: Brand[]
  allCategories: AllCategory[]
  isScrolled: boolean
  storeName: string
  logoUrl: string
}

export default function DesktopMenu({ 
  brands, 
  allCategories, 
  isScrolled, 
  storeName, 
  logoUrl 
}: DesktopMenuProps) {
  const [openSubmenu, setOpenSubmenu] = useState<number | string | null>(null)

  const handleMouseEnter = (submenuId: number | string) => {
    setOpenSubmenu(submenuId)
  }

  const handleMouseLeave = () => {
    setOpenSubmenu(null)
  }

  return (
    <div className={`hidden md:block bg-gray-900 border-b border-gray-800 shadow-md ${isScrolled ? 'fixed top-0 left-0 right-0 z-50' : 'sticky top-0 z-50'}`}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className={`flex items-center ${isScrolled ? 'justify-between' : 'justify-center'} w-full`}>
          {/* Logo - aparece quando fixo */}
          {isScrolled && (
            <Link href="/" className="flex items-center group flex-shrink-0 hover:opacity-90 transition-opacity">
              {logoUrl ? (
                <div className="relative w-16 h-10 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={logoUrl}
                    alt={storeName || 'Logo'}
                    fill
                    sizes="64px"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  {storeName}
                </span>
              )}
            </Link>
          )}
          
          <nav className={`flex items-center h-12 ${isScrolled ? 'flex-1 justify-between' : 'justify-between'} flex-wrap w-full`}>
            {/* Container para itens de navegação */}
            <div className="flex items-center justify-evenly w-full">
              {/* Todas as Categorias com Submenu */}
              <div
                className="relative group"
                onMouseEnter={() => handleMouseEnter('all-categories')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/catalog"
                  className={`text-white hover:text-primary font-medium text-sm transition-all duration-300 inline-flex items-center gap-1.5 py-2 px-4 rounded-lg hover:bg-white/5 whitespace-nowrap ${
                    openSubmenu === 'all-categories' ? 'text-primary bg-white/5' : ''
                  }`}
                >
                  Todas as Categorias
                  <ChevronDown 
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${openSubmenu === 'all-categories' ? 'rotate-180' : ''}`} 
                  />
                </Link>
                
                {/* Dropdown de Todas as Categorias */}
                {openSubmenu === 'all-categories' && allCategories.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 min-w-80">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Todas as Categorias
                          </h4>
                        </div>
                        <div className="py-1 max-h-96 overflow-y-auto custom-scrollbar">
                          {allCategories.map((category) => (
                            <Link
                              key={`${category.id}-${category.brandName}`}
                              href={`/category/${category.slug}`}
                              className="group flex items-center justify-between px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 border-l-2 border-transparent hover:border-primary"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {category.name}
                                </span>
                                {category.brandName && (
                                  <span className="text-xs text-gray-400">
                                    {category.brandName}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 group-hover:text-primary transition-colors">
                                ({category.productCount})
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              {brands.length > 0 && (
                <div className="h-6 w-px bg-gray-700"></div>
              )}

              {/* Marcas com Submenus de Categorias */}
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(brand.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={`/catalog?brand=${brand.slug}`}
                    className={`text-white hover:text-primary font-medium text-sm transition-all duration-300 inline-flex items-center gap-1.5 py-2 px-4 rounded-lg hover:bg-white/5 whitespace-nowrap ${
                      openSubmenu === brand.id ? 'text-primary bg-white/5' : ''
                    }`}
                  >
                    {brand.name}
                    {brand.categories.length > 0 && (
                      <ChevronDown 
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${openSubmenu === brand.id ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </Link>
                  
                  {/* Dropdown de Categorias */}
                  {brand.categories.length > 0 && openSubmenu === brand.id && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 min-w-64">
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Categorias de {brand.name}
                            </h4>
                          </div>
                          <div className="py-1 max-h-96 overflow-y-auto custom-scrollbar">
                            {brand.categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/catalog?brand=${brand.slug}&category=${category.slug}`}
                                className="group flex items-center justify-between px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 border-l-2 border-transparent hover:border-primary"
                              >
                                <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {category.name}
                                </span>
                                <span className="text-xs text-gray-500 group-hover:text-primary transition-colors">
                                  ({category.productCount})
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

