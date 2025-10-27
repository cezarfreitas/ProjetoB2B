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
import { ArrowUpDown, Eye, Edit, Trash2, Globe, Image, CheckCircle, XCircle } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Brand {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BrandsDataTableProps {
  brands: Brand[]
  onEdit: (brand: Brand) => void
  onDelete: (brandId: number) => void
  onView?: (brand: Brand) => void
}

// Formatador de data fora do componente
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadge = (isActive: boolean) => {
  if (isActive) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    )
  }
  return (
    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
      <XCircle className="h-3 w-3 mr-1" />
      Inativo
    </Badge>
  )
}

export default function BrandsDataTable({
  brands,
  onEdit,
  onDelete,
  onView,
}: BrandsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [brandToDelete, setBrandToDelete] = React.useState<Brand | null>(null)

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (brandToDelete) {
      onDelete(brandToDelete.id)
      setDeleteDialogOpen(false)
      setBrandToDelete(null)
    }
  }

  // Memoizar colunas para evitar recriações
  const columns = React.useMemo<ColumnDef<Brand>[]>(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-orange-600 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-600">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-orange-600 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const brand = row.original
        return (
          <div className="flex items-center gap-2">
            {brand.logo_url && (
              <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <span className="font-semibold text-gray-900">{row.getValue('name')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-orange-600 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Slug
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
          {row.getValue('slug')}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null
        return (
          <p className="max-w-xs truncate text-sm text-gray-600">
            {description || <span className="text-gray-400 italic">Sem descrição</span>}
          </p>
        )
      },
    },
    {
      accessorKey: 'website',
      header: () => <div className="text-center">Website</div>,
      cell: ({ row }) => {
        const website = row.getValue('website') as string | null
        return (
          <div className="flex justify-center">
            {website ? (
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm hover:underline transition-colors"
              >
                <Globe className="h-3 w-3" />
                Link
              </a>
            ) : (
              <span className="text-gray-400 italic text-sm">-</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-orange-600"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          {getStatusBadge(row.getValue('isActive'))}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-orange-600"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Criado em
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return (
          <div className="text-center text-sm text-gray-700">
            {formatDate(date)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const brand = row.original

        return (
          <div className="flex items-center justify-center gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-primary transition-colors"
                onClick={() => onView(brand)}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
              onClick={() => onEdit(brand)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
              onClick={() => handleDeleteClick(brand)}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [onEdit, onDelete, onView])

  const table = useReactTable({
    data: brands,
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
    <>
      <div className="w-full space-y-3">
        {/* Filtros de Busca */}
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={(table.getColumn('isActive')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('isActive')?.setFilterValue(value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow 
                  key={headerGroup.id} 
                  className="bg-orange-500 hover:bg-orange-500"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        className="text-white font-bold uppercase text-xs tracking-wider h-12 px-4"
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
            {table.getFilteredRowModel().rows.length} marca(s) encontrada(s).
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a marca <strong>"{brandToDelete?.name}"</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBrandToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

