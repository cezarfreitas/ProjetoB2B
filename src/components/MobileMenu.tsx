'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

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

interface User {
  id: string
  name: string
  email: string
  role?: 'admin' | 'seller' | 'customer'
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  brands: Brand[]
  allCategories: AllCategory[]
  isAuthenticated: boolean
  user: User | null
  onLoginClick: () => void
  onRegisterClick: () => void
  onGenerateLinkClick?: () => void
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  brands, 
  allCategories, 
  isAuthenticated,
  user,
  onLoginClick,
  onRegisterClick,
  onGenerateLinkClick
}: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="md:hidden bg-gray-900 border-t border-primary/20 animate-in slide-in-from-top duration-300">
      <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
        <nav className="space-y-2">
          {/* Marcas com Categorias */}
          {brands.map((brand, index) => (
            <div 
              key={brand.id} 
              className="animate-in slide-in-from-left duration-300"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <Link
                href={`/catalog?brand=${brand.slug}`}
                className="block text-white hover:text-primary font-semibold text-sm transition-all duration-200 py-2 px-3 rounded hover:bg-primary/10"
                onClick={onClose}
              >
                <div className="flex items-center justify-between">
                  <span>{brand.name}</span>
                  {brand.categories.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {brand.categories.length}
                    </span>
                  )}
                </div>
              </Link>
              
              {/* Categorias da Marca */}
              {brand.categories.length > 0 && (
                <div className="ml-3 space-y-1">
                  {brand.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/catalog?brand=${brand.slug}&category=${category.slug}`}
                      className="block text-gray-400 hover:text-white text-xs py-1 px-2 rounded hover:bg-primary/10 transition-all duration-200"
                      onClick={onClose}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Todas as Categorias */}
          {allCategories.length > 0 && (
            <div className="border-t border-primary/20 my-3">
              <h3 className="text-xs font-semibold text-white px-3 py-2">Todas as Categorias</h3>
              <div className="space-y-1">
                {allCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.slug}`}
                    className="block text-gray-400 hover:text-white text-xs py-1 px-3 rounded hover:bg-primary/10 transition-all duration-200"
                    onClick={onClose}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Menu para usuários autenticados */}
          {isAuthenticated && (
            <div className="border-t border-primary/20 my-3 space-y-1">
              <h3 className="text-xs font-semibold text-white px-3 py-2">
                {user?.role === 'seller' ? '🏷️ Área do Vendedor' : user?.role === 'admin' ? '👑 Administração' : 'Minha Conta'}
              </h3>
              
              {/* Menu VENDEDOR */}
              {user?.role === 'seller' && (
                <>
                  <button 
                    className="block w-full text-left text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={() => {
                      onGenerateLinkClick?.()
                      onClose()
                    }}
                  >
                    🔗 Gerar Link de Cadastro
                  </button>
                  <Link 
                    href="/seller/registration-links" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    📋 Lista de Links de Cadastro
                  </Link>
                  <Link 
                    href="/catalog" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    📦 Catálogo de Produtos
                  </Link>
                  <Link 
                    href="/seller/customers" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    👥 Meus Clientes
                  </Link>
                  <Link 
                    href="/seller/commissions" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    💰 Minhas Comissões
                  </Link>
                </>
              )}
              
              {/* Menu ADMIN */}
              {user?.role === 'admin' && (
                <>
                  <Link 
                    href="/admin" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Painel Admin
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Pedidos
                  </Link>
                </>
              )}
              
              {/* Menu CLIENTE */}
              {user?.role === 'customer' && (
                <>
                  <Link 
                    href="/profile" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Perfil
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Meus Pedidos
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block text-white hover:text-primary text-sm py-2 px-3 rounded hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Configurações
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Auth Section */}
          {!isAuthenticated && (
            <div className="border-t border-primary/20 pt-3 space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-center text-white border-white/20 hover:bg-white/10 hover:text-primary hover:border-primary text-sm transition-all"
                onClick={() => {
                  onLoginClick()
                  onClose()
                }}
              >
                Entrar
              </Button>
              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-orange-500 text-white hover:from-primary/90 hover:to-orange-500/90 text-sm font-semibold shadow-lg shadow-primary/30"
                onClick={() => {
                  onRegisterClick()
                  onClose()
                }}
              >
                Cadastrar
              </Button>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

