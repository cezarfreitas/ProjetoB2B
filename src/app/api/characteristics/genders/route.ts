import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todos os gêneros
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        name,
        description,
        isActive,
        createdAt,
        updatedAt
      FROM genders
      ORDER BY name
    `

    const genders = await executeQuery(query)

    return NextResponse.json(genders)
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo gênero
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive = true } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const existingGender = await executeQuery(
      'SELECT id FROM genders WHERE name = ?',
      [name]
    )

    if (Array.isArray(existingGender) && existingGender.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    // Criar gênero (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO genders (name, description, isActive) VALUES (?, ?, ?)',
      [name, description, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Gênero criado com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar gênero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
