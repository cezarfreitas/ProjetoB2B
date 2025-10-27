import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar cor específica
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
        hexCode,
        isActive,
        createdAt,
        updatedAt
      FROM colors
      WHERE id = ?
    `

    const color = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(color) && color.length === 0) {
      return NextResponse.json(
        { error: 'Cor não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((color as any)[0])
  } catch (error) {
    console.error('Erro ao buscar cor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, hexCode, isActive } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a cor existe
    const existingColor = await executeQuery(
      'SELECT id FROM colors WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingColor) && existingColor.length === 0) {
      return NextResponse.json(
        { error: 'Cor não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outra cor
    const nameExists = await executeQuery(
      'SELECT id FROM colors WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outra cor' },
        { status: 400 }
      )
    }

    // Atualizar cor
    await executeQuery(
      'UPDATE colors SET name = ?, hexCode = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, hexCode, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Cor atualizada com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar cor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir cor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a cor existe
    const existingColor = await executeQuery(
      'SELECT id FROM colors WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingColor) && existingColor.length === 0) {
      return NextResponse.json(
        { error: 'Cor não encontrada' },
        { status: 404 }
      )
    }

    // Excluir cor
    await executeQuery(
      'DELETE FROM colors WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Cor excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir cor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
