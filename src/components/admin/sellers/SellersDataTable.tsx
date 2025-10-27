'use client'

import * as React from 'react'
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
import { ArrowUpDown, Eye, Edit, Trash2, Tag } from 'lucide-react'
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
import { Seller } from '@/types/seller'

interface SellersDataTableProps {
  sellers: Seller[]
  onEdit: (seller: Seller) => void
  onDelete: (sellerId: string) => void
  onView: (seller: Seller) => void
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

export default function SellersDataTable({
  sellers,
  onEdit,
  onDelete,
  onView,
}: SellersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Memoizar colunas para evitar recriações
  const columns = React.useMemo<ColumnDef<Seller>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue('email')}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'WhatsApp',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue('phone') || '-'}</span>
      ),
    },
    {
      accessorKey: 'brands',
      header: () => <div className="text-center">Marcas</div>,
      cell: ({ row }) => {
        const seller = row.original
        const brands = seller.brands || []
        
        if (brands.length === 0) {
          return (
            <div className="flex justify-center">
              <span className="text-gray-400 italic text-sm">Sem marcas</span>
            </div>
          )
        }
        
        return (
          <div className="flex justify-center items-center gap-1">
            <div className="flex flex-wrap gap-1 justify-center max-w-xs">
              {brands.slice(0, 2).map((brand: any) => (
                <Badge
                  key={brand.id}
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {brand.name}
                </Badge>
              ))}
              {brands.length > 2 && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-300 text-xs"
                >
                  +{brands.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'commissionRate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Comissão
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const commission = parseFloat(row.getValue('commissionRate') as string) || 0
        return (
          <div className="text-center font-medium text-gray-900">
            {commission.toFixed(1)}%
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
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
        const isActive = row.getValue('isActive') as boolean
        return (
          <div className="flex justify-center">
            {isActive ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                Inativo
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const seller = row.original

        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-primary transition-colors"
              onClick={() => onView(seller)}
              title="Visualizar"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
              onClick={() => onEdit(seller)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
              onClick={() => onDelete(seller.id)}
              title="Desativar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [onEdit, onDelete, onView])

  const table = useReactTable({
    data: sellers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: false,
  })

  // Callback memoizado para mudança de pageSize
  const handlePageSizeChange = React.useCallback((value: string) => {
    setPagination(prev => ({
      pageIndex: 0,
      pageSize: Number(value),
    }))
  }, [])

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
          {table.getFilteredRowModel().rows.length} vendedor(es) encontrado(s).
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Linhas por página</p>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium text-gray-700 min-w-[120px]">
            Página {pagination.pageIndex + 1} de{' '}
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

