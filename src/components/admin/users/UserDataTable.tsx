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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Edit, Trash2, ArrowUpDown } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  whatsapp: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  permissions: string[]
}

interface UserDataTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
}

export function UserDataTable({ users, onEdit, onDelete }: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const columns = React.useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="text-sm font-mono text-gray-500">#{getValue() as number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900 -ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">{getValue() as string}</div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <div className="text-center">
          <div className="text-sm text-gray-600">{getValue() as string}</div>
        </div>
      ),
    },
    {
      accessorKey: 'whatsapp',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            WhatsApp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => (
        <div className="text-center">
          <div className="text-sm text-gray-600">{getValue() as string}</div>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissões',
      cell: ({ getValue }) => {
        const permissions = getValue() as string[]
        return (
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-1">
              {permissions.slice(0, 2).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              {permissions.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{permissions.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean
        return (
          <div className="flex justify-center">
            <Badge 
              className={
                isActive 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        )
      }
    },
    {
      accessorKey: 'lastLogin',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Último Login
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string)
        return (
          <div className="text-center text-gray-700">
            <div className="text-sm">{date.toLocaleDateString('pt-BR')}</div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-colors" 
              onClick={() => {
                setEditingUser(user)
                setIsEditDialogOpen(true)
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Deletar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(user.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      }
    },
  ], [onDelete])

  const table = useReactTable({
    data: users,
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

  const handleEditUser = async (formData: any) => {
    // Aqui você implementaria a lógica de atualização
    console.log('Editando usuário:', editingUser?.id, formData)
    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

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
          {table.getFilteredRowModel().rows.length} usuário(s) encontrado(s).
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

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSubmit={handleEditUser}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente do formulário de edição
function UserEditForm({ user, onSubmit }: { user: User, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    whatsapp: user.whatsapp,
    isActive: user.isActive,
    permissions: user.permissions
  })

  const availablePermissions = [
    'users', 'products', 'orders', 'customers', 'settings', 'reports', 'marketing'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          placeholder="Ex: (11) 99999-9999"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Permissões</Label>
        <div className="grid grid-cols-2 gap-2">
          {availablePermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <Checkbox
                id={permission}
                checked={formData.permissions.includes(permission)}
                onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
              />
              <Label htmlFor={permission} className="text-sm">
                {permission}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Usuário ativo</Label>
      </div>

      <DialogFooter>
        <Button type="submit">Salvar Alterações</Button>
      </DialogFooter>
    </form>
  )
}
