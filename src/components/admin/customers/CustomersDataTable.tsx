'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Customer } from '@/types/customer'

interface CustomersDataTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
  onView: (customer: Customer) => void
}

// Formatadores fora do componente para evitar recriação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusBadge = (customer: Customer) => {
  if (!customer.isActive) {
    return <Badge variant="destructive">Inativo</Badge>
  }
  if (customer.isApproved) {
    return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>
  }
  return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>
}

export default function CustomersDataTable({
  customers,
  onEdit,
  onDelete,
  onView,
}: CustomersDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [brands, setBrands] = React.useState<{id: number; name: string}[]>([])

  // Buscar marcas
  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('🔍 CustomersDataTable - Buscando marcas...')
        const response = await fetch('/api/brands')
        if (response.ok) {
          const data = await response.json()
          console.log('✅ CustomersDataTable - Marcas carregadas:', data)
          setBrands(data)
        } else {
          console.error('❌ CustomersDataTable - Erro na resposta da API de marcas')
        }
      } catch (error) {
        console.error('❌ CustomersDataTable - Erro ao buscar marcas:', error)
      }
    }
    fetchBrands()
  }, [])

  // Função para obter nomes das marcas
  const getBrandNames = (brandIds?: number[]) => {
    if (!brandIds || brandIds.length === 0) return []
    return brands
      .filter(b => brandIds.includes(b.id))
      .map(b => b.name)
  }

  // Memoizar colunas para evitar recriações
  const columns = React.useMemo<ColumnDef<Customer>[]>(() => [
    {
      accessorKey: 'name',
      header: () => (
        <div className="text-left">
          <span className="text-white font-semibold">Nome</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'company',
      header: () => (
        <div className="text-left">
          <span className="text-white font-semibold">Empresa</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue('company') || '-'}</span>
      ),
    },
    {
      accessorKey: 'isApproved',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Status</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          {getStatusBadge(row.original)}
        </div>
      ),
    },
    {
      id: 'brands',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Marcas</span>
        </div>
      ),
      cell: ({ row }) => {
        const brandIds = row.original.brandIds
        const brandNames = getBrandNames(brandIds)
        const brandCount = brandIds?.length || 0
        
        console.log('🔍 CustomersDataTable - Renderizando marcas para:', row.original.name, 'brandIds:', brandIds, 'brandNames:', brandNames)
        
        return (
          <div className="flex justify-center">
            {brandCount === 0 ? (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                Todas
              </Badge>
            ) : (
              <div className="flex flex-wrap gap-1 justify-center">
                {brandNames.slice(0, 3).map((brandName, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {brandName}
                  </Badge>
                ))}
                {brandNames.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{brandNames.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'sellerName',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Vendedor</span>
        </div>
      ),
      cell: ({ row }) => {
        const sellerName = row.getValue('sellerName') as string
        return (
          <div className="text-center">
            {sellerName ? (
              <span className="text-gray-900 font-medium">{sellerName}</span>
            ) : (
              <span className="text-gray-400 text-sm">Sem vendedor</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalOrders',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Qtd Pedidos</span>
        </div>
      ),
      cell: ({ row }) => {
        const totalOrders = row.getValue('totalOrders') as number
        return (
          <div className="text-center">
            <span className="font-medium text-gray-900">{totalOrders || 0}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'totalValue',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Total Comprado</span>
        </div>
      ),
      cell: ({ row }) => {
        const totalValue = row.getValue('totalValue') as number
        return (
          <div className="text-center">
            <span className="font-semibold text-green-600">
              {totalValue ? formatCurrency(totalValue) : '-'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'lastOrderDate',
      header: () => (
        <div className="text-center">
          <span className="text-white font-semibold">Último Pedido</span>
        </div>
      ),
      cell: ({ row }) => {
        const lastOrderDate = row.getValue('lastOrderDate') as string | null
        return (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {formatDate(lastOrderDate)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const customer = row.original

        return (
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
      },
    },
  ], [onEdit, onDelete, onView, brands])

  const table = useReactTable({
    data: customers,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="w-full space-y-3">
      {/* Filtro de Busca */}
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id} 
                className="bg-black hover:bg-black border-b border-gray-800"
              >
                {headerGroup.headers.map((header) => {
                  const isActionsColumn = header.id === 'actions'
                  return (
                    <TableHead 
                      key={header.id} 
                      className={`text-white font-bold text-xs tracking-wider h-12 px-4 text-center ${isActionsColumn ? '' : 'uppercase'}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex-1 text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length} cliente(s) encontrado(s).
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Linhas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium text-gray-700 min-w-[120px]">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9"
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

