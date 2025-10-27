'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Hash, CheckCircle, XCircle } from 'lucide-react'

interface SizeStats {
  totalSizes: number
  activeSizes: number
  inactiveSizes: number
}

interface SizeStatsCardsProps {
  stats: SizeStats
  loading?: boolean
}

export function SizeStatsCards({ stats, loading = false }: SizeStatsCardsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {/* Total de Tamanhos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalSizes)}</p>
              <p className="text-xs text-gray-400">Total de Tamanhos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tamanhos Ativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.activeSizes)}</p>
              <p className="text-xs text-gray-400">Tamanhos Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tamanhos Inativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.inactiveSizes)}</p>
              <p className="text-xs text-gray-400">Tamanhos Inativos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
