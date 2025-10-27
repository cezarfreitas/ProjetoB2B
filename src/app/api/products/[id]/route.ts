import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Buscar produto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
            console.log('🔍 Customer brandIds for product detail:', allowedBrandIds)
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    }

    // Buscar produto com todos os relacionamentos
    const product = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.groupCode,
        p.categoryId,
        p.brandId,
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
        p.stockType,
        p.stockFormat,
        p.minQuantity,
        p.isActive,
        p.images,
        p.tags,
        p.createdAt,
        p.updatedAt,
        c.name as categoryName,
        b.name as brandName,
        b.logo_url as brandLogo,
        g.name as genderName,
        col.name as colorName,
        col.hexCode as colorHex,
        coll.name as collectionName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN genders g ON p.genderId = g.id
      LEFT JOIN colors col ON p.colorId = col.id
      LEFT JOIN collections coll ON p.collectionId = coll.id
      WHERE p.id = ?
    `, [id])

    // Buscar variantes com informações das grades
    const variants = await executeQuery(`
      SELECT 
        pv.id,
        pv.variantSku,
        pv.stock,
        pv.minStock,
        pv.gradeId,
        pv.isActive,
        g.name as gradeName,
        g.slug as gradeSlug,
        g.description as gradeDescription,
        g.sizes as gradeSizes,
        p.wholesalePrice,
        p.suggestedPrice
      FROM product_variants pv
      LEFT JOIN grades g ON pv.gradeId = g.id
      LEFT JOIN products p ON pv.productId = p.id
      WHERE pv.productId = ? AND pv.isActive = 1
    `, [id])

    let totalStock = 0
    if (Array.isArray(variants) && variants.length > 0) {
      totalStock = variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
      
      // Calcular preço total da grade para cada variante
      variants.forEach(variant => {
        if (variant.gradeSizes) {
          // Calcular quantidade total de itens na grade
          const totalItemsInGrade = Object.values(variant.gradeSizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0)
          
          // Calcular preço total da grade (quantidade total × preço de atacado)
          const wholesalePrice = variant.wholesalePrice || variant.suggestedPrice || 0
          variant.gradeTotalPrice = totalItemsInGrade * wholesalePrice
          variant.totalItemsInGrade = totalItemsInGrade
        }
      })
    }

    if (Array.isArray(product) && product.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const productData = Array.isArray(product) ? product[0] : product
    
    // Verificar se o cliente tem acesso a esta marca
    if (allowedBrandIds && allowedBrandIds.length > 0) {
      if (!productData.brandId || !allowedBrandIds.includes(productData.brandId)) {
        console.log('🚫 Customer does not have access to this brand:', productData.brandId)
        return NextResponse.json(
          { error: 'Você não tem acesso a este produto' },
          { status: 403 }
        )
      }
    }

    // Se há variantes, usar o estoque total das variantes, senão usar o estoque do produto
    if (totalStock > 0) {
      productData.stock = totalStock
    }

    // Adicionar variantes ao produto
    productData.variants = variants || []

    return NextResponse.json(productData)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      name,
      description,
      sku,
      groupCode,
      categoryId,
      brandId,
      genderId,
      colorId,
      collectionId,
      costPrice,
      wholesalePrice,
      suggestedPrice,
      stock,
      minStock,
      weight,
      dimensions,
      stockType,
      stockFormat,
      minQuantity,
      isActive,
      images,
      tags
    } = body

    // Validar dados obrigatórios
    if (!name || !sku || !suggestedPrice) {
      return NextResponse.json(
        { error: 'Nome, SKU e preço de sugestão são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe
    const existingProduct = await executeQuery(
      'SELECT id FROM products WHERE id = ?',
      [id]
    )

    if (Array.isArray(existingProduct) && existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o SKU já existe em outro produto
    const skuExists = await executeQuery(
      'SELECT id FROM products WHERE sku = ? AND id != ?',
      [sku, id]
    )

    if (Array.isArray(skuExists) && skuExists.length > 0) {
      return NextResponse.json(
        { error: 'SKU já existe em outro produto' },
        { status: 400 }
      )
    }

    // Atualizar produto
    await executeQuery(`
      UPDATE products SET 
        name = ?,
        description = ?,
        sku = ?,
        groupCode = ?,
        categoryId = ?,
        brandId = ?,
        genderId = ?,
        colorId = ?,
        collectionId = ?,
        costPrice = ?,
        wholesalePrice = ?,
        suggestedPrice = ?,
        stock = ?,
        minStock = ?,
        weight = ?,
        dimensions = ?,
        stockType = ?,
        stockFormat = ?,
        minQuantity = ?,
        isActive = ?,
        images = ?,
        tags = ?,
        updatedAt = NOW()
      WHERE id = ?
    `, [
      name,
      description || null,
      sku,
      groupCode || null,
      categoryId || null,
      brandId || null,
      genderId || null,
      colorId || null,
      collectionId || null,
      costPrice || 0,
      wholesalePrice || 0,
      suggestedPrice || 0,
      stock || 0,
      minStock || 0,
      weight || null,
      dimensions || null,
      stockType || 'SIMPLE',
      stockFormat ? JSON.stringify(stockFormat) : null,
      minQuantity || 0,
      isActive !== undefined ? isActive : true,
      images ? JSON.stringify(images) : null,
      tags ? JSON.stringify(tags) : null,
      id
    ])

    return NextResponse.json(
      { message: 'Produto atualizado com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se o produto existe
    const existingProduct = await executeQuery(
      'SELECT id FROM products WHERE id = ?',
      [id]
    )

    if (Array.isArray(existingProduct) && existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Excluir produto
    await executeQuery(
      'DELETE FROM products WHERE id = ?',
      [id]
    )

    return NextResponse.json(
      { message: 'Produto excluído com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
