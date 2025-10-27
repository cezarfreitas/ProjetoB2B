'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Customer } from '@/types/customer'
import { CustomerView } from '@/components/admin/customers'
import { ArrowLeft, Edit } from 'lucide-react'

export default function ViewCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCustomer(data)
        }
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCustomer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando cliente...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="w-full px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600">Cliente não encontrado</p>
          <Button onClick={() => router.push('/admin/customers')} className="mt-4">
            Voltar para Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 pt-2.5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Cliente</h1>
          <p className="text-sm text-gray-600 mt-1">Informações completas do cliente</p>
        </div>
        
        <Button 
          onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <CustomerView customer={customer} />
      </div>
    </div>
  )
}
