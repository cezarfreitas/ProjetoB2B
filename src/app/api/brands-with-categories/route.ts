import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Verificar se há cliente logado e suas marcas permitidas
    let allowedBrandIds: number[] | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
        
        if (decoded.role === 'customer') {
          // Buscar brandIds do customer
          const customerQuery = 'SELECT brandIds FROM customers WHERE id = ?'
          const customerResult = await executeQuery(customerQuery, [decoded.userId])
          const customer = Array.isArray(customerResult) ? customerResult[0] : customerResult
          
          if (customer && customer.brandIds) {
            allowedBrandIds = typeof customer.brandIds === 'string' 
              ? JSON.parse(customer.brandIds) 
              : customer.brandIds
            console.log('🔍 Customer brandIds for brands-with-categories:', allowedBrandIds)
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    }
    
    // 1. Buscar marcas ativas (filtradas se necessário)
    let brandsQuery = `
      SELECT id, name, slug
      FROM brands
      WHERE isActive = 1
    `
    if (allowedBrandIds && allowedBrandIds.length > 0) {
      const brandIdsString = allowedBrandIds.join(',')
      brandsQuery += ` AND id IN (${brandIdsString})`
      console.log('🔍 Filtering brands-with-categories by allowed brands:', allowedBrandIds)
    }
    brandsQuery += ' ORDER BY name'
    
    const brandsResults = await executeQuery(brandsQuery) as any[]

    // 2. Buscar categorias que têm produtos ativos por marca com contagem (filtradas)
    let categoriesQuery = `
      SELECT 
        p.brandId,
        c.id as categoryId,
        c.name as categoryName,
        c.slug as categorySlug,
        COUNT(DISTINCT p.id) as productCount
      FROM products p
      INNER JOIN categories c ON c.id = p.categoryId AND c.isActive = 1
      WHERE p.isActive = 1 AND p.brandId IS NOT NULL
    `
    if (allowedBrandIds && allowedBrandIds.length > 0) {
      const brandIdsString = allowedBrandIds.join(',')
      categoriesQuery += ` AND p.brandId IN (${brandIdsString})`
    }
    categoriesQuery += `
      GROUP BY p.brandId, c.id, c.name, c.slug
      ORDER BY p.brandId, c.name
    `
    const categoriesResults = await executeQuery(categoriesQuery) as any[]

    // 3. Montar estrutura de marcas com suas categorias
    const brands = brandsResults.map(brand => {
      // Buscar categorias desta marca
      const brandCategories = categoriesResults
        .filter(cat => cat.brandId === brand.id)
        .map(cat => ({
          id: cat.categoryId,
          name: cat.categoryName,
          slug: cat.categorySlug,
          productCount: cat.productCount
        }))

      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        categories: brandCategories
      }
    })

    console.log('Total de marcas:', brands.length)

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Erro ao buscar marcas com categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

