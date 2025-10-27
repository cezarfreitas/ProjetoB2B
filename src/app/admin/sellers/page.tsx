'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useSellers } from '@/hooks/useSellers'
import { Seller } from '@/types/seller'
import { 
  SellersDataTable,
  SellerView,
  ErrorAlert
} from '@/components/admin/sellers'
import SellerForm, { Brand } from '@/components/admin/sellers/SellerForm'

export default function SellersPage() {
  const {
    sellers,
    loading,
    error,
    setError,
    createSeller,
    updateSeller,
    deleteSeller
  } = useSellers()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [formData, setFormData] = useState<Partial<Seller>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Brands state
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)

  // Carregar marcas ativas
  useEffect(() => {
    fetch('/api/characteristics/brands')
      .then(res => res.json())
      .then(data => {
        const activeBrands = data.filter((brand: Brand) => brand.isActive)
        setBrands(activeBrands)
        setLoadingBrands(false)
      })
      .catch(err => {
        console.error('Erro ao carregar marcas:', err)
        setLoadingBrands(false)
      })
  }, [])

  // Handlers otimizados com useCallback
  const handleCreateSeller = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const success = await createSeller(formData)
      if (success) {
        setIsCreateModalOpen(false)
        setFormData({})
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, createSeller])

  const handleEditSeller = useCallback(async () => {
    if (!selectedSeller) return
    
    setIsSubmitting(true)
    try {
      const success = await updateSeller(selectedSeller.id, formData)
      if (success) {
        setIsEditModalOpen(false)
        setSelectedSeller(null)
        setFormData({})
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedSeller, formData, updateSeller])

  const handleDeleteSeller = useCallback(async (sellerId: string) => {
    if (confirm('Tem certeza que deseja deletar este vendedor?')) {
      await deleteSeller(sellerId)
    }
  }, [deleteSeller])

  const openEditModal = useCallback((seller: Seller) => {
    setSelectedSeller(seller)
    setFormData(seller)
    setIsEditModalOpen(true)
  }, [])

  const openViewModal = useCallback((seller: Seller) => {
    setSelectedSeller(seller)
    setIsViewModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedSeller(null)
    setFormData({})
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setSelectedSeller(null)
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando vendedores...</p>
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
            Vendedores <span className="text-sm font-normal text-gray-600">- Gerencie os vendedores da plataforma</span>
          </h1>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[900px] w-[1400px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Vendedor</DialogTitle>
              <p className="text-sm text-muted-foreground">Cadastre um novo vendedor no sistema</p>
            </DialogHeader>
            <SellerForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleCreateSeller}
              isLoading={isSubmitting}
              brands={brands}
              loadingBrands={loadingBrands}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Vendedores */}
      <SellersDataTable
        sellers={sellers}
        onEdit={openEditModal}
        onDelete={handleDeleteSeller}
        onView={openViewModal}
      />

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="min-w-[900px] w-[1400px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Vendedor</DialogTitle>
            <p className="text-sm text-muted-foreground">Atualize os dados do vendedor</p>
          </DialogHeader>
          <SellerForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSeller}
            isLoading={isSubmitting}
            brands={brands}
            loadingBrands={loadingBrands}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="min-w-[900px] w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Vendedor</DialogTitle>
            <p className="text-sm text-muted-foreground">Informações completas do vendedor</p>
          </DialogHeader>
          {selectedSeller && <SellerView seller={selectedSeller} />}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}
