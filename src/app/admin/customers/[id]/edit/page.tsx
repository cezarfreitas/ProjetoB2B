'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/types/customer'
import { CustomerForm } from '@/components/admin/customers'
import { ArrowLeft } from 'lucide-react'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const { updateCustomer } = useCustomers()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        console.log('🔍 EditCustomerPage - Buscando cliente com ID:', params.id)
        const response = await fetch(`/api/customers/${params.id}`)
        console.log('🔍 EditCustomerPage - Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ EditCustomerPage - Cliente carregado:', data)
          setCustomer(data)
          setFormData(data)
        } else {
          const errorData = await response.json()
          console.error('❌ EditCustomerPage - Erro na resposta:', errorData)
        }
      } catch (error) {
        console.error('❌ EditCustomerPage - Erro ao carregar cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCustomer()
    }
  }, [params.id])

  const handleSubmit = async () => {
    if (!params.id) return
    
    setIsSubmitting(true)
    try {
      const success = await updateCustomer(params.id as string, formData)
      if (success) {
        router.push('/admin/customers')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="text-sm text-gray-600 mt-1">{customer.name}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <CustomerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isEdit={true}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
