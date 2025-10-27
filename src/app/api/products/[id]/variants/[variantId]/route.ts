import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar variante específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params

    const variant = await executeQuery(`
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
      WHERE pv.id = ? AND pv.productId = ?
    `, [variantId, id])

    if (Array.isArray(variant) && variant.length === 0) {
      return NextResponse.json(
        { error: 'Variante não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(Array.isArray(variant) ? variant[0] : variant)
  } catch (error) {
    console.error('Erro ao buscar variante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar variante
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params
    const body = await request.json()
    
    console.log('PUT /api/products/[id]/variants/[variantId]')
    console.log('Product ID:', id)
    console.log('Variant ID:', variantId)
    console.log('Body:', body)
    
    const {
      variantSku,
      sizeId,
      gradeId,
      stock,
      minStock,
      weight,
      dimensions,
      isActive,
      images
    } = body

    // Verificar se a variante existe
    const existingVariant = await executeQuery(
      'SELECT id FROM product_variants WHERE id = ? AND productId = ?',
      [variantId, id]
    )

    if (Array.isArray(existingVariant) && existingVariant.length === 0) {
      return NextResponse.json(
        { error: 'Variante não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o SKU já existe em outra variante
    if (variantSku) {
      const skuExists = await executeQuery(
        'SELECT id FROM product_variants WHERE variantSku = ? AND id != ?',
        [variantSku, variantId]
      )

      if (Array.isArray(skuExists) && skuExists.length > 0) {
        return NextResponse.json(
          { error: 'SKU da variante já existe' },
          { status: 400 }
        )
      }
    }

    // Atualizar variante
    console.log('Executando query UPDATE...')
    console.log('Parâmetros recebidos:', {
      variantSku,
      sizeId,
      gradeId,
      stock,
      minStock,
      weight,
      dimensions,
      isActive,
      images,
      variantId,
      productId: id
    })
    
    // Preparar dados para a query
    const updateData = {
      variantSku: variantSku || null,
      sizeId: sizeId || null,
      gradeId: gradeId || null,
      stock: stock !== undefined ? stock : 0,
      minStock: minStock !== undefined ? minStock : 0,
      weight: weight || null,
      dimensions: dimensions || null,
      isActive: isActive !== undefined ? isActive : true,
      images: images ? JSON.stringify(images) : null
    }
    
    console.log('Dados preparados para update:', updateData)
    
    const result = await executeQuery(`
      UPDATE product_variants SET 
        variantSku = ?,
        sizeId = ?,
        gradeId = ?,
        stock = ?,
        minStock = ?,
        weight = ?,
        dimensions = ?,
        isActive = ?,
        images = ?
      WHERE id = ? AND productId = ?
    `, [
      updateData.variantSku,
      updateData.sizeId,
      updateData.gradeId,
      updateData.stock,
      updateData.minStock,
      updateData.weight,
      updateData.dimensions,
      updateData.isActive,
      updateData.images,
      variantId,
      id
    ])
    
    console.log('Resultado da query:', result)

    return NextResponse.json({
      message: 'Variante atualizada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar variante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir variante
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params

    // Verificar se a variante existe
    const existingVariant = await executeQuery(
      'SELECT id FROM product_variants WHERE id = ? AND productId = ?',
      [variantId, id]
    )

    if (Array.isArray(existingVariant) && existingVariant.length === 0) {
      return NextResponse.json(
        { error: 'Variante não encontrada' },
        { status: 404 }
      )
    }

    // Excluir variante
    await executeQuery(
      'DELETE FROM product_variants WHERE id = ? AND productId = ?',
      [variantId, id]
    )

    return NextResponse.json({
      message: 'Variante excluída com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir variante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}