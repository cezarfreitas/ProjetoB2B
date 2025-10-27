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

interface GenderFilters {
  status?: string
  search?: string
}

interface GendersFiltersProps {
  filters: GenderFilters
  onFiltersChange: (filters: GenderFilters) => void
}

export function GendersFilters({ filters, onFiltersChange }: GendersFiltersProps) {
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
              placeholder="Nome do gênero..."
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

        {/* Status */}
        <div className="w-full lg:w-40">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1 block">
            Status
          </Label>
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
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
              Status: {filters.status === 'active' ? 'Ativo' : 'Inativo'}
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
