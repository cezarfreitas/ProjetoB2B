'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { 
  SizeStatsCards,
  SizesFilters,
  SizesDataTable,
  ErrorAlert
} from '@/components/admin/sizes'

interface Size {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SizeFilters {
  status?: string
  search?: string
}

export default function SizesPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<SizeFilters>({})
  
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar tamanhos do banco de dados
  const loadSizes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/sizes')
      if (!response.ok) {
        throw new Error('Erro ao carregar tamanhos')
      }
      const data = await response.json()
      setSizes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar tamanhos quando o componente montar
  useEffect(() => {
    loadSizes()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateSize = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar tamanho')
      }

      setIsCreateDialogOpen(false)
      loadSizes() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tamanho')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditSize = useCallback(async (formData: any) => {
    if (!editingSize) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/sizes/${editingSize.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar tamanho')
      }

      setIsEditDialogOpen(false)
      setEditingSize(null)
      loadSizes() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tamanho')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingSize])

  const handleDeleteSize = useCallback(async (sizeId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/sizes/${sizeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir tamanho')
      }

      loadSizes() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tamanho')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((size: Size) => {
    setEditingSize(size)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingSize(null)
  }, [])

  // Filtrar tamanhos baseado nos filtros
  const filteredSizes = sizes.filter(size => {
    if (filters.search && !size.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !size.isActive) {
      return false
    }
    if (filters.status === 'inactive' && size.isActive) {
      return false
    }
    return true
  })

  // Estatísticas para os cards
  const stats = {
    totalSizes: sizes.length,
    activeSizes: sizes.filter(size => size.isActive).length,
    inactiveSizes: sizes.filter(size => !size.isActive).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando tamanhos...</p>
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
            Tamanhos <span className="text-sm font-normal text-gray-600">- Gerencie os tamanhos disponíveis</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tamanho
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Tamanho</DialogTitle>
            </DialogHeader>
            <SizeForm onSubmit={handleCreateSize} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <SizeStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <SizesFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Tamanhos */}
      <SizesDataTable
        sizes={filteredSizes}
        onEdit={openEditModal}
        onDelete={handleDeleteSize}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tamanho</DialogTitle>
          </DialogHeader>
          {editingSize && (
            <SizeForm 
              size={editingSize} 
              onSubmit={handleEditSize}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de tamanho
function SizeForm({ size, onSubmit }: { size?: Size | null, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: size?.name || '',
    isActive: size?.isActive ?? true
  })

  // Atualizar formData quando size mudar
  useEffect(() => {
    setFormData({
      name: size?.name || '',
      isActive: size?.isActive ?? true
    })
  }, [size])

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
          placeholder="Ex: 35, 36, 37, P, M, G"
          required
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
          {size ? 'Salvar Alterações' : 'Criar Tamanho'}
        </Button>
      </DialogFooter>
    </form>
  )
}
