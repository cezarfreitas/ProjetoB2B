'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { 
  ColorStatsCards,
  ColorsFilters,
  ColorsDataTable,
  ErrorAlert
} from '@/components/admin/colors'

interface Color {
  id: number
  name: string
  hexCode: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ColorFilters {
  status?: string
  search?: string
}

export default function ColorsPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<ColorFilters>({})
  
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar cores do banco de dados
  const loadColors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/colors')
      if (!response.ok) {
        throw new Error('Erro ao carregar cores')
      }
      const data = await response.json()
      setColors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar cores quando o componente montar
  useEffect(() => {
    loadColors()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateColor = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar cor')
      }

      setIsCreateDialogOpen(false)
      loadColors() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cor')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditColor = useCallback(async (formData: any) => {
    if (!editingColor) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/colors/${editingColor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar cor')
      }

      setIsEditDialogOpen(false)
      setEditingColor(null)
      loadColors() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cor')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingColor])

  const handleDeleteColor = useCallback(async (colorId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/colors/${colorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir cor')
      }

      loadColors() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cor')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((color: Color) => {
    setEditingColor(color)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingColor(null)
  }, [])

  // Filtrar cores baseado nos filtros
  const filteredColors = colors.filter(color => {
    if (filters.search && !color.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !color.isActive) {
      return false
    }
    if (filters.status === 'inactive' && color.isActive) {
      return false
    }
    return true
  })

  // Estatísticas para os cards
  const stats = {
    totalColors: colors.length,
    activeColors: colors.filter(color => color.isActive).length,
    inactiveColors: colors.filter(color => !color.isActive).length,
    colorsWithHex: colors.filter(color => color.hexCode).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando cores...</p>
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
            Cores <span className="text-sm font-normal text-gray-600">- Gerencie as cores disponíveis</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Cor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Cor</DialogTitle>
            </DialogHeader>
            <ColorForm onSubmit={handleCreateColor} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <ColorStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <ColorsFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Cores */}
      <ColorsDataTable
        colors={filteredColors}
        onEdit={openEditModal}
        onDelete={handleDeleteColor}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cor</DialogTitle>
          </DialogHeader>
          {editingColor && (
            <ColorForm 
              color={editingColor} 
              onSubmit={handleEditColor}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de cor
function ColorForm({ color, onSubmit }: { color?: Color | null, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: color?.name || '',
    hexCode: color?.hexCode || '',
    isActive: color?.isActive ?? true
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
          placeholder="Ex: Preto, Branco, Azul"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hexCode">Código Hexadecimal (opcional)</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="hexCode"
            value={formData.hexCode}
            onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
            placeholder="#000000"
            className="flex-1"
          />
          {formData.hexCode && (
            <div 
              className="w-10 h-10 rounded border border-gray-300"
              style={{ backgroundColor: formData.hexCode }}
              title={formData.hexCode}
            />
          )}
        </div>
        <p className="text-xs text-gray-500">
          Digite o código hexadecimal da cor (ex: #FF0000 para vermelho)
        </p>
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
          {color ? 'Salvar Alterações' : 'Criar Cor'}
        </Button>
      </DialogFooter>
    </form>
  )
}

