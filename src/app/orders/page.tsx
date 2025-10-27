'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ShoppingBag,
  ArrowRight
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  totalAmount: number
  status: string
  paymentStatus: string
  items: any[]
  shippingAddress?: any
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  useEffect(() => {
    filterAndSortOrders()
  }, [orders, searchTerm, statusFilter, sortBy])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('Erro ao carregar pedidos')
      }
    } catch (err) {
      setError('Erro ao carregar pedidos')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortOrders = () => {
    let filtered = [...orders]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some((item: any) => 
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        case 'oldest':
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        case 'amount_high':
          return b.totalAmount - a.totalAmount
        case 'amount_low':
          return a.totalAmount - b.totalAmount
        default:
          return 0
      }
    })

    setFilteredOrders(filtered)
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Pendente', 
        icon: Clock,
        description: 'Aguardando confirmação'
      },
      CONFIRMED: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'Confirmado', 
        icon: CheckCircle,
        description: 'Pedido confirmado'
      },
      PROCESSING: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        text: 'Processando', 
        icon: Package,
        description: 'Preparando pedido'
      },
      SHIPPED: { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        text: 'Enviado', 
        icon: Truck,
        description: 'A caminho'
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Entregue', 
        icon: CheckCircle,
        description: 'Entregue com sucesso'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Cancelado', 
        icon: AlertCircle,
        description: 'Pedido cancelado'
      }
    }
    return configs[status as keyof typeof configs] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      text: status, 
      icon: Clock,
      description: 'Status desconhecido'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando seus pedidos...</h2>
            <p className="text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
              <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-sm text-gray-600">Total de Pedidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'DELIVERED').length}
                    </p>
                    <p className="text-sm text-gray-600">Entregues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'SHIPPED').length}
                    </p>
                    <p className="text-sm text-gray-600">Enviados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e Busca */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="PROCESSING">Processando</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="amount_high">Maior valor</SelectItem>
                  <SelectItem value="amount_low">Menor valor</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setSortBy('newest')
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredOrders.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {orders.length === 0 ? 'Nenhum pedido encontrado' : 'Nenhum pedido corresponde aos filtros'}
              </h3>
              <p className="text-gray-600 mb-6">
                {orders.length === 0 
                  ? 'Você ainda não fez nenhum pedido. Que tal começar a comprar?' 
                  : 'Tente ajustar os filtros de busca para encontrar seus pedidos.'
                }
              </p>
              <div className="space-y-3">
                <Button asChild>
                  <Link href="/catalog">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Ver Catálogo
                  </Link>
                </Button>
                {orders.length > 0 && (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setSortBy('newest')
                  }}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Informações principais */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <StatusIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Pedido #{order.orderNumber}
                              </h3>
                              <Badge className={statusConfig.color}>
                                {statusConfig.text}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {statusConfig.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.orderDate)}
                            </p>
                          </div>
                        </div>

                        {/* Itens do pedido */}
                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pl-12">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </p>
                              <div className="space-y-2">
                                {order.items.slice(0, 2).map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 truncate flex-1 mr-2">
                                      {item.productName}
                                      {item.variantName && (
                                        <span className="text-gray-400 ml-1">({item.variantName})</span>
                                      )}
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                      {item.quantity}x {formatCurrency(item.unitPrice)}
                                    </span>
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <p className="text-sm text-gray-500 pt-1 border-t">
                                    + {order.items.length - 2} {order.items.length - 2 === 1 ? 'item' : 'itens'} adicionais
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Valor e ações */}
                      <div className="flex flex-col lg:items-end gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">Total do pedido</p>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="w-full lg:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}