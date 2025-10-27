'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, CheckCircle, XCircle, Hash } from 'lucide-react'

interface GenderStats {
  totalGenders: number
  activeGenders: number
  inactiveGenders: number
  gendersWithDescription: number
}

interface GenderStatsCardsProps {
  stats: GenderStats
  loading?: boolean
}

export function GenderStatsCards({ stats, loading = false }: GenderStatsCardsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Total de Gêneros */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalGenders)}</p>
              <p className="text-xs text-gray-400">Total de Gêneros</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gêneros Ativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.activeGenders)}</p>
              <p className="text-xs text-gray-400">Gêneros Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gêneros Inativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.inactiveGenders)}</p>
              <p className="text-xs text-gray-400">Gêneros Inativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Com Descrição */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.gendersWithDescription)}</p>
              <p className="text-xs text-gray-400">Com Descrição</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
