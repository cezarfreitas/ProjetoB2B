'use client'

import { Seller } from '@/types/seller'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, TrendingUp, Tag, MapPin } from 'lucide-react'

interface SellerViewProps {
  seller: Seller
}

export default function SellerView({ seller }: SellerViewProps) {
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
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-lg font-semibold text-gray-900">{seller.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {seller.isActive ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
                ) : (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">E-mail</label>
                <p className="text-gray-900">{seller.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                <p className="text-gray-900">{seller.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Região</label>
                <p className="text-gray-900">{seller.region || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Comissão</label>
                <p className="text-lg font-semibold text-gray-900">{seller.commissionRate ? seller.commissionRate.toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Cadastrado em</label>
                <p className="text-gray-900">{formatDate(seller.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marcas Relacionadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle>Marcas Relacionadas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {seller.brands && seller.brands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {seller.brands.map((brand) => (
                <Badge
                  key={brand.id}
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-2 text-sm"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {brand.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma marca associada</p>
              <p className="text-sm text-gray-400 mt-1">
                Edite o vendedor para adicionar marcas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

