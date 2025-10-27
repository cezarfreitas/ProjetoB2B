'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'

interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  pendingApproval: number
}

interface CustomerStatsCardsProps {
  stats: CustomerStats
  loading?: boolean
}

export function CustomerStatsCards({ stats, loading = false }: CustomerStatsCardsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-black border-gray-800">
            <CardContent className="p-2 pl-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Total de Clientes */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalCustomers)}</p>
              <p className="text-xs text-gray-400">Total de Clientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clientes Ativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.activeCustomers)}</p>
              <p className="text-xs text-gray-400">Clientes Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clientes Inativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <UserX className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.inactiveCustomers)}</p>
              <p className="text-xs text-gray-400">Clientes Inativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aguardando Aprovação */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.pendingApproval)}</p>
              <p className="text-xs text-gray-400">Aguardando Aprovação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

