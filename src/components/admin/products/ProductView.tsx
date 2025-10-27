'use client'

import { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface ProductViewProps {
  product: Product
}

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

export default function ProductView({ product }: ProductViewProps) {
  return (
    <div className="space-y-6">
      {/* Imagens */}
      {product.images && product.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome</p>
            <p className="text-base text-gray-900 mt-1">{product.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">SKU</p>
            <p className="text-base font-mono text-gray-900 mt-1">{product.sku}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Código do Grupo</p>
            <p className="text-base text-gray-900 mt-1">{product.groupCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Marca</p>
            <p className="text-base text-gray-900 mt-1">{product.brandName}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Descrição</p>
            <p className="text-base text-gray-900 mt-1">{product.description || 'Sem descrição'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Categorização */}
      <Card>
        <CardHeader>
          <CardTitle>Categorização</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Categoria</p>
            <Badge variant="outline" className="mt-1">{product.categoryName || 'N/A'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gênero</p>
            <Badge variant="outline" className="mt-1">{product.genderName || 'N/A'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cor</p>
            <div className="flex items-center gap-2 mt-1">
              {product.colorHex && (
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: product.colorHex }}
                />
              )}
              <span className="text-base text-gray-900">{product.colorName || 'N/A'}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Coleção</p>
            <Badge variant="outline" className="mt-1">{product.collectionName || 'N/A'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Precificação */}
      <Card>
        <CardHeader>
          <CardTitle>Precificação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Preço Sugerido</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(product.suggestedPrice)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preço de Custo</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(product.costPrice)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preço Atacado</p>
            <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(product.wholesalePrice)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Físicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Físicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Peso</p>
            <p className="text-base text-gray-900 mt-1">{product.weight} kg</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dimensões</p>
            <p className="text-base text-gray-900 mt-1">{product.dimensions || 'Não especificado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tags e Status */}
      <Card>
        <CardHeader>
          <CardTitle>Tags e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {product.tags && product.tags.length > 0 ? (
                product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Sem tags</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
            <Badge className={product.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
              {product.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Datas */}
      <Card>
        <CardHeader>
          <CardTitle>Datas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Criado em</p>
            <p className="text-base text-gray-900 mt-1">{formatDate(product.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Atualizado em</p>
            <p className="text-base text-gray-900 mt-1">{formatDate(product.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

