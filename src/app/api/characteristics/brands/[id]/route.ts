import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar marca específica
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
        logo_url,
        website,
        isActive,
        createdAt,
        updatedAt
      FROM brands
      WHERE id = ?
    `

    const brand = await executeQuery(query, [parseInt(id)])

    if (Array.isArray(brand) && brand.length === 0) {
      return NextResponse.json(
        { error: 'Marca não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json((brand as any)[0])
  } catch (error) {
    console.error('Erro ao buscar marca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar marca
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, slug, description, logo_url, website, isActive } = body

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

    // Verificar se a marca existe
    const existingBrand = await executeQuery(
      'SELECT id FROM brands WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingBrand) && existingBrand.length === 0) {
      return NextResponse.json(
        { error: 'Marca não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe em outra marca
    const nameExists = await executeQuery(
      'SELECT id FROM brands WHERE name = ? AND id != ?',
      [name, parseInt(id)]
    )

    if (Array.isArray(nameExists) && nameExists.length > 0) {
      return NextResponse.json(
        { error: 'Nome já existe em outra marca' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe em outra marca
    const slugExists = await executeQuery(
      'SELECT id FROM brands WHERE slug = ? AND id != ?',
      [slug, parseInt(id)]
    )

    if (Array.isArray(slugExists) && slugExists.length > 0) {
      return NextResponse.json(
        { error: 'Slug já existe em outra marca' },
        { status: 400 }
      )
    }

    // Atualizar marca
    await executeQuery(
      'UPDATE brands SET name = ?, slug = ?, description = ?, logo_url = ?, website = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
      [name, slug, description, logo_url, website, isActive, parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Marca atualizada com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao atualizar marca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir marca
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a marca existe
    const existingBrand = await executeQuery(
      'SELECT id FROM brands WHERE id = ?',
      [parseInt(id)]
    )

    if (Array.isArray(existingBrand) && existingBrand.length === 0) {
      return NextResponse.json(
        { error: 'Marca não encontrada' },
        { status: 404 }
      )
    }

    // Excluir marca
    await executeQuery(
      'DELETE FROM brands WHERE id = ?',
      [parseInt(id)]
    )

    return NextResponse.json(
      { message: 'Marca excluída com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir marca:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
