'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOrders } from '@/hooks/useOrders'
import { useOrderStats } from '@/hooks/useOrderStats'
import { useSellers } from '@/hooks/useSellers'
import { Order } from '@/types/order'
import { 
  OrdersDataTable,
  OrderView,
  ErrorAlert,
  OrdersFilters,
  OrderStatsCards
} from '@/components/admin/orders'

interface OrderFilters {
  status?: string
  paymentStatus?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export default function OrdersPage() {
  // Estados dos filtros
  const [filters, setFilters] = useState<OrderFilters>({})
  
  const {
    orders,
    loading,
    error,
    setError,
    updateOrder
  } = useOrders(filters)

  const { sellers } = useSellers()
  const { stats: orderStats, loading: statsLoading } = useOrderStats()

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Handlers otimizados com useCallback
  const handleStatusUpdate = useCallback(async (orderId: string, updates: { status?: string; paymentStatus?: string }) => {
    await updateOrder(orderId, updates)
  }, [updateOrder])

  const openViewModal = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }, [])

  const openEditModal = useCallback((order: Order) => {
    // TODO: Implementar modal de edição
    console.log('Editar pedido:', order)
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setSelectedOrder(null)
  }, [])

  const handlePrintOrder = useCallback((order: Order) => {
    // Abrir página de impressão em nova aba
    window.open(`/admin/orders/${order.id}/print`, '_blank')
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedidos <span className="text-sm font-normal text-gray-600">- Gerencie todos os pedidos da plataforma</span>
          </h1>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <OrderStatsCards stats={orderStats} loading={statsLoading} />

      {/* Filtros */}
      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        sellers={sellers}
      />

      {/* Tabela de Pedidos */}
      <OrdersDataTable
        orders={orders}
        onEdit={openEditModal}
        onView={openViewModal}
        onStatusUpdate={handleStatusUpdate}
        onPrint={handlePrintOrder}
      />

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderView order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}