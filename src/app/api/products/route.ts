import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/products - Iniciando...')
    
    // Obter parâmetros de paginação e ordenação
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    const admin = searchParams.get('admin') === 'true'
    const brandId = searchParams.get('brandId')
    const brandSlug = searchParams.get('brand')
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('category')
    
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
            console.log('🔍 Customer brandIds:', allowedBrandIds)
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    }
    
    // Construir filtros
    const filters = []
    if (!admin) {
      filters.push('p.isActive = 1')
    }
    
    // Se cliente logado tem marcas permitidas, filtrar por elas
    if (allowedBrandIds && allowedBrandIds.length > 0) {
      const brandIdsString = allowedBrandIds.join(',')
      filters.push(`p.brandId IN (${brandIdsString})`)
      console.log('🔍 Filtering products by allowed brands:', allowedBrandIds)
    }
    
    if (brandId && !isNaN(parseInt(brandId))) {
      filters.push(`p.brandId = ${parseInt(brandId)}`)
    }
    if (brandSlug) {
      filters.push(`b.slug = '${brandSlug}'`)
    }
    if (categoryId && !isNaN(parseInt(categoryId))) {
      filters.push(`p.categoryId = ${parseInt(categoryId)}`)
    }
    if (categorySlug) {
      filters.push(`c.slug = '${categorySlug}'`)
    }
    
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
    const countWhereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ').replace(/p\./g, '')}` : ''
    
    // Contar total de produtos
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN categories c ON p.categoryId = c.id
      ${whereClause}
    `)
    const total = totalResult[0]?.total || 0
    const totalPages = Math.ceil(total / limit)
    
    // Query com paginação
    const products = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.groupCode,
        p.brandId,
        p.categoryId,
        p.genderId,
        p.colorId,
        p.collectionId,
        p.costPrice,
        p.wholesalePrice,
        p.suggestedPrice,
        p.stock,
        p.minStock,
        p.weight,
        p.dimensions,
        p.isActive,
        p.images,
        p.tags,
        p.createdAt,
        p.updatedAt,
        b.name as brandName,
        c.name as categoryName,
        g.name as genderName,
        col.name as colorName,
        col.hexCode as colorHex,
        coll.name as collectionName,
        COALESCE(SUM(oi.quantity), 0) as totalSold
      FROM products p
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN genders g ON p.genderId = g.id
      LEFT JOIN colors col ON p.colorId = col.id
      LEFT JOIN collections coll ON p.collectionId = coll.id
      LEFT JOIN order_items oi ON p.id = oi.productId
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `)

    // Calcular estoque total das variantes para cada produto
    for (let product of products) {
      const variants = await executeQuery(`
        SELECT stock FROM product_variants 
        WHERE productId = ? AND isActive = 1
      `, [product.id])

      if (Array.isArray(variants) && variants.length > 0) {
        const totalVariantStock = variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
        if (totalVariantStock > 0) {
          product.stock = totalVariantStock
        }
      }
    }
    
    console.log('Produtos encontrados:', products.length)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      sku,
      groupCode,
      brandId,
      categoryId,
      genderId,
      colorId,
      collectionId,
      costPrice,
      wholesalePrice,
      suggestedPrice,
      weight,
      dimensions,
      isActive,
      images,
      tags
    } = body

    // Verificar se o SKU já existe
    const existingProduct = await executeQuery(
      'SELECT id FROM products WHERE sku = ?',
      [sku]
    )

    if (Array.isArray(existingProduct) && existingProduct.length > 0) {
      return NextResponse.json(
        { error: 'SKU já existe' },
        { status: 400 }
      )
    }

    // Criar produto
    const productId = Date.now().toString().slice(-8)
    
    await executeQuery(`
      INSERT INTO products (
        id, name, description, sku, groupCode, brandId, categoryId, genderId, colorId, collectionId,
        costPrice, wholesalePrice, suggestedPrice, weight, dimensions, isActive, images, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productId,
      name,
      description || '',
      sku,
      groupCode || '',
      brandId || null,
      categoryId || null,
      genderId || null,
      colorId || null,
      collectionId || null,
      costPrice || 0,
      wholesalePrice || 0,
      suggestedPrice || 0,
      weight || 0,
      dimensions || '',
      isActive !== undefined ? isActive : true,
      JSON.stringify(images || []),
      JSON.stringify(tags || [])
    ])

    return NextResponse.json({
      message: 'Produto criado com sucesso',
      productId
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
