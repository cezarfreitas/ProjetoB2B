'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useClients } from '@/hooks/useClients'
import { Client } from '@/types/client'
import { 
  ClientCard, 
  ClientFilters, 
  ClientForm,
  ClientModal, 
  Pagination, 
  ErrorAlert 
} from '@/components/admin/clients'

export default function ClientsPage() {
  const {
    clients,
    loading,
    error,
    pagination,
    searchTerm,
    statusFilter,
    currentPage,
    setSearchTerm,
    setStatusFilter,
    setCurrentPage,
    setError,
    createClient,
    updateClient,
    deleteClient
  } = useClients()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateClient = async () => {
    setIsSubmitting(true)
    const success = await createClient(formData)
    if (success) {
      setIsCreateModalOpen(false)
      setFormData({})
    }
    setIsSubmitting(false)
  }

  const handleEditClient = async () => {
    if (!selectedClient) return
    
    setIsSubmitting(true)
    const success = await updateClient(selectedClient.id, formData)
    if (success) {
      setIsEditModalOpen(false)
      setSelectedClient(null)
      setFormData({})
    }
    setIsSubmitting(false)
  }

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId)
  }

  const openEditModal = (client: Client) => {
    setSelectedClient(client)
    setFormData(client)
    setIsEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes da plataforma</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleCreateClient}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <ClientFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={openEditModal}
            onDelete={handleDeleteClient}
          />
        ))}
      </div>

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
        onPageChange={setCurrentPage}
      />

      {/* Modal de Edição */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedClient(null)
          setFormData({})
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditClient}
        isEdit={true}
        isLoading={isSubmitting}
      />

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}
