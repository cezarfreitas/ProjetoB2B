'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Package, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  User,
  Building
} from 'lucide-react'
import OrderTracking from './OrderTracking'

interface OrderItem {
  id: string
  productId: string
  productName: string
  variantName?: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  notes?: string
  shippingAddress: any
  billingAddress: any
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

interface OrderDetailsProps {
  order: Order
  showActions?: boolean
  compact?: boolean
  showTracking?: boolean
}

export default function OrderDetails({ order, showActions = true, compact = false, showTracking = true }: OrderDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-purple-100 text-purple-800'
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente'
      case 'CONFIRMED': return 'Confirmado'
      case 'PROCESSING': return 'Processando'
      case 'SHIPPED': return 'Enviado'
      case 'DELIVERED': return 'Entregue'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente'
      case 'PAID': return 'Pago'
      case 'FAILED': return 'Falhou'
      default: return status
    }
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Header Compacto */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Pedido #{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </div>

        {/* Itens Compactos */}
        <div className="space-y-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-gray-600">Qtd: {item.quantity}</p>
              </div>
              <span className="font-semibold">{formatCurrency(item.total)}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-sm text-gray-500 text-center">
              +{order.items.length - 3} itens adicionais
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status do Pedido */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Pedido #{order.orderNumber}</h2>
                <p className="text-sm text-gray-600">
                  Criado em {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
              <Badge variant="outline">
                {getPaymentStatusText(order.paymentStatus)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Itens do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.productName}</h3>
                  {item.variantName && (
                    <p className="text-sm text-gray-600">Variação: {item.variantName}</p>
                  )}
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">Qtd: {item.quantity}</span>
                    <span className="font-semibold">
                      {formatCurrency(item.unitPrice)} cada
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endereço de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{order.shippingAddress.name}</p>
            {order.shippingAddress.company && (
              <p className="text-sm text-gray-600">{order.shippingAddress.company}</p>
            )}
            <p className="text-sm">
              {order.shippingAddress.address}
              {order.shippingAddress.addressNumber && `, ${order.shippingAddress.addressNumber}`}
              {order.shippingAddress.addressComplement && ` - ${order.shippingAddress.addressComplement}`}
            </p>
            <p className="text-sm">
              {order.shippingAddress.city}/{order.shippingAddress.state} - {order.shippingAddress.zipCode}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-sm text-gray-600">
                <Phone className="h-4 w-4 inline mr-1" />
                {order.shippingAddress.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.shippingCost > 0 && (
            <div className="flex justify-between">
              <span>Frete:</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto:</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Rastreamento do Pedido */}
      {showTracking && (
        <OrderTracking 
          orderStatus={order.status}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
          shippingAddress={order.shippingAddress}
        />
      )}

      {/* Informações de Contato */}
      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Precisa de Ajuda?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <a href="mailto:contato@b2btropical.com" className="text-primary hover:underline">
                contato@b2btropical.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <a href="tel:+5511999999999" className="text-primary hover:underline">
                (11) 99999-9999
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Horário de atendimento: Segunda a Sexta, 8h às 18h
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
