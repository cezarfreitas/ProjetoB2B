import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todas as marcas
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        logo_url,
        website,
        isActive,
        createdAt,
        updatedAt
      FROM brands
      ORDER BY name
    `

    const brands = await executeQuery(query)

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Erro ao buscar marcas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova marca
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, logo_url, website, isActive = true } = body

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
    const existingBrand = await executeQuery(
      'SELECT id FROM brands WHERE name = ?',
      [name]
    )

    if (Array.isArray(existingBrand) && existingBrand.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    const existingSlug = await executeQuery(
      'SELECT id FROM brands WHERE slug = ?',
      [slug]
    )

    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe' },
        { status: 400 }
      )
    }

    // Criar marca (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO brands (name, slug, description, logo_url, website, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description, logo_url, website, isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Marca criada com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar marca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
