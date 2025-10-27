import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todas as categorias
export async function GET() {
  try {
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
      GROUP BY c.id, c.name, c.description, c.slug, c.isActive, c.createdAt, c.updatedAt
      ORDER BY c.name
    `

    const categories = await executeQuery(query)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug, isActive = true } = body

    // Validar dados obrigatórios
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    const existingCategory = await executeQuery(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    )

    if (Array.isArray(existingCategory) && existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe' },
        { status: 400 }
      )
    }

    // Criar categoria (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO categories (name, description, slug, isActive) VALUES (?, ?, ?, ?)',
      [name, description || '', slug, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Categoria criada com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
