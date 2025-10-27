import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todas as cores
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        name,
        hexCode,
        isActive,
        createdAt,
        updatedAt
      FROM colors
      ORDER BY name
    `

    const colors = await executeQuery(query)

    return NextResponse.json(colors)
  } catch (error) {
    console.error('Erro ao buscar cores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova cor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, hexCode, isActive = true } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const existingColor = await executeQuery(
      'SELECT id FROM colors WHERE name = ?',
      [name]
    )

    if (Array.isArray(existingColor) && existingColor.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    // Criar cor (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO colors (name, hexCode, isActive) VALUES (?, ?, ?)',
      [name, hexCode, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Cor criada com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
