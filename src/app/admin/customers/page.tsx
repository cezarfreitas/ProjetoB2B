'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCustomers } from '@/hooks/useCustomers'
import { useCustomerStats } from '@/hooks/useCustomerStats'
import { Customer } from '@/types/customer'
import { 
  CustomersDataTable,
  ErrorAlert,
  CustomerStatsCards
} from '@/components/admin/customers'

export default function CustomersPage() {
  const router = useRouter()
  const {
    customers,
    loading,
    error,
    setError,
    deleteCustomer
  } = useCustomers()
  const { stats, loading: statsLoading } = useCustomerStats()

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Tem certeza que deseja desativar este cliente?')) {
      await deleteCustomer(customerId)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    router.push(`/admin/customers/${customer.id}/edit`)
  }

  const handleViewCustomer = (customer: Customer) => {
    router.push(`/admin/customers/${customer.id}`)
  }

  const handleNewCustomer = () => {
    router.push('/admin/customers/new')
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando clientes...</p>
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
            Clientes <span className="text-sm font-normal text-gray-600">- Gerencie os clientes da plataforma</span>
          </h1>
        </div>
        
        <Button onClick={handleNewCustomer} className="w-full sm:w-auto">
          + Novo Cliente
        </Button>
      </div>

      {/* Cards Estatísticos */}
      <CustomerStatsCards stats={stats} loading={statsLoading} />

      {/* Tabela de Clientes */}
      <CustomersDataTable
        customers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onView={handleViewCustomer}
      />

      {/* Alert de Erro */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
    </div>
  )
}
