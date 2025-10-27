'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserX, Shield, ShieldCheck, ShieldX, Activity, Calendar, TrendingUp } from 'lucide-react'

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersOnlineToday: number
  usersOnlineThisWeek: number
  newUsersThisMonth: number
}

interface UserStatsCardsProps {
  stats: UserStats
  loading?: boolean
}

export function UserStatsCards({ stats, loading = false }: UserStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      {/* Total de Usuários */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{stats.totalUsers}</p>
              <p className="text-xs text-gray-400">Total de Usuários</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Ativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{stats.activeUsers}</p>
              <p className="text-xs text-gray-400">Usuários Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Inativos */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <UserX className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{stats.inactiveUsers}</p>
              <p className="text-xs text-gray-400">Usuários Inativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Online Hoje */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{stats.usersOnlineToday}</p>
              <p className="text-xs text-gray-400">Online Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Novos Usuários Este Mês */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-2 pl-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{stats.newUsersThisMonth}</p>
              <p className="text-xs text-gray-400">Novos Este Mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
