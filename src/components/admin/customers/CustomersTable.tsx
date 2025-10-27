'use client'

import { useState, useEffect } from 'react'
import { Customer } from '@/types/customer'
import { DataTable, Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, User, Building, Shield, DollarSign, Calendar } from 'lucide-react'

interface Brand {
  id: number
  name: string
}

interface CustomersTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
  onView: (customer: Customer) => void
  loading?: boolean
}

export default function CustomersTable({
  customers,
  onEdit,
  onDelete,
  onView,
  loading = false
}: CustomersTableProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)

  // Buscar marcas
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('🔍 CustomersTable - Buscando marcas...')
        const response = await fetch('/api/brands')
        if (response.ok) {
          const data = await response.json()
          console.log('✅ CustomersTable - Marcas carregadas:', data)
          setBrands(data)
        } else {
          console.error('❌ CustomersTable - Erro na resposta da API de marcas')
        }
      } catch (error) {
        console.error('❌ CustomersTable - Erro ao buscar marcas:', error)
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  // Função para obter nome da marca por ID
  const getBrandName = (brandId: number) => {
    const brand = brands.find(b => b.id === brandId)
    return brand ? brand.name : `ID: ${brandId}`
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Nome',
      className: 'min-w-[200px]',
      render: (_value, customer) => (
        <div className="font-semibold text-gray-900">{customer.name}</div>
      )
    },
    {
      key: 'company',
      label: 'Empresa',
      className: 'min-w-[180px]',
      render: (value) => (
        <span className="text-gray-700">{value || '-'}</span>
      )
    },
    {
      key: 'brandIds',
      label: 'Marcas',
      className: 'min-w-[200px]',
      render: (value, customer) => {
        console.log('🔍 CustomersTable - Renderizando marcas para:', customer.name, 'brandIds:', customer.brandIds)
        
        if (!customer.brandIds || customer.brandIds.length === 0) {
          return <span className="text-gray-400 text-sm">Nenhuma</span>
        }
        
        // Se brandIds é string JSON, fazer parse
        let brandIds = customer.brandIds
        if (typeof brandIds === 'string') {
          try {
            brandIds = JSON.parse(brandIds)
            console.log('🔍 CustomersTable - brandIds parseado:', brandIds)
          } catch (error) {
            console.error('Erro ao fazer parse do brandIds:', error)
            return <span className="text-gray-400 text-sm">Erro</span>
          }
        }
        
        if (loadingBrands) {
          return <span className="text-gray-400 text-sm">Carregando...</span>
        }
        
        console.log('🔍 CustomersTable - Marcas disponíveis:', brands)
        console.log('🔍 CustomersTable - brandIds do cliente:', brandIds)
        
        return (
          <div className="flex flex-wrap gap-1">
            {brandIds.slice(0, 3).map((brandId: number) => {
              const brandName = getBrandName(brandId)
              console.log(`🔍 CustomersTable - brandId: ${brandId}, brandName: ${brandName}`)
              return (
                <Badge key={brandId} variant="secondary" className="text-xs">
                  {brandName}
                </Badge>
              )
            })}
            {brandIds.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{brandIds.length - 3}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[120px]',
      headerClassName: 'text-center',
      render: (_value, customer) => (
        <div className="flex justify-center">
          {getStatusBadge(customer)}
        </div>
      )
    },
    {
      key: 'minimumOrder',
      label: 'Pedido Mínimo',
      className: 'min-w-[140px] text-right',
      headerClassName: 'text-right',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value ? formatCurrency(value) : '-'}
        </span>
      )
    },
    {
      key: 'totalOrders',
      label: 'Qtd Pedidos',
      className: 'min-w-[120px] text-center',
      headerClassName: 'text-center',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value || 0}
        </span>
      )
    },
    {
      key: 'totalValue',
      label: 'Total Pedidos',
      className: 'min-w-[140px] text-right',
      headerClassName: 'text-right',
      render: (value) => (
        <span className="font-semibold text-green-600">
          {value ? formatCurrency(value) : '-'}
        </span>
      )
    },
    {
      key: 'lastOrderDate',
      label: 'Último Pedido',
      className: 'min-w-[140px] text-center',
      headerClassName: 'text-center',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString('pt-BR') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'w-[140px]',
      headerClassName: 'w-[140px] text-center',
      render: (_value, customer) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-primary transition-colors"
            onClick={() => onView(customer)}
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
            onClick={() => onEdit(customer)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
            onClick={() => onDelete(customer.id)}
            title="Desativar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      data={customers}
      columns={columns}
      loading={loading}
      emptyMessage="Não há clientes para exibir"
      getRowId={(customer) => customer.id}
    />
  )
}
