import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar categoria por slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.isActive,
        c.createdAt,
        c.updatedAt,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.categoryId AND p.isActive = true
      WHERE c.slug = ? AND c.isActive = true
      GROUP BY c.id, c.name, c.description, c.slug, c.isActive, c.createdAt, c.updatedAt
    `

    const category = await executeQuery(query, [slug])

    if (Array.isArray(category) && category.length === 0) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((category as any)[0])
  } catch (error) {
    console.error('Erro ao buscar categoria por slug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
