import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar produtos por código de agrupamento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  try {
    const { groupCode } = await params

    // Buscar produtos com o mesmo código de agrupamento
    const products = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.groupCode,
        p.suggestedPrice,
        p.wholesalePrice,
        p.images,
        p.isActive,
        b.name as brandName,
        c.name as categoryName,
        col.name as colorName,
        col.hexCode as colorHex
      FROM products p
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN colors col ON p.colorId = col.id
      WHERE p.groupCode = ? AND p.isActive = 1
      ORDER BY p.name
    `, [groupCode])

    if (Array.isArray(products) && products.length === 0) {
      return NextResponse.json(
        { products: [] },
        { status: 200 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Erro ao buscar produtos por código de agrupamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
