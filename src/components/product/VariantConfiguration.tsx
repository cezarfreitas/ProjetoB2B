'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Characteristic {
  id: number
  name: string
  isActive: boolean
}

interface Color {
  id: number
  name: string
  hexCode: string | null
  isActive: boolean
}

interface Grade {
  id: number
  name: string
  sizes: Record<string, number>
  isActive: boolean
}

interface VariantConfigurationProps {
  productId: string
  baseSku: string
  sizes: Characteristic[]
  grades: Grade[]
  onCreateVariants: (selectedItems: number[], variantType: 'sizes' | 'grades') => void
}

export default function VariantConfiguration({
  productId,
  baseSku,
  sizes,
  grades,
  onCreateVariants
}: VariantConfigurationProps) {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([])
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [variantType, setVariantType] = useState<'sizes' | 'grades'>('sizes')
  const [isCreating, setIsCreating] = useState(false)

  const toggleSize = (sizeId: number) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId) 
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    )
  }

  const toggleGrade = (gradeId: number) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    )
  }

  const handleCreateVariants = async () => {
    if (variantType === 'sizes' && selectedSizes.length === 0) {
      alert('Selecione pelo menos um tamanho para criar variantes')
      return
    }
    
    if (variantType === 'grades' && selectedGrades.length === 0) {
      alert('Selecione pelo menos uma grade para criar variantes')
      return
    }

    setIsCreating(true)
    try {
      if (variantType === 'sizes') {
        await onCreateVariants(selectedSizes, 'sizes')
        setSelectedSizes([])
      } else {
        await onCreateVariants(selectedGrades, 'grades')
        setSelectedGrades([])
      }
    } catch (error) {
      console.error('Erro ao criar variantes:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const totalVariants = variantType === 'sizes' ? selectedSizes.length : selectedGrades.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Configuração de Variantes
        </CardTitle>
        <CardDescription>
          Crie variantes do produto por tamanhos ou por grades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações base */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium text-gray-600">SKU Base</Label>
            <p className="text-sm">{baseSku}</p>
          </div>
        </div>

        {/* Seleção do tipo de variante */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Variante</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="variant-sizes"
                name="variantType"
                value="sizes"
                checked={variantType === 'sizes'}
                onChange={(e) => setVariantType(e.target.value as 'sizes' | 'grades')}
                className="w-4 h-4"
              />
              <Label htmlFor="variant-sizes" className="text-sm">Por Tamanhos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="variant-grades"
                name="variantType"
                value="grades"
                checked={variantType === 'grades'}
                onChange={(e) => setVariantType(e.target.value as 'sizes' | 'grades')}
                className="w-4 h-4"
              />
              <Label htmlFor="variant-grades" className="text-sm">Por Grades</Label>
            </div>
          </div>
        </div>

        {/* Seleção de tamanhos */}
        {variantType === 'sizes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tamanhos Disponíveis</Label>
              <span className="text-xs text-gray-500">{selectedSizes.length} selecionado(s)</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.id}`}
                    checked={selectedSizes.includes(size.id)}
                    onCheckedChange={() => toggleSize(size.id)}
                  />
                  <Label htmlFor={`size-${size.id}`} className="text-sm">
                    {size.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seleção de grades */}
        {variantType === 'grades' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Grades Disponíveis</Label>
              <span className="text-xs text-gray-500">{selectedGrades.length} selecionada(s)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {grades.map((grade) => (
                <div key={grade.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade.id}`}
                    checked={selectedGrades.includes(grade.id)}
                    onCheckedChange={() => toggleGrade(grade.id)}
                  />
                  <Label htmlFor={`grade-${grade.id}`} className="text-sm">
                    {grade.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo e botão de criação */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Total de variantes a serem criadas: {totalVariants}
            </p>
            <p className="text-xs text-primary">
              {variantType === 'sizes' 
                ? `${selectedSizes.length} tamanhos = ${totalVariants} variantes`
                : `${selectedGrades.length} grades = ${totalVariants} variantes`
              }
            </p>
          </div>
          <Button 
            onClick={handleCreateVariants}
            disabled={
              (variantType === 'sizes' && selectedSizes.length === 0) ||
              (variantType === 'grades' && selectedGrades.length === 0) ||
              isCreating
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isCreating ? 'Criando...' : 'Criar Variantes'}
          </Button>
        </div>

        {/* Exemplo de SKUs que serão criados */}
        {totalVariants > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Exemplo de SKUs que serão criados:</Label>
            <div className="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
              {variantType === 'sizes' ? (
                selectedSizes.slice(0, 4).map(sizeId => {
                  const size = sizes.find(s => s.id === sizeId)
                  return (
                    <div key={sizeId}>
                      {baseSku}-{size?.name}
                    </div>
                  )
                })
              ) : (
                selectedGrades.slice(0, 4).map(gradeId => {
                  const grade = grades.find(g => g.id === gradeId)
                  return (
                    <div key={gradeId}>
                      {baseSku}-{grade?.name}
                    </div>
                  )
                })
              )}
              {totalVariants > 4 && <div>... e mais {totalVariants - 4} variantes</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}