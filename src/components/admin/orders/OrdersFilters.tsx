'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Search } from 'lucide-react'

interface OrderFilters {
  status?: string
  paymentStatus?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

interface OrdersFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  sellers?: Array<{ id: string; name: string }>
}

export function OrdersFilters({ filters, onFiltersChange, sellers = [] }: OrdersFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  
  const handleSearch = () => {
    onFiltersChange({ ...filters, search: searchInput || undefined })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

  return (
    <div className="space-y-4 mb-6">
      {/* Filtros em linha única */}
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        {/* Busca */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
            Buscar
          </Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Número, cliente..."
              value={searchInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="px-3 bg-black hover:bg-gray-900 text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status do Pedido */}
        <div className="w-full lg:w-40">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1 block">
            Status Pedido
          </Label>
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="PROCESSING">Processando</SelectItem>
              <SelectItem value="SHIPPED">Enviado</SelectItem>
              <SelectItem value="DELIVERED">Entregue</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status do Pagamento */}
        <div className="w-full lg:w-40">
          <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700 mb-1 block">
            Pagamento
          </Label>
          <Select
            value={filters.paymentStatus || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, paymentStatus: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
              <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vendedor */}
        <div className="w-full lg:w-40">
          <Label htmlFor="sellerId" className="text-sm font-medium text-gray-700 mb-1 block">
            Vendedor
          </Label>
          <Select
            value={filters.sellerId || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, sellerId: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Inicial */}
        <div className="w-full lg:w-40">
          <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-1 block">
            Data Inicial
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
            className="w-full"
          />
        </div>

        {/* Data Final */}
        <div className="w-full lg:w-40">
          <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-1 block">
            Data Final
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
            className="w-full"
          />
        </div>

        {/* Botão Limpar */}
        {hasActiveFilters && (
          <div className="w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({})}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full lg:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">Filtros ativos:</span>
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {filters.status}
            </span>
          )}
          {filters.paymentStatus && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Pagamento: {filters.paymentStatus}
            </span>
          )}
          {filters.sellerId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Vendedor: {sellers.find(s => s.id === filters.sellerId)?.name || filters.sellerId}
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              De: {new Date(filters.dateFrom).toLocaleDateString('pt-BR')}
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Até: {new Date(filters.dateTo).toLocaleDateString('pt-BR')}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Busca: "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  )
}
