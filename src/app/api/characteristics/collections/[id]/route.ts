import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar coleção específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `
      SELECT 
        id,
        name,
        description,
        slug,
        isActive,
        createdAt,
        updatedAt
      FROM collections
      WHERE id = ?
    `

    const collection = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(collection) && collection.length === 0) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((collection as any)[0])
  } catch (error) {
    console.error('Erro ao buscar coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar coleção
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, slug, isActive } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a coleção existe
    const existingCollection = await executeQuery(
      'SELECT id FROM collections WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingCollection) && existingCollection.length === 0) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outra coleção
    const nameExists = await executeQuery(
      'SELECT id FROM collections WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outra coleção' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe em outra coleção
    const slugExists = await executeQuery(
      'SELECT id FROM collections WHERE slug = ? AND id != ?',
      [slug, parseInt(id)]
    )

    if (Array.isArray(slugExists) && slugExists.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe em outra coleção' },
        { status: 400 }
      )
    }

    // Atualizar coleção
    await executeQuery(
      'UPDATE collections SET name = ?, description = ?, slug = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, description, slug, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Coleção atualizada com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir coleção
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a coleção existe
    const existingCollection = await executeQuery(
      'SELECT id FROM collections WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingCollection) && existingCollection.length === 0) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      )
    }

    // Excluir coleção
    await executeQuery(
      'DELETE FROM collections WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Coleção excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
