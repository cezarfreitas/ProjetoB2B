'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductVariant {
  id: string
  productId: string
  variantSku: string
  sizeId: number | null
  gradeId: number | null
  stock: number
  minStock: number
  weight: number | null
  dimensions: string | null
  isActive: boolean
  images: any
  sizeName: string | null
  gradeName: string | null
  createdAt: string
  updatedAt: string
}

interface VariantDisplayProps {
  productId: string
  variants: ProductVariant[]
  onVariantsChange?: () => void
}

export default function VariantDisplay({
  productId,
  variants,
  onVariantsChange
}: VariantDisplayProps) {
  const [editingVariants, setEditingVariants] = useState<Record<string, Partial<ProductVariant>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: any) => {
    setEditingVariants(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value
      }
    }))
  }

  const saveVariant = async (variant: ProductVariant) => {
    const variantId = variant.id
    const changes = editingVariants[variantId]
    
    if (!changes || Object.keys(changes).length === 0) {
      return
    }

    console.log('Salvando variante:', variantId)
    console.log('Mudanças:', changes)
    console.log('URL:', `/api/products/${productId}/variants/${variantId}`)

    setSaving(prev => ({ ...prev, [variantId]: true }))

    try {
      const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes)
      })

      if (response.ok) {
        // Remover das edições pendentes
        setEditingVariants(prev => {
          const newState = { ...prev }
          delete newState[variantId]
          return newState
        })
        console.log('Variante atualizada com sucesso!')
        
        // Recarregar variantes se callback fornecido
        if (onVariantsChange) {
          onVariantsChange()
        }
      } else {
        console.error('Status da resposta:', response.status)
        console.error('Status text:', response.statusText)
        
        let errorMessage = 'Erro ao atualizar variante'
        try {
          const error = await response.json()
          console.error('Erro da API:', error)
          errorMessage = error.error || error.message || errorMessage
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError)
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Erro ao atualizar variante:', error)
      alert('Erro ao atualizar variante')
    } finally {
      setSaving(prev => ({ ...prev, [variantId]: false }))
    }
  }

  const deleteVariant = async (variant: ProductVariant) => {
    if (!confirm(`Tem certeza que deseja excluir a variante ${variant.variantSku}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/variants/${variant.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('Variante excluída com sucesso!')
        // Recarregar a página para atualizar a lista
        window.location.reload()
      } else {
        const error = await response.json()
        console.error('Erro ao excluir variante:', error)
        alert('Erro ao excluir variante')
      }
    } catch (error) {
      console.error('Erro ao excluir variante:', error)
      alert('Erro ao excluir variante')
    }
  }

  const hasChanges = (variant: ProductVariant) => {
    const changes = editingVariants[variant.id]
    return changes && Object.keys(changes).length > 0
  }

  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variantes do Produto</CardTitle>
          <CardDescription>
            Nenhuma variante criada ainda. Use a configuração de variantes acima para criar.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Variantes do Produto ({variants.length})
        </CardTitle>
        <CardDescription>
          Gerencie as variantes criadas para este produto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.id} className="border rounded-lg p-4 space-y-4">
              {/* Cabeçalho da variante */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{variant.variantSku}</span>
                  </div>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {hasChanges(variant) && (
                    <Button
                      size="sm"
                      onClick={() => saveVariant(variant)}
                      disabled={saving[variant.id]}
                    >
                      {saving[variant.id] ? 'Salvando...' : 'Salvar'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteVariant(variant)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>

              {/* Informações da variante */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tamanho</Label>
                  <span className="text-sm">{variant.sizeName || 'N/A'}</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Grade</Label>
                  <span className="text-sm">{variant.gradeName || 'N/A'}</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              {/* Campos editáveis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`stock-${variant.id}`} className="text-sm font-medium">
                    Estoque
                  </Label>
                  <Input
                    id={`stock-${variant.id}`}
                    type="number"
                    value={editingVariants[variant.id]?.stock ?? variant.stock}
                    onChange={(e) => handleVariantChange(variant.id, 'stock', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`minStock-${variant.id}`} className="text-sm font-medium">
                    Estoque Mínimo
                  </Label>
                  <Input
                    id={`minStock-${variant.id}`}
                    type="number"
                    value={editingVariants[variant.id]?.minStock ?? variant.minStock}
                    onChange={(e) => handleVariantChange(variant.id, 'minStock', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Indicador de mudanças */}
              {hasChanges(variant) && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Esta variante tem alterações não salvas
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


