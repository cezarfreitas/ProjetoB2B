import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar variantes de um produto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const variants = await executeQuery(`
      SELECT 
        pv.id,
        pv.productId,
        pv.variantSku,
        pv.sizeId,
        pv.gradeId,
        pv.stock,
        pv.minStock,
        pv.weight,
        pv.dimensions,
        pv.isActive,
        pv.images,
        pv.createdAt,
        pv.updatedAt,
        s.name as sizeName,
        g.name as gradeName,
        g.slug as gradeSlug
      FROM product_variants pv
      LEFT JOIN sizes s ON pv.sizeId = s.id
      LEFT JOIN grades g ON pv.gradeId = g.id
      WHERE pv.productId = ?
      ORDER BY pv.variantSku
    `, [id])

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Erro ao buscar variantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar variantes para um produto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { selectedSizes, selectedGrades, variantType, baseSku } = body

    // Verificar se o produto existe
    const product = await executeQuery(
      'SELECT id, name FROM products WHERE id = ?',
      [id]
    )

    if (Array.isArray(product) && product.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const variants = []

    if (variantType === 'sizes' && selectedSizes) {
      // Criar variantes para cada tamanho
      for (const sizeId of selectedSizes) {
        // Buscar nome do tamanho
        const [sizeResult] = await executeQuery(
          'SELECT name FROM sizes WHERE id = ?',
          [sizeId]
        )

        const sizeName = Array.isArray(sizeResult) ? sizeResult[0]?.name : sizeResult?.name

        const variantSku = `${baseSku}-${sizeName}`
        const variantId = `var_${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4)}`

        // Verificar se a variante já existe
        const existingVariant = await executeQuery(
          'SELECT id FROM product_variants WHERE variantSku = ?',
          [variantSku]
        )

        if (Array.isArray(existingVariant) && existingVariant.length > 0) {
          continue // Pular se já existe
        }

        // Criar variante
        await executeQuery(`
          INSERT INTO product_variants (
            id, productId, variantSku, sizeId, gradeId,
            stock, minStock, weight, dimensions, isActive, images
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          variantId,
          id,
          variantSku,
          sizeId,
          null, // gradeId
          0, // stock
          0, // minStock
          0.3, // weight
          '25cm x 8cm x 3cm', // dimensions
          true, // isActive
          '[]' // images
        ])

        variants.push({
          id: variantId,
          variantSku,
          sizeId,
          sizeName
        })
      }
    } else if (variantType === 'grades' && selectedGrades) {
      // Criar variantes para cada grade
      for (const gradeId of selectedGrades) {
        // Buscar nome da grade
        const [gradeResult] = await executeQuery(
          'SELECT name FROM grades WHERE id = ?',
          [gradeId]
        )

        const gradeName = Array.isArray(gradeResult) ? gradeResult[0]?.name : gradeResult?.name

        const variantSku = `${baseSku}-${gradeName}`
        const variantId = `var_${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4)}`

        // Verificar se a variante já existe
        const existingVariant = await executeQuery(
          'SELECT id FROM product_variants WHERE variantSku = ?',
          [variantSku]
        )

        if (Array.isArray(existingVariant) && existingVariant.length > 0) {
          continue // Pular se já existe
        }

        // Criar variante
        await executeQuery(`
          INSERT INTO product_variants (
            id, productId, variantSku, sizeId, gradeId,
            stock, minStock, weight, dimensions, isActive, images
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          variantId,
          id,
          variantSku,
          null, // sizeId
          gradeId,
          0, // stock
          0, // minStock
          0.3, // weight
          '25cm x 8cm x 3cm', // dimensions
          true, // isActive
          '[]' // images
        ])

        variants.push({
          id: variantId,
          variantSku,
          gradeId,
          gradeName
        })
      }
    }

    return NextResponse.json({
      message: 'Variantes criadas com sucesso',
      variants: variants,
      count: variants.length
    })
  } catch (error) {
    console.error('Erro ao criar variantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}