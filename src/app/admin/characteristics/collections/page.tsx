'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { 
  CollectionStatsCards,
  CollectionsFilters,
  CollectionsDataTable,
  ErrorAlert
} from '@/components/admin/collections'

interface Collection {
  id: number
  name: string
  description: string | null
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CollectionFilters {
  status?: string
  search?: string
}

export default function CollectionsPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<CollectionFilters>({})
  
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar coleções do banco de dados
  const loadCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/collections')
      if (!response.ok) {
        throw new Error('Erro ao carregar coleções')
      }
      const data = await response.json()
      setCollections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar coleções quando o componente montar
  useEffect(() => {
    loadCollections()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateCollection = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar coleção')
      }

      setIsCreateDialogOpen(false)
      loadCollections() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar coleção')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditCollection = useCallback(async (formData: any) => {
    if (!editingCollection) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/collections/${editingCollection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar coleção')
      }

      setIsEditDialogOpen(false)
      setEditingCollection(null)
      loadCollections() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar coleção')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingCollection])

  const handleDeleteCollection = useCallback(async (collectionId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/collections/${collectionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir coleção')
      }

      loadCollections() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir coleção')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((collection: Collection) => {
    setEditingCollection(collection)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingCollection(null)
  }, [])

  // Filtrar coleções baseado nos filtros
  const filteredCollections = collections.filter(collection => {
    if (filters.search && !collection.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !collection.isActive) {
      return false
    }
    if (filters.status === 'inactive' && collection.isActive) {
      return false
    }
    return true
  })

  // Estatísticas para os cards
  const stats = {
    totalCollections: collections.length,
    activeCollections: collections.filter(collection => collection.isActive).length,
    inactiveCollections: collections.filter(collection => !collection.isActive).length,
    collectionsWithDescription: collections.filter(collection => collection.description).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando coleções...</p>
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
            Coleções <span className="text-sm font-normal text-gray-600">- Gerencie as coleções de produtos</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Coleção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Coleção</DialogTitle>
            </DialogHeader>
            <CollectionForm onSubmit={handleCreateCollection} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <CollectionStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <CollectionsFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Coleções */}
      <CollectionsDataTable
        collections={filteredCollections}
        onEdit={openEditModal}
        onDelete={handleDeleteCollection}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coleção</DialogTitle>
          </DialogHeader>
          {editingCollection && (
            <CollectionForm 
              collection={editingCollection} 
              onSubmit={handleEditCollection}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de coleção
function CollectionForm({ 
  collection, 
  onSubmit
}: { 
  collection?: Collection | null, 
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    slug: collection?.slug || '',
    isActive: collection?.isActive ?? true
  })

  // Função para gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ex: Verão 2024, Clássicos, Esportivos"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="verao-2024"
          required
        />
        <p className="text-xs text-gray-500">
          URL amigável para a coleção (gerado automaticamente)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva a coleção..."
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
          {collection ? 'Salvar Alterações' : 'Criar Coleção'}
        </Button>
      </DialogFooter>
    </form>
  )
}
