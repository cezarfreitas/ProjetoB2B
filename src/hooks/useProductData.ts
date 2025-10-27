'use client'

import { useState, useEffect, useCallback } from 'react'

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

interface Grade {
  id: number
  name: string
  sizes: Record<string, number>
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
  suggestedPrice: number
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

export function useProductData(productId: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Características disponíveis
  const [categories, setCategories] = useState<Characteristic[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Characteristic[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [genders, setGenders] = useState<Characteristic[]>([])
  const [brands, setBrands] = useState<Characteristic[]>([])

  // Dados do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    groupCode: '',
    brandId: null,
    categoryId: null,
    genderId: null,
    colorId: null,
    collectionId: null,
    costPrice: 0,
    wholesalePrice: 0,
    price: 0,
    stock: 0,
    minStock: 0,
    stockFormat: [],
    stockType: '',
    minQuantity: 0,
    weight: 0,
    dimensions: '',
    isActive: true,
    images: [],
    tags: []
  })

  const [variantsCreated, setVariantsCreated] = useState(false)
  const [variants, setVariants] = useState<any[]>([])

  // Função para recarregar variantes
  const reloadVariants = useCallback(async () => {
    try {
      const variantsRes = await fetch(`/api/products/${productId}/variants`)
      if (variantsRes.ok) {
        const variantsData = await variantsRes.json()
        setVariants(variantsData)
        setVariantsCreated(variantsData.length > 0)
      }
    } catch (err) {
      console.error('Erro ao recarregar variantes:', err)
    }
  }, [productId])

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carregar características em paralelo
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

      // Carregar dados do produto da API
      const productRes = await fetch(`/api/products/${productId}`)
      if (productRes.ok) {
        const productData = await productRes.json()
        
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          sku: productData.sku || '',
          groupCode: productData.groupCode || '',
          brandId: productData.brandId || null,
          categoryId: productData.categoryId || null,
          genderId: productData.genderId || null,
          colorId: productData.colorId || null,
          collectionId: productData.collectionId || null,
          costPrice: productData.costPrice || 0,
          wholesalePrice: productData.wholesalePrice || 0,
          suggestedPrice: productData.suggestedPrice || 0,
          stock: productData.stock || 0,
          minStock: productData.minStock || 0,
          stockFormat: productData.stockFormat || [],
          stockType: productData.stockType || 'SIMPLE',
          minQuantity: productData.minQuantity || 0,
          weight: productData.weight || 0,
          dimensions: productData.dimensions || '',
          isActive: productData.isActive !== undefined ? productData.isActive : true,
          images: productData.images || [],
          tags: productData.tags || []
        })
      } else {
        // Se a API falhar, usar dados vazios
        setFormData({
          name: '',
          description: '',
          sku: '',
          groupCode: '',
          brandId: null,
          categoryId: null,
          genderId: null,
          colorId: null,
          collectionId: null,
          costPrice: 0,
          wholesalePrice: 0,
          price: 0,
          stock: 0,
          minStock: 0,
          stockFormat: [],
          stockType: 'SIMPLE',
          minQuantity: 0,
          weight: 0,
          dimensions: '',
          isActive: true,
          images: [],
          tags: []
        })
      }

      // Carregar variantes do produto
      const variantsRes = await fetch(`/api/products/${productId}/variants`)
      if (variantsRes.ok) {
        const variantsData = await variantsRes.json()
        setVariants(variantsData)
        setVariantsCreated(variantsData.length > 0)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [productId])

  // Função para salvar produto
  const saveProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        console.log('Produto salvo com sucesso!')
        return true
      } else {
        const error = await response.json()
        console.error('Erro ao salvar produto:', error)
        setError('Erro ao salvar produto')
        return false
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      setError('Erro ao salvar produto')
      return false
    }
  }

  const createVariants = async (selectedItems: number[], variantType: 'sizes' | 'grades') => {
    try {
      const body: any = {
        variantType,
        baseSku: formData.sku
      }

      if (variantType === 'sizes') {
        body.selectedSizes = selectedItems
      } else {
        body.selectedGrades = selectedItems
      }

      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        setVariantsCreated(true)
        console.log('Variantes criadas com sucesso!', result)
        
        // Recarregar variantes
        const variantsRes = await fetch(`/api/products/${productId}/variants`)
        if (variantsRes.ok) {
          const variantsData = await variantsRes.json()
          setVariants(variantsData)
        }
      } else {
        const error = await response.json()
        console.error('Erro ao criar variantes:', error)
        setError('Erro ao criar variantes')
      }
    } catch (err) {
      console.error('Erro ao criar variantes:', err)
      setError('Erro ao criar variantes')
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [productId, loadInitialData])

  return {
    loading,
    error,
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
  }
}
