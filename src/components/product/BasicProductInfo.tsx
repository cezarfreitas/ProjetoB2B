'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface Collection {
  id: number
  name: string
  slug: string
  isActive: boolean
}

interface ProductFormData {
  name: string
  description: string
  sku: string
  groupCode: string
  brandId: number | null
  categoryId: number | null
  genderId: number | null
  colorId: number | null
  collectionId: number | null
  costPrice: number
  wholesalePrice: number
  price: number
  stock: number
  minStock: number
  stockFormat: string[]
  stockType: string
  minQuantity: number
  weight: number
  dimensions: string
  isActive: boolean
  images: string[]
  tags: string[]
}

interface BasicProductInfoProps {
  formData: ProductFormData
  setFormData: (data: ProductFormData) => void
  categories: Characteristic[]
  brands: Characteristic[]
  genders: Characteristic[]
  colors: Color[]
  collections: Collection[]
}

export default function BasicProductInfo({
  formData,
  setFormData,
  categories,
  brands,
  genders,
  colors,
  collections
}: BasicProductInfoProps) {
  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informações Básicas
        </CardTitle>
        <CardDescription>
          Dados principais do produto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Identificação do Produto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
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
              onChange={(e) => updateFormData('sku', e.target.value)}
              placeholder="Ex: HAV-TRAD-001"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupCode" className="text-sm font-medium">Código Agrupador</Label>
            <Input
              id="groupCode"
              value={formData.groupCode}
              onChange={(e) => updateFormData('groupCode', e.target.value)}
              placeholder="Ex: HAV-TRAD-GROUP"
              className="h-10"
            />
          </div>
        </div>

        {/* Classificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Categoria *</Label>
            <Select 
              value={formData.categoryId?.toString() || ""} 
              onValueChange={(value) => updateFormData('categoryId', value ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 w-full min-w-max">
                <SelectValue placeholder="Selecione" />
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
            <Label htmlFor="brand" className="text-sm font-medium">Marca</Label>
            <Select 
              value={formData.brandId?.toString() || ""} 
              onValueChange={(value) => updateFormData('brandId', value ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 w-full min-w-max">
                <SelectValue placeholder="Selecione" />
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
            <Label htmlFor="gender" className="text-sm font-medium">Gênero</Label>
            <Select 
              value={formData.genderId?.toString() || ""} 
              onValueChange={(value) => updateFormData('genderId', value ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 w-full min-w-max">
                <SelectValue placeholder="Selecione" />
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
            <Label htmlFor="collection" className="text-sm font-medium">Coleção</Label>
            <Select 
              value={formData.collectionId?.toString() || ""} 
              onValueChange={(value) => updateFormData('collectionId', value ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 w-full min-w-max">
                <SelectValue placeholder="Selecione" />
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

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium">Cor</Label>
            <Select 
              value={formData.colorId?.toString() || ""} 
              onValueChange={(value) => updateFormData('colorId', value ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 w-full min-w-max">
                <SelectValue placeholder="Selecione" />
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
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Descrição do Produto</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Descreva o produto..."
            rows={4}
            className="resize-none min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
