'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Layers, CheckCircle, XCircle, Hash } from 'lucide-react'

interface GradeStats {
  totalGrades: number
  activeGrades: number
  inactiveGrades: number
  totalPairs: number
}

interface GradeStatsCardsProps {
  stats: GradeStats
  loading?: boolean
}

export function GradeStatsCards({ stats, loading = false }: GradeStatsCardsProps) {
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
      {/* Total de Grades */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalGrades)}</p>
              <p className="text-xs text-gray-400">Total de Grades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Ativas */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.activeGrades)}</p>
              <p className="text-xs text-gray-400">Grades Ativas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Inativas */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.inactiveGrades)}</p>
              <p className="text-xs text-gray-400">Grades Inativas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total de Pares */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{formatNumber(stats.totalPairs)}</p>
              <p className="text-xs text-gray-400">Total de Pares</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
