'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PricingData {
  costPrice: number
  wholesalePrice: number
  suggestedPrice: number
  stock: number
  minStock: number
  stockFormat: string[]
  stockType: string
  minQuantity: number
  weight: number
  dimensions: string
}

interface ProductPricingProps {
  pricingData: PricingData
  setPricingData: (data: PricingData) => void
}

export default function ProductPricing({
  pricingData,
  setPricingData
}: ProductPricingProps) {
  const updatePricingData = (field: keyof PricingData, value: any) => {
    setPricingData({ ...pricingData, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Preços e Formato de Venda
        </CardTitle>
        <CardDescription>
          Informações financeiras e formato de venda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Formato de Venda */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Formato de Venda *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'GRADE', label: 'Grade', description: 'Venda por grade com quantidades pré-definidas' },
              { value: 'ABERTO', label: 'Aberto', description: 'Venda livre de qualquer quantidade' },
              { value: 'FECHADO', label: 'Fechado', description: 'Venda com quantidade mínima total' }
            ].map((option) => (
              <label key={option.value} className="relative">
                <input
                  type="checkbox"
                  checked={pricingData.stockFormat?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentFormats = pricingData.stockFormat || []
                    if (e.target.checked) {
                      updatePricingData('stockFormat', [...currentFormats, option.value])
                    } else {
                      updatePricingData('stockFormat', currentFormats.filter(format => format !== option.value))
                    }
                  }}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  pricingData.stockFormat?.includes(option.value)
                    ? 'border-primary bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      pricingData.stockFormat?.includes(option.value)
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-5">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quantidade Mínima - Condicional */}
        {pricingData.stockFormat?.includes('FECHADO') && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="max-w-xs">
              <Label htmlFor="minQuantity" className="text-sm font-medium">Quantidade Mínima Total</Label>
            <Input
              id="minQuantity"
              type="number"
              min="0"
              value={pricingData.minQuantity || ''}
              onChange={(e) => updatePricingData('minQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="h-10 mt-1"
            />
            </div>
          </div>
        )}

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="costPrice" className="text-sm font-medium">Preço de Custo da Mercadoria</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={pricingData.costPrice || ''}
                onChange={(e) => updatePricingData('costPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-10 pl-8"
              />
            </div>
            <p className="text-xs text-gray-500">Custo real do produto</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wholesalePrice" className="text-sm font-medium">Preço de Venda Atacado</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                min="0"
                value={pricingData.wholesalePrice || ''}
                onChange={(e) => updatePricingData('wholesalePrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-10 pl-8 border-blue-300 focus:border-blue-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Preço para revenda no atacado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedPrice" className="text-sm font-medium">Preço de Sugestão de Venda</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="suggestedPrice"
                type="number"
                step="0.01"
                min="0"
                value={pricingData.suggestedPrice || ''}
                onChange={(e) => updatePricingData('suggestedPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-10 pl-8 border-green-300 focus:border-green-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Preço sugerido para cliente final</p>
          </div>
        </div>

        {/* Informações Físicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium">Peso (kg)</Label>
            <div className="relative">
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={pricingData.weight || ''}
                onChange={(e) => updatePricingData('weight', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimensions" className="text-sm font-medium">Dimensões</Label>
            <Input
              id="dimensions"
              value={pricingData.dimensions}
              onChange={(e) => updatePricingData('dimensions', e.target.value)}
              placeholder="Ex: 25cm x 8cm x 3cm"
              className="h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
