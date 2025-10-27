'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'
import {
  UserStatsCards,
  UserFilters,
  UserDataTable,
  ErrorAlert
} from '@/components/admin/users'

interface User {
  id: number
  name: string
  email: string
  whatsapp: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  permissions: string[]
}

interface UserFilters {
  status?: string
  search?: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersOnlineToday: number
  usersOnlineThisWeek: number
  newUsersThisMonth: number
}

export default function UsersPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<UserFilters>({})

  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersOnlineToday: 0,
    usersOnlineThisWeek: 0,
    newUsersThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar usuários do banco de dados
  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/settings/users?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/settings/users/stats')
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  // Carregar dados quando o componente montar ou filtros mudarem
  useEffect(() => {
    loadUsers()
  }, [filters])

  useEffect(() => {
    loadStats()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateUser = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/settings/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar usuário')
      }

      setIsCreateDialogOpen(false)
      loadUsers() // Recarregar a lista
      loadStats() // Recarregar estatísticas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditUser = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/settings/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar usuário')
      }

      loadUsers() // Recarregar a lista
      loadStats() // Recarregar estatísticas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleDeleteUser = useCallback(async (userId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/settings/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir usuário')
      }

      loadUsers() // Recarregar a lista
      loadStats() // Recarregar estatísticas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2.5 py-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Usuários do Sistema <span className="text-sm font-normal text-gray-600">- Gerencie usuários com acesso ao admin</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <UserStatsCards stats={stats} loading={statsLoading} />

      {/* Filtros */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Usuários */}
      <UserDataTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de usuário
function UserForm({
  onSubmit
}: {
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    isActive: true,
    permissions: [] as string[]
  })

  const availablePermissions = [
    'users', 'products', 'orders', 'customers', 'settings', 'reports', 'marketing'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: João Silva"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Ex: joao@admin.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          placeholder="Ex: (11) 99999-9999"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Permissões</Label>
        <div className="grid grid-cols-2 gap-2">
          {availablePermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <Checkbox
                id={permission}
                checked={formData.permissions.includes(permission)}
                onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
              />
              <Label htmlFor={permission} className="text-sm">
                {permission}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Usuário ativo</Label>
      </div>

      <DialogFooter>
        <Button type="submit">
          Criar Usuário
        </Button>
      </DialogFooter>
    </form>
  )
}
