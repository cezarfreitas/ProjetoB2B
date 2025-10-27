'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { 
  GenderStatsCards,
  GendersFilters,
  GendersDataTable,
  ErrorAlert
} from '@/components/admin/genders'

interface Gender {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface GenderFilters {
  status?: string
  search?: string
}

export default function GendersPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<GenderFilters>({})
  
  const [genders, setGenders] = useState<Gender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGender, setEditingGender] = useState<Gender | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar gêneros do banco de dados
  const loadGenders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/genders')
      if (!response.ok) {
        throw new Error('Erro ao carregar gêneros')
      }
      const data = await response.json()
      setGenders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar gêneros quando o componente montar
  useEffect(() => {
    loadGenders()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateGender = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/genders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar gênero')
      }

      setIsCreateDialogOpen(false)
      loadGenders() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar gênero')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditGender = useCallback(async (formData: any) => {
    if (!editingGender) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/genders/${editingGender.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar gênero')
      }

      setIsEditDialogOpen(false)
      setEditingGender(null)
      loadGenders() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar gênero')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingGender])

  const handleDeleteGender = useCallback(async (genderId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/genders/${genderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir gênero')
      }

      loadGenders() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir gênero')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((gender: Gender) => {
    setEditingGender(gender)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingGender(null)
  }, [])

  // Filtrar gêneros baseado nos filtros
  const filteredGenders = genders.filter(gender => {
    if (filters.search && !gender.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !gender.isActive) {
      return false
    }
    if (filters.status === 'inactive' && gender.isActive) {
      return false
    }
    return true
  })

  // Estatísticas para os cards
  const stats = {
    totalGenders: genders.length,
    activeGenders: genders.filter(gender => gender.isActive).length,
    inactiveGenders: genders.filter(gender => !gender.isActive).length,
    gendersWithDescription: genders.filter(gender => gender.description).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando gêneros...</p>
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
            Gêneros <span className="text-sm font-normal text-gray-600">- Gerencie os gêneros disponíveis</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Gênero
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Gênero</DialogTitle>
            </DialogHeader>
            <GenderForm onSubmit={handleCreateGender} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <GenderStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <GendersFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Gêneros */}
      <GendersDataTable
        genders={filteredGenders}
        onEdit={openEditModal}
        onDelete={handleDeleteGender}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Gênero</DialogTitle>
          </DialogHeader>
          {editingGender && (
            <GenderForm 
              gender={editingGender} 
              onSubmit={handleEditGender}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de gênero
function GenderForm({ 
  gender, 
  onSubmit
}: { 
  gender?: Gender | null, 
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: gender?.name || '',
    description: gender?.description || '',
    isActive: gender?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Masculino, Feminino, Unissex"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o gênero..."
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive">Ativo</Label>
      </div>

      <DialogFooter>
        <Button type="submit">
          {gender ? 'Salvar Alterações' : 'Criar Gênero'}
        </Button>
      </DialogFooter>
    </form>
  )
}
