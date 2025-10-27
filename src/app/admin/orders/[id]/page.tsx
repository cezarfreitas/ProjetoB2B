'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface OrderItem {
  id: string
  productId: string
  productName: string
  variantName?: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
  notes?: string
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerCompany?: string
  customerEmail: string
  customerPhone?: string
  customerCnpj?: string
  customerAddress?: string
  customerCity?: string
  customerState?: string
  customerZipCode?: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER' | 'BOLETO' | 'CASH'
  shippingAddress: any
  billingAddress?: any
  shippingMethod?: string
  trackingNumber?: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  notes?: string
  internalNotes?: string
  estimatedDeliveryDate?: string
  shippedDate?: string
  deliveredDate?: string
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Order>>({})

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar pedido')
      }
      const data = await response.json()
      setOrder(data.order)
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({
      status: order?.status,
      paymentStatus: order?.paymentStatus,
      trackingNumber: order?.trackingNumber,
      shippingCost: order?.shippingCost,
      discountAmount: order?.discountAmount,
      notes: order?.notes,
      internalNotes: order?.internalNotes,
      estimatedDeliveryDate: order?.estimatedDeliveryDate,
      shippedDate: order?.shippedDate,
      deliveredDate: order?.deliveredDate
    })
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar pedido')
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder.order)
      setIsEditing(false)
      setEditData({})
    } catch (err) {
      console.error('Erro ao salvar:', err)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: AlertCircle },
      CONFIRMED: { color: 'bg-orange-100 text-orange-800', label: 'Confirmado', icon: CheckCircle },
      PROCESSING: { color: 'bg-purple-100 text-purple-800', label: 'Processando', icon: Package },
      SHIPPED: { color: 'bg-indigo-100 text-indigo-800', label: 'Enviado', icon: Truck },
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Entregue', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelado', icon: X }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Pago' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Falhou' },
      REFUNDED: { color: 'bg-gray-100 text-gray-800', label: 'Reembolsado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error || 'Pedido não encontrado'}</p>
          <Button onClick={() => router.push('/admin/orders')}>
            Voltar para Pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pedido {order.orderNumber}</h1>
              <p className="text-gray-600">Criado em {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getStatusBadge(order.status)}
            {getPaymentStatusBadge(order.paymentStatus)}
            <Button
              onClick={isEditing ? handleSave : handleEdit}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itens do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Pedido ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 relative overflow-hidden rounded-lg bg-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {formatPrice(item.unitPrice)}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informações de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h4>
                    <div className="text-gray-600">
                      {order.shippingAddress && (
                        <div>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          <p>CEP: {order.shippingAddress.zipCode}</p>
                          {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rastreamento</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          value={isEditing ? editData.trackingNumber || '' : order.trackingNumber || ''}
                          onChange={(e) => isEditing && setEditData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                          placeholder="Código de rastreamento"
                          disabled={!isEditing}
                        />
                        <Truck className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div>
                      <Label htmlFor="trackingNumber">Código de Rastreamento</Label>
                      <Input
                        id="trackingNumber"
                        value={editData.trackingNumber || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        placeholder="Digite o código de rastreamento"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            {(order.notes || order.internalNotes || isEditing) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notas do Cliente</h4>
                        <p className="text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notas Internas</h4>
                      {isEditing ? (
                        <Textarea
                          value={editData.internalNotes || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, internalNotes: e.target.value }))}
                          placeholder="Adicione notas internas..."
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-600">{order.internalNotes || 'Nenhuma nota interna'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                    {order.customerCompany && (
                      <p className="text-sm text-gray-600">{order.customerCompany}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{order.customerEmail}</p>
                    {order.customerPhone && <p>{order.customerPhone}</p>}
                    {order.customerCnpj && <p>CNPJ: {order.customerCnpj}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {isEditing ? (
                      <Select
                        value={editData.paymentStatus || order.paymentStatus}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, paymentStatus: value as any }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="PAID">Pago</SelectItem>
                          <SelectItem value="FAILED">Falhou</SelectItem>
                          <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getPaymentStatusBadge(order.paymentStatus)
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método:</span>
                    <span className="text-gray-900">{order.paymentMethod}</span>
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frete:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.shippingCost || order.shippingCost}
                        onChange={(e) => setEditData(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                        className="w-20 h-8 text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{formatPrice(order.shippingCost)}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desconto:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.discountAmount || order.discountAmount}
                        onChange={(e) => setEditData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                        className="w-20 h-8 text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{formatPrice(order.discountAmount)}</span>
                    )}
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Status do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editData.status || order.status}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                          <SelectItem value="PROCESSING">Processando</SelectItem>
                          <SelectItem value="SHIPPED">Enviado</SelectItem>
                          <SelectItem value="DELIVERED">Entregue</SelectItem>
                          <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(order.status)
                    )}
                  </div>

                  {order.estimatedDeliveryDate && (
                    <div>
                      <Label htmlFor="estimatedDelivery">Data Estimada de Entrega</Label>
                      {isEditing ? (
                        <Input
                          id="estimatedDelivery"
                          type="date"
                          value={editData.estimatedDeliveryDate || order.estimatedDeliveryDate || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-600">{order.estimatedDeliveryDate}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}






