'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  ArrowLeft,
  Package
} from 'lucide-react'
import OrderDetails from '@/components/OrderDetails'
import { Suspense } from 'react'

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

function OrderCompletionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const orderNumber = searchParams.get('order')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('Buscando pedido:', orderNumber)
      console.log('Token:', !!token)
      
      const response = await fetch(`/api/orders/${orderNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('Resposta da API:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('Dados do pedido:', data)
        setOrder(data)
        // Limpar carrinho apenas quando o pedido for carregado com sucesso
        clearCart()
      } else {
        const errorData = await response.json()
        console.error('Erro na API:', errorData)
        setError(errorData.error || 'Pedido não encontrado')
      }
    } catch (err) {
      console.error('Erro de conexão:', err)
      setError('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando seu pedido...</h2>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-red-500 mb-6">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ops! Algo deu errado</h2>
              <p className="text-sm text-gray-600 mb-6">{error}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push('/orders')} className="w-full">
                Ver Meus Pedidos
              </Button>
              <Button variant="outline" onClick={() => router.push('/catalog')} className="w-full">
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header com destaque */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pedido Finalizado com Sucesso! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seu pedido foi processado e você receberá um e-mail de confirmação em breve
          </p>
        </div>

        {/* Navegação */}
        <div className="flex justify-center mb-8">
          <Link href="/orders">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ver Todos os Pedidos
            </Button>
          </Link>
          <Link href="/catalog">
            <Button size="sm">
              Continuar Comprando
            </Button>
          </Link>
        </div>

        {/* Detalhes do Pedido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OrderDetails order={order} showActions={false} />
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Confirmação por E-mail</h4>
                      <p className="text-sm text-green-700">Você receberá um e-mail de confirmação em até 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Processamento</h4>
                      <p className="text-sm text-green-700">Nossa equipe preparará seu pedido em até 2 dias úteis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Envio</h4>
                      <p className="text-sm text-green-700">Seu pedido será enviado e você receberá o código de rastreamento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-700">
                  Nossa equipe está disponível para esclarecer qualquer dúvida sobre seu pedido.
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:contato@b2btropical.com"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    📧 contato@b2btropical.com
                  </a>
                  <a 
                    href="tel:+5511999999999"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    📞 (11) 99999-9999
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderCompletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
            </div>
          </div>
        }>
          <OrderCompletionContent />
        </Suspense>
      </main>
    </div>
  )
}