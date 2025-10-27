'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/types/customer'
import { CustomerForm } from '@/components/admin/customers'

export default function NewCustomerPage() {
  const router = useRouter()
  const { createCustomer } = useCustomers()
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const success = await createCustomer(formData)
      if (success) {
        router.push('/admin/customers')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 pb-6 pt-2.5">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Novo Cliente</h1>
        <p className="text-sm text-gray-600 mt-1">Cadastre um novo cliente</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <CustomerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
