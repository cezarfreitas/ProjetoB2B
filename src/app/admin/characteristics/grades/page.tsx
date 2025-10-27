'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { 
  GradeStatsCards,
  GradesFilters,
  GradesDataTable,
  ErrorAlert
} from '@/components/admin/grades'

interface Grade {
  id: number
  name: string
  slug: string
  description: string | null
  sizes: Record<string, number>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface GradeFilters {
  status?: string
  search?: string
}

export default function GradesPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<GradeFilters>({})
  
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar grades do banco de dados
  const loadGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/grades')
      if (!response.ok) {
        throw new Error('Erro ao carregar grades')
      }
      const data = await response.json()
      setGrades(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar grades quando o componente montar
  useEffect(() => {
    loadGrades()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateGrade = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar grade')
      }

      setIsCreateDialogOpen(false)
      loadGrades() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grade')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditGrade = useCallback(async (formData: any) => {
    if (!editingGrade) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/grades/${editingGrade.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar grade')
      }

      setIsEditDialogOpen(false)
      setEditingGrade(null)
      loadGrades() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar grade')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingGrade])

  const handleDeleteGrade = useCallback(async (gradeId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/grades/${gradeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir grade')
      }

      loadGrades() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir grade')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((grade: Grade) => {
    setEditingGrade(grade)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingGrade(null)
  }, [])

  // Filtrar grades baseado nos filtros
  const filteredGrades = grades.filter(grade => {
    if (filters.search && !grade.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !grade.isActive) {
      return false
    }
    if (filters.status === 'inactive' && grade.isActive) {
      return false
    }
    return true
  })

  // Função para calcular total de pares
  const getTotalPairs = (sizes: Record<string, number>) => {
    return Object.values(sizes).reduce((sum, qty) => sum + qty, 0)
  }

  // Estatísticas para os cards
  const stats = {
    totalGrades: grades.length,
    activeGrades: grades.filter(grade => grade.isActive).length,
    inactiveGrades: grades.filter(grade => !grade.isActive).length,
    totalPairs: grades.reduce((sum, grade) => sum + getTotalPairs(grade.sizes), 0)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando grades...</p>
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
            Grades <span className="text-sm font-normal text-gray-600">- Gerencie as grades de tamanhos</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Grade
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[800px] max-w-[800px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Criar Nova Grade</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
              <GradeForm onSubmit={handleCreateGrade} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <GradeStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <GradesFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Grades */}
      <GradesDataTable
        grades={filteredGrades}
        onEdit={openEditModal}
        onDelete={handleDeleteGrade}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent className="w-[800px] max-w-[800px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Grade</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
            {editingGrade && (
              <GradeForm 
                grade={editingGrade} 
                onSubmit={handleEditGrade}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de grade
function GradeForm({ 
  grade, 
  onSubmit
}: { 
  grade?: Grade | null, 
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: grade?.name || '',
    slug: grade?.slug || '',
    description: grade?.description || '',
    sizes: grade?.sizes || {},
    isActive: grade?.isActive ?? true
  })

  const [availableSizes, setAvailableSizes] = useState<Array<{id: number, name: string, isActive: boolean}>>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [loadingSizes, setLoadingSizes] = useState(true)

  // Carregar tamanhos disponíveis
  useEffect(() => {
    const loadSizes = async () => {
      try {
        const response = await fetch('/api/characteristics/sizes')
        if (response.ok) {
          const sizes = await response.json()
          setAvailableSizes(sizes.filter((size: any) => size.isActive))
        }
      } catch (error) {
        console.error('Erro ao carregar tamanhos:', error)
      } finally {
        setLoadingSizes(false)
      }
    }
    loadSizes()
  }, [])

  // Inicializar tamanhos selecionados quando grade é carregada
  useEffect(() => {
    if (grade?.sizes) {
      setSelectedSizes(Object.keys(grade.sizes))
    }
  }, [grade])

  // Função para gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim('-') // Remove hífens das bordas
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleSizeSelection = (sizeName: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeName)) {
        // Remover tamanho
        const newSizes = { ...formData.sizes }
        delete newSizes[sizeName]
        setFormData(prevForm => ({
          ...prevForm,
          sizes: newSizes
        }))
        return prev.filter(s => s !== sizeName)
      } else {
        // Adicionar tamanho com quantidade padrão 1
        setFormData(prev => ({
          ...prev,
          sizes: {
            ...prev.sizes,
            [sizeName]: 1
          }
        }))
        return [...prev, sizeName]
      }
    })
  }

  const updateQuantity = (size: string, quantity: number) => {
    if (quantity > 0) {
      setFormData(prev => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          [size]: quantity
        }
      }))
    }
  }

  const getTotalPairs = () => {
    return Object.values(formData.sizes).reduce((sum, qty) => sum + qty, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Informações básicas */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nome da Grade *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData({ 
                  ...formData, 
                  name: name,
                  slug: generateSlug(name)
                })
              }}
              placeholder="Ex: Grade Feminina 35-40"
              className="h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Ex: grade-feminina-35-40"
              className="h-10 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500">URL amigável gerada automaticamente</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva a grade..."
            rows={2}
            className="resize-none"
          />
        </div>
      </div>
      
      {/* Layout horizontal em colunas para tamanhos */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Configuração de Tamanhos e Quantidades
        </h3>
        
        {loadingSizes ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Carregando tamanhos disponíveis...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Coluna 1: Seleção de tamanhos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Selecione os tamanhos</Label>
                <span className="text-xs text-gray-500">{selectedSizes.length} selecionado(s)</span>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {availableSizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => toggleSizeSelection(size.name)}
                    className={`p-3 text-sm rounded-lg border transition-all duration-200 font-medium ${
                      selectedSizes.includes(size.name)
                        ? 'bg-primary border-primary text-white shadow-md transform scale-105'
                        : 'bg-white border-gray-200 hover:bg-orange-50 hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Coluna 2: Configuração de quantidades */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Configure as quantidades</Label>
                {selectedSizes.length > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {getTotalPairs()} pares
                  </Badge>
                )}
              </div>
              {selectedSizes.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {selectedSizes.map((size) => (
                    <div key={size} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                      <span className="font-medium text-sm text-gray-700">{size}:</span>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.sizes[size] || 1}
                        onChange={(e) => updateQuantity(size, parseInt(e.target.value) || 1)}
                        className="w-20 h-8 text-center font-medium"
                      />
                    </div>
                  ))}
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-orange-200 rounded-lg text-center">
                    <span className="text-sm font-semibold text-primary">
                      Total: {getTotalPairs()} pares na grade
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-gray-500 text-center">
                    Selecione os tamanhos<br/>na coluna ao lado
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Status e botões */}
      <div className="bg-gray-50 p-4 rounded-lg border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Grade ativa
              </Label>
            </div>
            {Object.keys(formData.sizes).length > 0 && (
              <Badge variant={formData.isActive ? "default" : "secondary"} className="ml-2">
                {formData.isActive ? "Ativa" : "Inativa"}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {Object.keys(formData.sizes).length === 0 && (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Selecione pelo menos um tamanho
              </span>
            )}
            <Button 
              type="submit" 
              disabled={Object.keys(formData.sizes).length === 0}
              className="px-6 py-2 font-medium"
            >
              {grade ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Grade
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
