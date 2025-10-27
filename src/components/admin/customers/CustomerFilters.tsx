import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface CustomerFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function CustomerFilters({ 
  searchTerm, 
  onSearchChange 
}: CustomerFiltersProps) {
  return (
    <div className="mb-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  )
}
