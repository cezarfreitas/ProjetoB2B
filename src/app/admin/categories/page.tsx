'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Folder, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { Category } from '@/types/category'
import { 
  CategoriesDataTable,
  CategoryView,
  CategoryForm,
  ErrorAlert
} from '@/components/admin/categories'

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    setError,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handlers otimizados com useCallback
  const handleCreateCategory = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const success = await createCategory(formData)
      if (success) {
        setIsCreateModalOpen(false)
        setFormData({})
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, createCategory])

  const handleEditCategory = useCallback(async () => {
    if (!selectedCategory) return
    
    setIsSubmitting(true)
    try {
      const success = await updateCategory(selectedCategory.id, formData)
      if (success) {
        setIsEditModalOpen(false)
        setSelectedCategory(null)
        setFormData({})
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedCategory, formData, updateCategory])

  const handleDeleteCategory = useCallback(async (categoryId: number) => {
    await deleteCategory(categoryId)
  }, [deleteCategory])

  const openEditModal = useCallback((category: Category) => {
    setSelectedCategory(category)
    setFormData(category)
    setIsEditModalOpen(true)
  }, [])

  const openViewModal = useCallback((category: Category) => {
    setSelectedCategory(category)
    setIsViewModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedCategory(null)
    setFormData({})
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setSelectedCategory(null)
  }, [])

  // Calcular estatísticas
  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const inactiveCategories = categories.filter(c => !c.isActive).length
  const categoriesWithProducts = categories.filter(c => c.productCount > 0).length

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categorias <span className="text-sm font-normal text-gray-600">- Gerencie todas as categorias de produtos</span>
          </h1>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleCreateCategory}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <Folder className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{totalCategories}</p>
                <p className="text-xs text-gray-400">Total de Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{activeCategories}</p>
                <p className="text-xs text-gray-400">Categorias Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{inactiveCategories}</p>
                <p className="text-xs text-gray-400">Categorias Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{categoriesWithProducts}</p>
                <p className="text-xs text-gray-400">Com Produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Categorias */}
      <CategoriesDataTable
        categories={categories}
        onEdit={openEditModal}
        onDelete={handleDeleteCategory}
        onView={openViewModal}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditCategory}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Categoria</DialogTitle>
          </DialogHeader>
          {selectedCategory && <CategoryView category={selectedCategory} />}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}
