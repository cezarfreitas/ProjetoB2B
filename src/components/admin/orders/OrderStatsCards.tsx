'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react'

interface OrderStats {
  totalOrders: number
  totalValue: number
  totalItemsSold: number
  averageOrderValue: number
  unpaidOrders: number
}

interface OrderStatsCardsProps {
  stats: OrderStats
  loading?: boolean
}

export function OrderStatsCards({ stats, loading = false }: OrderStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-black border-gray-800">
            <CardContent className="p-2">
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                <div className="h-5 bg-gray-800 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      {/* Total de Pedidos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalOrders)}</p>
              <p className="text-xs text-gray-400">Total de Pedidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-400">Valor Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens Vendidos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalItemsSold)}</p>
              <p className="text-xs text-gray-400">Itens Vendidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatCurrency(stats.averageOrderValue)}</p>
              <p className="text-xs text-gray-400">Ticket Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos não Pagos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.unpaidOrders)}</p>
              <p className="text-xs text-gray-400">Pedidos não Pagos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}