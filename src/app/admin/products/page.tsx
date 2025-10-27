'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types/product'
import {
  ProductsDataTable,
  ProductView,
  ErrorAlert
} from '@/components/admin/products'

export default function ProductsPage() {
  const router = useRouter()
  const {
    products,
    loading,
    error,
    setError,
    deleteProduct
  } = useProducts()

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Handlers otimizados com useCallback
  const handleEditProduct = useCallback((product: Product) => {
    router.push(`/admin/products/${product.id}/edit`)
  }, [router])

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      await deleteProduct(productId)
    }
  }, [deleteProduct])

  const openViewModal = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsViewModalOpen(true)
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setSelectedProduct(null)
  }, [])

  const handleNewProduct = useCallback(() => {
    router.push('/admin/products/new')
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando produtos...</p>
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
            Produtos <span className="text-sm font-normal text-gray-600">- Gerencie todos os produtos disponíveis</span>
          </h1>
        </div>
        
        <Button onClick={handleNewProduct} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Tabela de Produtos */}
      <ProductsDataTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onView={openViewModal}
      />

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && <ProductView product={selectedProduct} />}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}
