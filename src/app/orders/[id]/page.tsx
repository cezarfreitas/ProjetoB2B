'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Package, MapPin, CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  productName: string
  variantName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  shippingAddress: any
  billingAddress: any
  notes?: string
  customerName: string
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchOrder()
    }
  }, [user, params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        setError('Pedido não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar pedido')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-orange-100 text-orange-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPaymentStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      CANCELLED: 'Cancelado'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPaymentMethodText = (method: string) => {
    const methods = {
      BOLETO: 'Boleto Bancário',
      PIX: 'PIX',
      BANK_TRANSFER: 'Transferência Bancária',
      INVOICE: 'Fatura',
      CREDIT_CARD: 'Cartão de Crédito'
    }
    return methods[method as keyof typeof methods] || method
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const parseAddress = (addressData: any) => {
    if (!addressData) return null
    
    try {
      const addr = typeof addressData === 'string' ? JSON.parse(addressData) : addressData
      return addr
    } catch {
      return null
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className="max-w-[1600px] mx-auto px-4 py-8">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="max-w-[1600px] mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Pedido não encontrado'}</p>
            <Link href="/orders">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const shippingAddr = parseAddress(order.shippingAddress)
  const billingAddr = parseAddress(order.billingAddress)

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Pedido #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(order.orderDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
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
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.productName}</h3>
                          {item.variantName && (
                            <p className="text-sm text-gray-500">{item.variantName}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-gray-600">
                              Quantidade: {item.quantity}
                            </p>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {formatCurrency(Number(item.unitPrice))} cada
                              </p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(Number(item.totalPrice))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Nenhum item encontrado</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endereços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endereço de Entrega */}
              {shippingAddr && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{shippingAddr.name}</p>
                    {shippingAddr.company && <p>{shippingAddr.company}</p>}
                    {shippingAddr.phone && <p>{shippingAddr.phone}</p>}
                    <Separator className="my-2" />
                    <p>{shippingAddr.address}{shippingAddr.addressNumber ? `, ${shippingAddr.addressNumber}` : ''}</p>
                    {shippingAddr.addressComplement && <p>{shippingAddr.addressComplement}</p>}
                    <p>{shippingAddr.city} - {shippingAddr.state}</p>
                    <p>CEP: {shippingAddr.zipCode}</p>
                  </CardContent>
                </Card>
              )}

              {/* Endereço de Cobrança */}
              {billingAddr && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Dados de Cobrança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{billingAddr.name}</p>
                    {billingAddr.company && <p>{billingAddr.company}</p>}
                    {billingAddr.cnpj && <p>CNPJ: {billingAddr.cnpj}</p>}
                    {billingAddr.phone && <p>{billingAddr.phone}</p>}
                    <Separator className="my-2" />
                    <p>{billingAddr.address}{billingAddr.addressNumber ? `, ${billingAddr.addressNumber}` : ''}</p>
                    {billingAddr.addressComplement && <p>{billingAddr.addressComplement}</p>}
                    <p>{billingAddr.city} - {billingAddr.state}</p>
                    <p>CEP: {billingAddr.zipCode}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Observações */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(Number(order.subtotal))}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frete:</span>
                    <span className="font-medium">{formatCurrency(Number(order.shippingCost))}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto:</span>
                    <span className="font-medium text-green-600">-{formatCurrency(Number(order.discountAmount))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma:</span>
                  <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                Imprimir Pedido
              </Button>
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  Ver Todos os Pedidos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

