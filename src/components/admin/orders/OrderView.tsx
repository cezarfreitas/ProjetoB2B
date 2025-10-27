'use client'

import { Order } from '@/types/order'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, User, Mail, MapPin, Calendar, DollarSign, CreditCard } from 'lucide-react'

interface OrderViewProps {
  order: Order
}

export default function OrderView({ order }: OrderViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmado' },
      PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processando' },
      SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Enviado' },
      DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Entregue' },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
      PAID: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Pago' },
      FAILED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Falhou' },
      REFUNDED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Reembolsado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      PIX: 'PIX',
      BANK_TRANSFER: 'Transferência Bancária',
      BOLETO: 'Boleto',
      CASH: 'Dinheiro'
    }
    return methods[method as keyof typeof methods] || method
  }

  return (
    <div className="space-y-6">
      {/* Informações do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Número do Pedido</label>
              <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(order.status)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Data de Criação</label>
              <p className="text-gray-900">{formatDate(order.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Quantidade de Itens</label>
              <p className="text-gray-900">{order.itemCount} itens</p>
            </div>

            {order.trackingNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">Código de Rastreamento</label>
                <p className="text-gray-900 font-mono">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-gray-900">{order.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">E-mail</label>
                <p className="text-gray-900">{order.customerEmail}</p>
              </div>
            </div>

            {order.customerCompany && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Empresa</label>
                  <p className="text-gray-900">{order.customerCompany}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status do Pagamento</label>
              <div className="mt-1">
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Método de Pagamento</label>
              <p className="text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frete:</span>
              <span className="font-medium">{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {(order.notes || order.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observações do Cliente</label>
                <p className="text-gray-900 mt-1">{order.notes}</p>
              </div>
            )}
            {order.internalNotes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observações Internas</label>
                <p className="text-gray-900 mt-1">{order.internalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
