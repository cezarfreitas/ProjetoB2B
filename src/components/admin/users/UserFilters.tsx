'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface UserFilters {
  status?: string
  search?: string
}

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
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
              placeholder="Nome, email ou WhatsApp..."
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
      </div>
    </div>
  )
}
