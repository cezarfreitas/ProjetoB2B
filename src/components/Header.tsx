'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useStoreSettings } from '@/contexts/StoreSettingsContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Package,
  Settings,
  Menu,
  X,
  Search
} from 'lucide-react'
import CartDrawer from './CartDrawer'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'
import GenerateLinkModal from './seller/GenerateLinkModal'

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

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false)
  const { storeName, logoUrl, isLoading: settingsLoading } = useStoreSettings()
  const [brands, setBrands] = useState<Brand[]>([])
  const [allCategories, setAllCategories] = useState<AllCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Store settings agora vem do contexto StoreSettingsContext

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
          
          // Extrair todas as categorias de todas as marcas
          const allCats: AllCategory[] = []
          data.forEach((brand: Brand) => {
            brand.categories.forEach((cat) => {
              allCats.push({
                ...cat,
                brandName: brand.name
              })
            })
          })
          setAllCategories(allCats)
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error)
      }
    }
    fetchBrands()
  }, [])


  // Detectar scroll para fixar o header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Aplicar classe ao body quando o header estiver fixo
  useEffect(() => {
    if (isScrolled) {
      document.body.classList.add('header-fixed')
    } else {
      document.body.classList.remove('header-fixed')
    }

    return () => {
      document.body.classList.remove('header-fixed')
    }
  }, [isScrolled])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`
      setShowSearch(false)
    }
  }


  return (
    <header className="relative" style={{ zIndex: 1000 }}>
      {/* Main Header */}
      <div className="bg-black border-b border-gray-800" style={{ minHeight: '80px' }}>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative w-24 h-14">
                {settingsLoading || !isMounted ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg animate-pulse" />
                ) : logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={storeName || 'Logo'}
                    fill
                    sizes="96px"
                    className="object-contain"
                    priority
                    quality={100}
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg animate-pulse" />
                )}
              </div>
            </Link>

            {/* Search Bar - Always Visible */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-6 lg:mx-10">
              <form onSubmit={handleSearch} className="w-full group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary" />
                  </div>
                  <input
                    type="text"
                    placeholder="O que você está procurando?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-20 py-2.5 bg-white/95 border-2 border-transparent rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-1.5 flex items-center"
                  >
                    <span className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                      Buscar
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              {/* Search Button - Mobile Only */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden text-white hover:bg-white/10 hover:text-primary"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Botão contextual baseado no role */}
              {isAuthenticated && (
                <>
                  {/* Vendedor: Gerar Link de Cadastro */}
                  {user?.role === 'seller' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hidden lg:flex items-center gap-2 text-white hover:bg-white/10 hover:text-primary"
                      onClick={() => setIsGenerateLinkModalOpen(true)}
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden xl:inline">Gerar Link de Cadastro</span>
                    </Button>
                  )}
                  
                  {/* Admin e Cliente: Meus Pedidos */}
                  {user?.role !== 'seller' && (
                    <Link href="/orders">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hidden lg:flex items-center gap-2 text-white hover:bg-white/10 hover:text-primary"
                      >
                        <Package className="h-5 w-5" />
                        <span className="hidden xl:inline">Meus Pedidos</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-white hover:bg-white/10 hover:text-primary"
                onClick={() => setIsCartDrawerOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white rounded-full animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Auth */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-primary">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-[9999]">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.role && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          {user.role === 'seller' ? '🏷️ Vendedor' : user.role === 'admin' ? '👑 Admin' : '👤 Cliente'}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Menu para VENDEDORES */}
                    {user?.role === 'seller' && (
                      <>
                        <DropdownMenuItem onClick={() => setIsGenerateLinkModalOpen(true)}>
                          <User className="mr-2 h-4 w-4" />
                          Gerar Link de Cadastro
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller/registration-links" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Lista de Links de Cadastro
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/catalog" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Catálogo de Produtos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller/customers" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Meus Clientes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/seller/commissions" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Minhas Comissões
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Menu para ADMIN */}
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Painel Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Pedidos
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Menu para CLIENTES */}
                    {user?.role === 'customer' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders" className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Meus Pedidos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hover:text-primary font-medium"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Entrar
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary text-white hover:bg-primary/90 font-medium px-6"
                    onClick={() => setIsRegisterModalOpen(true)}
                  >
                    Cadastrar
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/10 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Search Bar Mobile */}
          {showSearch && (
            <div className="md:hidden bg-black pb-4 border-t border-white/10">
              <div className="max-w-[1600px] mx-auto px-4">
                <form onSubmit={handleSearch} className="pt-4 group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary" />
                    </div>
                    <input
                      type="text"
                      placeholder="O que você está procurando?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-24 py-3.5 bg-white/95 border-2 border-transparent rounded-xl text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                    >
                      <span className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                        Buscar
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Menu */}
      <DesktopMenu 
        brands={brands}
        allCategories={allCategories}
        isScrolled={isScrolled}
        storeName={storeName}
        logoUrl={logoUrl}
      />

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        brands={brands}
        allCategories={allCategories}
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onGenerateLinkClick={() => setIsGenerateLinkModalOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
      />

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false)
          setIsRegisterModalOpen(true)
        }}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />

      {/* Generate Link Modal (Seller) */}
      <GenerateLinkModal 
        isOpen={isGenerateLinkModalOpen} 
        onClose={() => setIsGenerateLinkModalOpen(false)}
      />
    </header>
  )
}