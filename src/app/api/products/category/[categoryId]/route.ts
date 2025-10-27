import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar produtos por categoria
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.groupCode,
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
        p.brandId,
        p.categoryId,
        p.genderId,
        p.colorId,
        p.collectionId,
        b.name as brandName,
        c.name as categoryName,
        g.name as genderName,
        col.name as colorName,
        col.hexCode as colorHex,
        coll.name as collectionName
      FROM products p
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN categories cat ON p.categoryId = cat.id
      LEFT JOIN genders g ON p.genderId = g.id
      LEFT JOIN colors col ON p.colorId = col.id
      LEFT JOIN collections coll ON p.collectionId = coll.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.categoryId = ? AND p.isActive = true
      ORDER BY p.name
    `

    const products = await executeQuery(query, [parseInt(categoryId)])

    return NextResponse.json({
      products: products || [],
      pagination: {
        page: 1,
        limit: 100,
        total: Array.isArray(products) ? products.length : 0,
        totalPages: 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
