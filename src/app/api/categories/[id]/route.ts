import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar categoria específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.slug, c.isActive, c.createdAt, c.updatedAt
    `

    const category = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(category) && category.length === 0) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((category as any)[0])
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, slug, isActive } = body

    // Validar dados obrigatórios
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a categoria existe
    const existingCategory = await executeQuery(
      'SELECT id FROM categories WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingCategory) && existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o slug já existe em outra categoria
    const slugExists = await executeQuery(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, parseInt(id)]
    )

    if (Array.isArray(slugExists) && slugExists.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe em outra categoria' },
        { status: 400 }
      )
    }

    // Atualizar categoria
    await executeQuery(
      'UPDATE categories SET name = ?, description = ?, slug = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, description || '', slug, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Categoria atualizada com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a categoria existe
    const existingCategory = await executeQuery(
      'SELECT name FROM categories WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingCategory) && existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    const categoryName = ((existingCategory as any)[0] as any).name

    // Verificar se há produtos nesta categoria
    const productCount = await executeQuery(
      'SELECT COUNT(*) as count FROM products WHERE categoryId = ?',
      [parseInt(id)]
    )

    const count = ((productCount as any)[0] as any).count
    if (count > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir categoria com produtos associados' },
        { status: 400 }
      )
    }

    // Excluir categoria
    await executeQuery(
      'DELETE FROM categories WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Categoria excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
