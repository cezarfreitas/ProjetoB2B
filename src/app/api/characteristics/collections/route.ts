import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todas as coleções
export async function GET() {
  try {
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
      ORDER BY name
    `

    const collections = await executeQuery(query)

    return NextResponse.json(collections)
  } catch (error) {
    console.error('Erro ao buscar coleções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova coleção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug, isActive = true } = body

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

    // Verificar se o nome já existe
    const existingName = await executeQuery(
      'SELECT id FROM collections WHERE name = ?',
      [name]
    )

    if (Array.isArray(existingName) && existingName.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    const existingSlug = await executeQuery(
      'SELECT id FROM collections WHERE slug = ?',
      [slug]
    )

    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe' },
        { status: 400 }
      )
    }

    // Criar coleção (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO collections (name, description, slug, isActive) VALUES (?, ?, ?, ?)',
      [name, description, slug, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Coleção criada com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
