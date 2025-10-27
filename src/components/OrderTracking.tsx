'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin,
  AlertCircle
} from 'lucide-react'

interface TrackingStep {
  status: string
  title: string
  description: string
  date?: string
  completed: boolean
  current?: boolean
}

interface OrderTrackingProps {
  orderStatus: string
  createdAt: string
  updatedAt: string
  shippingAddress?: any
}

export default function OrderTracking({ 
  orderStatus, 
  createdAt, 
  updatedAt, 
  shippingAddress 
}: OrderTrackingProps) {
  
  const getTrackingSteps = (status: string): TrackingStep[] => {
    const steps: TrackingStep[] = [
      {
        status: 'PENDING',
        title: 'Pedido Recebido',
        description: 'Seu pedido foi recebido e está sendo processado',
        date: createdAt,
        completed: true,
        current: status === 'PENDING'
      },
      {
        status: 'CONFIRMED',
        title: 'Pedido Confirmado',
        description: 'Seu pedido foi confirmado e está sendo preparado',
        completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
        current: status === 'CONFIRMED'
      },
      {
        status: 'PROCESSING',
        title: 'Processando',
        description: 'Seu pedido está sendo preparado para envio',
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status),
        current: status === 'PROCESSING'
      },
      {
        status: 'SHIPPED',
        title: 'Enviado',
        description: 'Seu pedido foi enviado e está a caminho',
        completed: ['SHIPPED', 'DELIVERED'].includes(status),
        current: status === 'SHIPPED'
      },
      {
        status: 'DELIVERED',
        title: 'Entregue',
        description: 'Seu pedido foi entregue com sucesso',
        completed: status === 'DELIVERED',
        current: status === 'DELIVERED'
      }
    ]

    if (status === 'CANCELLED') {
      return [
        {
          status: 'CANCELLED',
          title: 'Pedido Cancelado',
          description: 'Este pedido foi cancelado',
          date: updatedAt,
          completed: false,
          current: true
        }
      ]
    }

    return steps
  }

  const getStatusIcon = (step: TrackingStep) => {
    if (step.status === 'CANCELLED') {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    
    if (step.current) {
      return <Clock className="h-5 w-5 text-primary" />
    }
    
    return <Clock className="h-5 w-5 text-gray-400" />
  }

  const getStatusColor = (step: TrackingStep) => {
    if (step.status === 'CANCELLED') {
      return 'bg-red-100 text-red-800'
    }
    
    if (step.completed) {
      return 'bg-green-100 text-green-800'
    }
    
    if (step.current) {
      return 'bg-primary/10 text-primary'
    }
    
    return 'bg-gray-100 text-gray-600'
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

  const steps = getTrackingSteps(orderStatus)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Rastreamento do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.status} className="flex items-start gap-4">
              {/* Ícone */}
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step)}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium ${step.current ? 'text-primary' : step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.title}
                  </h3>
                  <Badge className={getStatusColor(step)}>
                    {step.status === 'CANCELLED' ? 'Cancelado' : 
                     step.completed ? 'Concluído' : 
                     step.current ? 'Atual' : 'Pendente'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {step.description}
                </p>
                
                {step.date && (
                  <p className="text-xs text-gray-500">
                    {formatDate(step.date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Informações de Entrega */}
        {shippingAddress && orderStatus !== 'CANCELLED' && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm mb-1">Endereço de Entrega</h4>
                <p className="text-sm text-gray-600">
                  {shippingAddress.address}
                  {shippingAddress.addressNumber && `, ${shippingAddress.addressNumber}`}
                  {shippingAddress.addressComplement && ` - ${shippingAddress.addressComplement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress.city}/{shippingAddress.state} - {shippingAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tempo Estimado */}
        {orderStatus === 'SHIPPED' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Previsão de entrega:</strong> 3-5 dias úteis
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

