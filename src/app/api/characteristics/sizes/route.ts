import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todos os tamanhos
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        name,
        isActive,
        createdAt,
        updatedAt
      FROM sizes
      ORDER BY name
    `

    const sizes = await executeQuery(query)

    return NextResponse.json(sizes)
  } catch (error) {
    console.error('Erro ao buscar tamanhos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo tamanho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isActive = true } = body

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const existingSize = await executeQuery(
      'SELECT id FROM sizes WHERE name = ?',
      [name]
    )

    if (Array.isArray(existingSize) && existingSize.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    // Criar tamanho (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO sizes (name, isActive) VALUES (?, ?)',
      [name, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Tamanho criado com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar tamanho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
