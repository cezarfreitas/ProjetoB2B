import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar grade específica
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
        slug,
        description,
        sizes,
        isActive,
        createdAt,
        updatedAt
      FROM grades
      WHERE id = ?
    `

    const grade = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(grade) && grade.length === 0) {
      return NextResponse.json(
        { error: 'Grade não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((grade as any)[0])
  } catch (error) {
    console.error('Erro ao buscar grade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar grade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, sizes, isActive } = body

    // Gerar slug automaticamente baseado no nome
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim('-') // Remove hífens das bordas

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    if (!sizes || typeof sizes !== 'object') {
      return NextResponse.json(
        { error: 'Sizes é obrigatório e deve ser um objeto' },
        { status: 400 }
      )
    }

    // Verificar se a grade existe
    const existingGrade = await executeQuery(
      'SELECT id FROM grades WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingGrade) && existingGrade.length === 0) {
      return NextResponse.json(
        { error: 'Grade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outra grade
    const nameExists = await executeQuery(
      'SELECT id FROM grades WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outra grade' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe em outra grade
    const slugExists = await executeQuery(
      'SELECT id FROM grades WHERE slug = ? AND id != ?',
      [slug, parseInt(id)]
    )

    if (Array.isArray(slugExists) && slugExists.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe em outra grade' },
        { status: 400 }
      )
    }

    // Validar se sizes tem pelo menos um tamanho
    const sizeKeys = Object.keys(sizes)
    if (sizeKeys.length === 0) {
      return NextResponse.json(
        { error: 'Deve ter pelo menos um tamanho na grade' },
        { status: 400 }
      )
    }

    // Validar se todas as quantidades são números positivos
    for (const [size, quantity] of Object.entries(sizes)) {
      if (typeof quantity !== 'number' || quantity <= 0) {
        return NextResponse.json(
          { error: `Quantidade inválida para o tamanho ${size}` },
          { status: 400 }
        )
      }
    }

    // Atualizar grade
    await executeQuery(
      'UPDATE grades SET name = ?, slug = ?, description = ?, sizes = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, slug, description, JSON.stringify(sizes), isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Grade atualizada com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar grade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir grade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a grade existe
    const existingGrade = await executeQuery(
      'SELECT id FROM grades WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingGrade) && existingGrade.length === 0) {
      return NextResponse.json(
        { error: 'Grade não encontrada' },
        { status: 404 }
      )
    }

    // Excluir grade
    await executeQuery(
      'DELETE FROM grades WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Grade excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir grade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
