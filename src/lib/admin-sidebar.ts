import { 
  LayoutDashboard, 
  FolderOpen, 
  Package, 
  Settings, 
  Ruler, 
  Palette, 
  BarChart3, 
  Layers,
  ShoppingCart,
  Users,
  FileText,
  User,
  Tag,
  Store,
  Layout,
  Image as ImageIcon,
  UserCheck,
  FileText as FileTextIcon,
  Bell,
  Megaphone,
  Target,
  Gift,
  Percent
} from 'lucide-react'

export interface SidebarMenuItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

export interface SidebarMenuSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: SidebarMenuItem[]
  isExpanded?: boolean
}

// Menu completo para ADMIN
export const ADMIN_SIDEBAR_CONFIG: SidebarMenuSection[] = [
  {
    id: 'main',
    label: 'Principal',
    icon: LayoutDashboard,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
      },
      {
        id: 'orders',
        label: 'Pedidos',
        href: '/admin/orders',
        icon: ShoppingCart
      },
      {
        id: 'customers',
        label: 'Clientes',
        href: '/admin/customers',
        icon: Users
      },
      {
        id: 'sellers',
        label: 'Vendedores',
        href: '/admin/sellers',
        icon: UserCheck
      },
      {
        id: 'products',
        label: 'Produtos',
        href: '/admin/products',
        icon: Package
      },
      {
        id: 'categories',
        label: 'Categorias',
        href: '/admin/categories',
        icon: FolderOpen
      }
    ]
  },
  {
    id: 'characteristics',
    label: 'Características',
    icon: Settings,
    items: [
      {
        id: 'sizes',
        label: 'Tamanhos',
        href: '/admin/characteristics/sizes',
        icon: Ruler
      },
      {
        id: 'colors',
        label: 'Cores',
        href: '/admin/characteristics/colors',
        icon: Palette
      },
      {
        id: 'grades',
        label: 'Grades',
        href: '/admin/characteristics/grades',
        icon: BarChart3
      },
      {
        id: 'collections',
        label: 'Coleções',
        href: '/admin/characteristics/collections',
        icon: Layers
      },
      {
        id: 'genders',
        label: 'Gêneros',
        href: '/admin/characteristics/genders',
        icon: User
      },
      {
        id: 'brands',
        label: 'Marcas',
        href: '/admin/characteristics/brands',
        icon: Tag
      }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    items: [
      {
        id: 'campaigns',
        label: 'Campanhas',
        href: '/admin/marketing/campaigns',
        icon: Target
      },
      {
        id: 'coupons',
        label: 'Cupons',
        href: '/admin/marketing/coupons',
        icon: Percent
      },
      {
        id: 'promotions',
        label: 'Promoções',
        href: '/admin/marketing/promotions',
        icon: Gift
      }
    ]
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: Layout,
    items: [
      {
        id: 'slider',
        label: 'Slider',
        href: '/admin/layout/slider',
        icon: ImageIcon
      },
      {
        id: 'pages',
        label: 'Páginas',
        href: '/admin/layout/pages',
        icon: FileTextIcon
      }
    ]
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    items: [
      {
        id: 'reports',
        label: 'Relatórios',
        href: '/admin/reports',
        icon: FileText
      }
    ]
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    items: [
      {
        id: 'store',
        label: 'Loja',
        href: '/admin/settings/store',
        icon: Store
      },
      {
        id: 'users',
        label: 'Usuários do Sistema',
        href: '/admin/settings/users',
        icon: Users
      },
      {
        id: 'notifications',
        label: 'Notificações',
        href: '/admin/settings/notifications',
        icon: Bell
      }
    ]
  }
]

// Menu simplificado para VENDEDORES
export const SELLER_SIDEBAR_CONFIG: SidebarMenuSection[] = [
  {
    id: 'main',
    label: 'Principal',
    icon: LayoutDashboard,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
      },
      {
        id: 'orders',
        label: 'Meus Pedidos',
        href: '/admin/orders',
        icon: ShoppingCart
      },
      {
        id: 'customers',
        label: 'Meus Clientes',
        href: '/admin/customers',
        icon: Users
      },
      {
        id: 'products',
        label: 'Catálogo',
        href: '/admin/products',
        icon: Package
      }
    ]
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    items: [
      {
        id: 'reports',
        label: 'Minhas Vendas',
        href: '/admin/reports',
        icon: FileText
      }
    ]
  }
]

// Função para obter menu baseado no role
export const getSidebarConfig = (role?: 'admin' | 'seller' | 'customer'): SidebarMenuSection[] => {
  console.log('🔍 getSidebarConfig - Role recebido:', role)
  console.log('🔍 getSidebarConfig - Role é seller?', role === 'seller')
  
  if (role === 'seller') {
    console.log('✅ Retornando SELLER_SIDEBAR_CONFIG')
    return SELLER_SIDEBAR_CONFIG
  }
  
  console.log('✅ Retornando ADMIN_SIDEBAR_CONFIG')
  return ADMIN_SIDEBAR_CONFIG
}

export const SIDEBAR_STYLES = {
  container: 'w-64 bg-black flex flex-col min-h-screen border-r border-gray-800',
  header: 'p-6 border-b border-gray-800',
  logo: 'w-12 h-12 flex-shrink-0 bg-primary/20 rounded-lg flex items-center justify-center',
  logoIcon: 'w-6 h-6 text-primary',
  title: 'text-xl font-bold truncate text-white',
  subtitle: 'text-xs text-gray-400 mt-1',
  nav: 'flex-1 py-4',
  navContent: 'px-4 space-y-1',
  button: 'w-full justify-start text-gray-300 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-lg px-4 py-2.5 font-medium',
  buttonActive: 'bg-primary text-white',
  buttonExpanded: 'w-full justify-between text-gray-300 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-lg px-4 py-2.5 font-medium',
  submenu: 'ml-6 space-y-1 mt-1 border-l-2 border-gray-800 pl-3',
  submenuButton: 'w-full justify-start text-sm text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-lg px-3 py-2',
  submenuButtonActive: 'bg-primary text-white'
} as const

export const getPageName = (pathname: string): string => {
  const pageNames: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/categories': 'Categorias',
    '/admin/products': 'Produtos',
    '/admin/characteristics/sizes': 'Tamanhos',
    '/admin/characteristics/colors': 'Cores',
    '/admin/characteristics/grades': 'Grades',
    '/admin/characteristics/collections': 'Coleções',
    '/admin/characteristics/genders': 'Gêneros',
    '/admin/characteristics/brands': 'Marcas',
    '/admin/orders': 'Pedidos',
    '/admin/customers': 'Clientes',
    '/admin/sellers': 'Vendedores',
    '/admin/reports': 'Relatórios',
    '/admin/layout/slider': 'Slider da Home',
    '/admin/layout/pages': 'Páginas',
    '/admin/settings/store': 'Configurações da Loja',
    '/admin/settings/users': 'Usuários do Sistema',
    '/admin/settings/notifications': 'Notificações'
  }
  
  return pageNames[pathname] || 'Admin'
}
