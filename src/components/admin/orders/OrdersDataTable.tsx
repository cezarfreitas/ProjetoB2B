'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Eye, Edit, Printer } from 'lucide-react'
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
import { Order } from '@/types/order'

interface OrdersDataTableProps {
  orders: Order[]
  onEdit: (order: Order) => void
  onView: (order: Order) => void
  onStatusUpdate: (orderId: string, updates: { status?: string; paymentStatus?: string }) => void
  onPrint?: (order: Order) => void
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

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmado' },
    PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processando' },
    SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Enviado' },
    DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Entregue' },
    CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendente' },
    PAID: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Pago' },
    FAILED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Falhou' },
    REFUNDED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Reembolsado' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// Componente para status editável
const EditableStatus = ({ 
  status, 
  onStatusChange, 
  type = 'order' 
}: { 
  status: string
  onStatusChange: (value: string) => void
  type?: 'order' | 'payment'
}) => {
  const [isEditing, setIsEditing] = useState(false)

  const renderBadge = () => {
    if (type === 'payment') {
      return getPaymentStatusBadge(status)
    }
    return getStatusBadge(status)
  }

  const getStatusOptions = () => {
    if (type === 'payment') {
      return [
        { value: 'PENDING', label: 'Pendente' },
        { value: 'PAID', label: 'Pago' },
        { value: 'FAILED', label: 'Falhou' },
        { value: 'REFUNDED', label: 'Reembolsado' }
      ]
    }
    
    return [
      { value: 'PENDING', label: 'Pendente' },
      { value: 'CONFIRMED', label: 'Confirmado' },
      { value: 'PROCESSING', label: 'Processando' },
      { value: 'SHIPPED', label: 'Enviado' },
      { value: 'DELIVERED', label: 'Entregue' },
      { value: 'CANCELLED', label: 'Cancelado' }
    ]
  }

  if (isEditing) {
    return (
      <Select 
        value={status} 
        onValueChange={(value) => {
          onStatusChange(value)
          setIsEditing(false)
        }}
        onOpenChange={(open) => {
          if (!open) setIsEditing(false)
        }}
      >
        <SelectTrigger className="w-36 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getStatusOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div 
      className="cursor-pointer hover:bg-gray-50 rounded-md p-1 transition-colors"
      onClick={() => setIsEditing(true)}
    >
      {renderBadge()}
    </div>
  )
}

export default function OrdersDataTable({
  orders,
  onEdit,
  onView,
  onStatusUpdate,
  onPrint,
}: OrdersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns = React.useMemo<ColumnDef<Order>[]>(() => [
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Pedido
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900">#{order.orderNumber}</div>
            <div className="text-sm text-gray-500">{order.itemCount || 0} itens</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Cliente
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">{row.getValue('customerName')}</div>
          <div className="text-sm text-gray-500">{row.original.customerCompany || row.original.customerEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex justify-center">
            <EditableStatus
              status={order.status}
              onStatusChange={(value) => onStatusUpdate(order.id, { status: value })}
              type="order"
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Pagamento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex justify-center">
            <EditableStatus
              status={order.paymentStatus}
              onStatusChange={(value) => onStatusUpdate(order.id, { paymentStatus: value })}
              type="payment"
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Valor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number
        return (
          <div className="text-right font-medium text-gray-900">
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return (
          <div className="text-center text-gray-700">
            {formatDate(date)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-primary transition-colors" onClick={() => onView(order)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors" onClick={() => onPrint?.(order)} title="Imprimir"><Printer className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors" onClick={() => onEdit(order)} title="Editar"><Edit className="h-4 w-4" /></Button>
          </div>
        )
      },
    },
  ], [onEdit, onView, onStatusUpdate, onPrint])

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
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
                  className="hover:bg-orange-50/50 transition-colors duration-200"
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
          {table.getFilteredRowModel().rows.length} pedido(s) encontrado(s).
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
