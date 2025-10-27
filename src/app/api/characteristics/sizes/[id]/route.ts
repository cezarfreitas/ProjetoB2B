import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar tamanho específico
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
        isActive,
        createdAt,
        updatedAt
      FROM sizes
      WHERE id = ?
    `

    const size = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(size) && size.length === 0) {
      return NextResponse.json(
        { error: 'Tamanho não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json((size as any)[0])
  } catch (error) {
    console.error('Erro ao buscar tamanho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tamanho
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, isActive } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o tamanho existe
    const existingSize = await executeQuery(
      'SELECT id FROM sizes WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingSize) && existingSize.length === 0) {
      return NextResponse.json(
        { error: 'Tamanho não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outro tamanho
    const nameExists = await executeQuery(
      'SELECT id FROM sizes WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outro tamanho' },
        { status: 400 }
      )
    }

    // Atualizar tamanho
    await executeQuery(
      'UPDATE sizes SET name = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Tamanho atualizado com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar tamanho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir tamanho
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se o tamanho existe
    const existingSize = await executeQuery(
      'SELECT id FROM sizes WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingSize) && existingSize.length === 0) {
      return NextResponse.json(
        { error: 'Tamanho não encontrado' },
        { status: 404 }
      )
    }

    // Excluir tamanho
    await executeQuery(
      'DELETE FROM sizes WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Tamanho excluído com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir tamanho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
