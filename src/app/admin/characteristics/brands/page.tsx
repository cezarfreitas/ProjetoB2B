'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Plus, Edit, Image as ImageIcon, Globe, Upload, X } from 'lucide-react'
import { 
  BrandStatsCards,
  BrandsFilters,
  BrandsDataTable,
  ErrorAlert
} from '@/components/admin/brands'

interface Brand {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BrandFilters {
  status?: string
  search?: string
}

export default function BrandsPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<BrandFilters>({})
  
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar marcas do banco de dados
  const loadBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characteristics/brands')
      if (!response.ok) {
        throw new Error('Erro ao carregar marcas')
      }
      const data = await response.json()
      setBrands(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar marcas quando o componente montar
  useEffect(() => {
    loadBrands()
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateBrand = useCallback(async (formData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/characteristics/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar marca')
      }

      setIsCreateDialogOpen(false)
      loadBrands() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar marca')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleEditBrand = useCallback(async (formData: any) => {
    if (!editingBrand) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar marca')
      }

      setIsEditDialogOpen(false)
      setEditingBrand(null)
      loadBrands() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar marca')
    } finally {
      setIsSubmitting(false)
    }
  }, [editingBrand])

  const handleDeleteBrand = useCallback(async (brandId: number) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/characteristics/brands/${brandId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir marca')
      }

      loadBrands() // Recarregar a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir marca')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const openEditModal = useCallback((brand: Brand) => {
    setEditingBrand(brand)
    setIsEditDialogOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingBrand(null)
  }, [])

  // Filtrar marcas baseado nos filtros
  const filteredBrands = brands.filter(brand => {
    if (filters.search && !brand.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !brand.isActive) {
      return false
    }
    if (filters.status === 'inactive' && brand.isActive) {
      return false
    }
    return true
  })

  // Estatísticas para os cards
  const stats = {
    totalBrands: brands.length,
    activeBrands: brands.filter(brand => brand.isActive).length,
    inactiveBrands: brands.filter(brand => !brand.isActive).length,
    brandsWithLogo: brands.filter(brand => brand.logo_url).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando marcas...</p>
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
            Marcas <span className="text-sm font-normal text-gray-600">- Gerencie as marcas disponíveis</span>
          </h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[900px] w-[1200px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Marca</DialogTitle>
            </DialogHeader>
            <BrandForm onSubmit={handleCreateBrand} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <BrandStatsCards stats={stats} loading={false} />

      {/* Filtros */}
      <BrandsFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabela de Marcas */}
      <BrandsDataTable
        brands={filteredBrands}
        onEdit={openEditModal}
        onDelete={handleDeleteBrand}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditModal}>
        <DialogContent className="min-w-[900px] w-[1200px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
          </DialogHeader>
          {editingBrand && (
            <BrandForm 
              brand={editingBrand} 
              onSubmit={handleEditBrand}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}

// Componente do formulário de marca
function BrandForm({ 
  brand,
  onSubmit
}: { 
  brand?: Brand | null,
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    slug: brand?.slug || '',
    description: brand?.description || '',
    logo_url: brand?.logo_url || '',
    website: brand?.website || '',
    isActive: brand?.isActive ?? true
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, '') // Remove hífens das bordas
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, logo_url: data.url }))
      } else {
        alert('Erro ao fazer upload da imagem.')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Marca <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Havaianas, Nike, Adidas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (URL) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="havaianas-brasil"
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Gerado automaticamente a partir do nome
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva a marca, sua história e características..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <Separator />

      {/* Logo e Website */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Logo e Website</h3>
        
        {/* Upload de Logo */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Logo da Marca
          </Label>
          
          {formData.logo_url ? (
            <div className="relative inline-block">
              <img 
                src={formData.logo_url} 
                alt="Logo" 
                className="h-32 w-auto border rounded-lg p-2 bg-white"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Clique para fazer upload do logo</span>
                    <span className="text-xs text-gray-500">PNG, JPG ou SVG (máx. 5MB)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.marca.com.br"
            type="url"
          />
        </div>
      </div>

      <Separator />

      {/* Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-base cursor-pointer">
            Marca ativa
          </Label>
          <p className="text-sm text-muted-foreground">
            {formData.isActive 
              ? 'Esta marca está visível e disponível no sistema'
              : 'Esta marca está oculta do sistema'
            }
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <DialogFooter>
        <Button 
          type="submit"
          className="w-full sm:w-auto"
        >
          {brand ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Criar Marca
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
