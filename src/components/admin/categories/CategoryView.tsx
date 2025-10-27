'use client'

import { Category } from '@/types/category'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryViewProps {
  category: Category
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

export default function CategoryView({ category }: CategoryViewProps) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome</p>
            <p className="text-base text-gray-900 mt-1 font-semibold">{category.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Slug</p>
            <p className="text-base font-mono text-gray-900 mt-1">{category.slug}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Descrição</p>
            <p className="text-base text-gray-900 mt-1">{category.description || 'Sem descrição'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Produtos Cadastrados</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {category.productCount || 0} produtos
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-2">
              <Badge className={category.isActive ? 'bg-green-100 text-green-800 border-green-200 text-base px-4 py-2' : 'bg-gray-100 text-gray-800 border-gray-200 text-base px-4 py-2'}>
                {category.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
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
            <p className="text-sm font-medium text-gray-500">Criada em</p>
            <p className="text-base text-gray-900 mt-1">{formatDate(category.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Atualizada em</p>
            <p className="text-base text-gray-900 mt-1">{formatDate(category.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

