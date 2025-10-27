'use client'

import { Customer } from '@/types/customer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerViewProps {
  customer: Customer
}

export default function CustomerView({ customer }: CustomerViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return '-'
    }
  }

  const getStatusBadge = (customer: Customer) => {
    if (!customer.isActive) {
      return <Badge variant="destructive">Inativo</Badge>
    }
    if (customer.isApproved) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>
    }
    return <Badge variant="secondary">Pendente</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <p className="text-gray-600">{customer.email}</p>
        </div>
        {getStatusBadge(customer)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Empresa</label>
              <p className="text-sm">{customer.company || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CNPJ</label>
              <p className="text-sm">{customer.cnpj || '-'}</p>
            </div>
                         <div>
               <label className="text-sm font-medium text-gray-500">Telefone</label>
               <p className="text-sm">{customer.phone || '-'}</p>
             </div>
           </CardContent>
         </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Endereço</label>
              <p className="text-sm">{customer.address || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cidade</label>
              <p className="text-sm">{customer.city || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p className="text-sm">{customer.state || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CEP</label>
              <p className="text-sm">{customer.zipCode || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Comerciais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Pedido Mínimo</label>
              <p className="text-sm">
                {customer.minimumOrder ? formatCurrency(customer.minimumOrder) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
              <p className="text-sm">{formatDate(customer.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
