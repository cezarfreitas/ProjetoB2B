import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todas as grades
export async function GET() {
  try {
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
      ORDER BY name
    `

    const grades = await executeQuery(query)

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Erro ao buscar grades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sizes, isActive = true } = body

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

    // Verificar se o nome já existe
    const existingName = await executeQuery(
      'SELECT id FROM grades WHERE name = ?',
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
      'SELECT id FROM grades WHERE slug = ?',
      [slug]
    )

    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe' },
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

    // Criar grade (ID será gerado automaticamente)
    const result = await executeQuery(
      'INSERT INTO grades (name, slug, description, sizes, isActive) VALUES (?, ?, ?, ?, ?)',
      [name, slug, description, JSON.stringify(sizes), isActive]
    )

    // Obter o ID gerado automaticamente
    const insertId = (result as any).insertId

    return NextResponse.json(
      { 
        message: 'Grade criada com sucesso',
        id: insertId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar grade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
