'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen, CheckCircle, XCircle, Hash } from 'lucide-react'

interface CollectionStats {
  totalCollections: number
  activeCollections: number
  inactiveCollections: number
  collectionsWithDescription: number
}

interface CollectionStatsCardsProps {
  stats: CollectionStats
  loading?: boolean
}

export function CollectionStatsCards({ stats, loading = false }: CollectionStatsCardsProps) {
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
      {/* Total de Coleções */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalCollections)}</p>
              <p className="text-xs text-gray-400">Total de Coleções</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coleções Ativas */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.activeCollections)}</p>
              <p className="text-xs text-gray-400">Coleções Ativas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coleções Inativas */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.inactiveCollections)}</p>
              <p className="text-xs text-gray-400">Coleções Inativas</p>
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
              <p className="text-sm font-bold text-white">{formatNumber(stats.collectionsWithDescription)}</p>
              <p className="text-xs text-gray-400">Com Descrição</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
