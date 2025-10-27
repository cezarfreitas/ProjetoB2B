'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import BasicProductInfo from '@/components/product/BasicProductInfo'
import ProductPricing from '@/components/product/ProductPricing'
import VariantConfiguration from '@/components/product/VariantConfiguration'
import VariantDisplay from '@/components/product/VariantDisplay'
import ImageUpload from '@/components/product/ImageUpload'
import { useProductData } from '@/hooks/useProductData'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    loading,
    error: dataError,
    formData,
    setFormData,
    variantsCreated,
    variants,
    categories,
    colors,
    sizes,
    collections,
    grades,
    genders,
    brands,
    saveProduct,
    createVariants,
    reloadVariants
  } = useProductData(productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      
      const success = await saveProduct()
      
      if (success) {
        // Voltar para a lista de produtos
        router.push('/admin/products')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      // Aqui seria a chamada para a API
      console.log('Excluindo produto:', productId)
      
      // Voltar para a lista de produtos
      router.push('/admin/products')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir produto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (dataError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{dataError || error}</p>
          <Button onClick={() => router.push('/admin/products')}>
            Voltar para Produtos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/products')}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
          </div>
          <p className="text-muted-foreground">
            Modifique as informações do produto: {formData.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir Produto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o produto "{formData.name}"? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <BasicProductInfo
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          brands={brands}
          genders={genders}
          colors={colors}
          collections={collections}
        />

        {/* Preços e estoque */}
        <ProductPricing
          pricingData={{
            costPrice: formData.costPrice,
            wholesalePrice: formData.wholesalePrice,
            suggestedPrice: formData.suggestedPrice || formData.price,
            stock: formData.stock,
            minStock: formData.minStock,
            stockFormat: formData.stockFormat,
            stockType: formData.stockType,
            minQuantity: formData.minQuantity,
            weight: formData.weight,
            dimensions: formData.dimensions
          }}
          setPricingData={(pricingData) => setFormData({ ...formData, ...pricingData })}
        />

        {/* Upload de Imagens */}
        <ImageUpload
          images={formData.images}
          onImagesChange={(images) => setFormData({ ...formData, images })}
        />

        {/* Configuração de variantes */}
        <VariantConfiguration
          productId={productId}
          baseSku={formData.sku}
          sizes={sizes}
          grades={grades}
          onCreateVariants={createVariants}
        />

        {/* Variantes do produto */}
        {variantsCreated && (
          <VariantDisplay
            productId={productId}
            variants={variants}
            onVariantsChange={reloadVariants}
          />
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              'Salvar Produto'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
