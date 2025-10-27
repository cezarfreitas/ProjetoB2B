import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar gênero específico
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
        isActive,
        createdAt,
        updatedAt
      FROM genders
      WHERE id = ?
    `

    const gender = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(gender) && gender.length === 0) {
      return NextResponse.json(
        { error: 'Gênero não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json((gender as any)[0])
  } catch (error) {
    console.error('Erro ao buscar gênero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar gênero
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o gênero existe
    const existingGender = await executeQuery(
      'SELECT id FROM genders WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingGender) && existingGender.length === 0) {
      return NextResponse.json(
        { error: 'Gênero não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outro gênero
    const nameExists = await executeQuery(
      'SELECT id FROM genders WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outro gênero' },
        { status: 400 }
      )
    }

    // Atualizar gênero
    await executeQuery(
      'UPDATE genders SET name = ?, description = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, description, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Gênero atualizado com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar gênero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir gênero
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se o gênero existe
    const existingGender = await executeQuery(
      'SELECT id FROM genders WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingGender) && existingGender.length === 0) {
      return NextResponse.json(
        { error: 'Gênero não encontrado' },
        { status: 404 }
      )
    }

    // Excluir gênero
    await executeQuery(
      'DELETE FROM genders WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Gênero excluído com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir gênero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
