'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Characteristic {
  id: number
  name: string
  isActive: boolean
}

interface Collection {
  id: number
  name: string
  slug: string
  isActive: boolean
}

interface Grade {
  id: number
  name: string
  sizes: Record<string, number>
  isActive: boolean
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Características disponíveis
  const [categories, setCategories] = useState<Characteristic[]>([])
  const [colors, setColors] = useState<Characteristic[]>([])
  const [sizes, setSizes] = useState<Characteristic[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [genders, setGenders] = useState<Characteristic[]>([])
  const [brands, setBrands] = useState<Characteristic[]>([])

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    groupCode: '',
    brandId: null as number | null,
    categoryId: null as number | null,
    genderId: null as number | null,
    colorId: null as number | null,
    collectionId: null as number | null,
    suggestedPrice: 0,
    costPrice: 0,
    wholesalePrice: 0,
    weight: 0,
    dimensions: '',
    isActive: true,
    images: [] as string[],
    tags: [] as string[]
  })

  // Carregar características disponíveis
  useEffect(() => {
    loadCharacteristics()
  }, [])

  const loadCharacteristics = async () => {
    try {
      const [categoriesRes, colorsRes, sizesRes, collectionsRes, gradesRes, gendersRes, brandsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/characteristics/colors'),
        fetch('/api/characteristics/sizes'),
        fetch('/api/characteristics/collections'),
        fetch('/api/characteristics/grades'),
        fetch('/api/characteristics/genders'),
        fetch('/api/characteristics/brands')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.filter((cat: any) => cat.isActive))
      }

      if (colorsRes.ok) {
        const colorsData = await colorsRes.json()
        setColors(colorsData.filter((color: any) => color.isActive))
      }

      if (sizesRes.ok) {
        const sizesData = await sizesRes.json()
        setSizes(sizesData.filter((size: any) => size.isActive))
      }

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json()
        setCollections(collectionsData.filter((col: any) => col.isActive))
      }

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json()
        setGrades(gradesData.filter((grade: any) => grade.isActive))
      }

      if (gendersRes.ok) {
        const gendersData = await gendersRes.json()
        setGenders(gendersData.filter((gender: any) => gender.isActive))
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setBrands(brandsData.filter((brand: any) => brand.isActive))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar características')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Redirecionar para a lista de produtos
        router.push('/admin/products')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar produto')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
              <p className="text-gray-600">Adicione um novo produto de chinelo ao catálogo</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Novo Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Informações básicas */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Chinelo Havaianas Tradicional"
                      className="h-10"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-medium">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Ex: HAV-TRAD-001"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupCode" className="text-sm font-medium">Código do Grupo</Label>
                    <Input
                      id="groupCode"
                      value={formData.groupCode}
                      onChange={(e) => setFormData({ ...formData, groupCode: e.target.value })}
                      placeholder="Ex: HAV-TRAD"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium">Marca</Label>
                    <Select value={formData.brandId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, brandId: value ? parseInt(value) : null })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione uma marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">Categoria *</Label>
                    <Select value={formData.categoryId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, categoryId: value ? parseInt(value) : null })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gênero</Label>
                    <Select value={formData.genderId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, genderId: value ? parseInt(value) : null })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione um gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.id} value={gender.id.toString()}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-medium">Cor</Label>
                    <Select value={formData.colorId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, colorId: value ? parseInt(value) : null })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione uma cor" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id.toString()}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection" className="text-sm font-medium">Coleção</Label>
                    <Select value={formData.collectionId?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, collectionId: value ? parseInt(value) : null })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione uma coleção" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id.toString()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o produto..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preços e estoque */}
              <div className="bg-white border rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Preços e Estoque
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice" className="text-sm font-medium">Preço de Custo da Mercadoria</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice" className="text-sm font-medium">Preço de Venda Atacado *</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-10 border-blue-300 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestedPrice" className="text-sm font-medium">Preço de Sugestão de Venda *</Label>
                    <Input
                      id="suggestedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.suggestedPrice}
                      onChange={(e) => setFormData({ ...formData, suggestedPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-10 border-green-300 focus:border-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dimensions" className="text-sm font-medium">Dimensões</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="Ex: 25cm x 8cm x 3cm"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Status e botões */}
              <div className="bg-gray-50 p-6 rounded-lg border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Produto ativo
                      </Label>
                    </div>
                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                      {formData.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-6 py-2 font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Criar Produto
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
