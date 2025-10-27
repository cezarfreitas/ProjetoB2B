import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar slide específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const slides = await executeQuery(
      'SELECT * FROM hero_slides WHERE id = ?',
      [id]
    )

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'Slide não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ slide: slides[0] })
  } catch (error) {
    console.error('Erro ao buscar slide:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar slide' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      imageDesktop, 
      imageMobile, 
      link, 
      isUnlimited, 
      startDate, 
      endDate,
      isActive 
    } = body

    if (!name || !imageDesktop || !link) {
      return NextResponse.json(
        { error: 'Nome, imagem desktop e link são obrigatórios' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE hero_slides SET
        name = ?,
        imageDesktop = ?,
        imageMobile = ?,
        link = ?,
        isActive = ?,
        isUnlimited = ?,
        startDate = ?,
        endDate = ?
      WHERE id = ?
    `

    await executeQuery(query, [
      name,
      imageDesktop,
      imageMobile || null,
      link,
      isActive ? 1 : 0,
      isUnlimited ? 1 : 0,
      startDate || null,
      endDate || null,
      id
    ])

    return NextResponse.json({ message: 'Slide atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar slide:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar slide' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await executeQuery('DELETE FROM hero_slides WHERE id = ?', [id])

    return NextResponse.json({ message: 'Slide removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar slide:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar slide' },
      { status: 500 }
    )
  }
}

