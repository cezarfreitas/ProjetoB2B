import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todos os slides (admin) ou apenas ativos (frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminMode = searchParams.get('admin') === 'true'

    let query = `
      SELECT * FROM hero_slides
    `

    if (!adminMode) {
      // Para o frontend, retornar apenas slides ativos e no período correto
      query += `
        WHERE isActive = 1 
        AND (isUnlimited = 1 OR (CURDATE() BETWEEN startDate AND endDate))
      `
    }

    query += ` ORDER BY \`order\` ASC`

    const slides = await executeQuery(query)

    return NextResponse.json({ 
      slides: Array.isArray(slides) ? slides : [] 
    })
  } catch (error) {
    console.error('Erro ao buscar slides:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar slides' },
      { status: 500 }
    )
  }
}

// POST - Criar novo slide
export async function POST(request: NextRequest) {
  try {
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

    // Gerar ID
    const id = `slide_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

    // Buscar próxima ordem disponível
    const orderResult = await executeQuery(
      'SELECT MAX(`order`) as maxOrder FROM hero_slides'
    )
    const nextOrder = Array.isArray(orderResult) && orderResult[0]?.maxOrder 
      ? orderResult[0].maxOrder + 1 
      : 1

    const query = `
      INSERT INTO hero_slides (
        id, name, imageDesktop, imageMobile, link, \`order\`,
        isActive, isUnlimited, startDate, endDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await executeQuery(query, [
      id,
      name,
      imageDesktop,
      imageMobile || null,
      link,
      nextOrder,
      isActive ? 1 : 0,
      isUnlimited ? 1 : 0,
      startDate || null,
      endDate || null
    ])

    return NextResponse.json({ 
      message: 'Slide criado com sucesso',
      id 
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar slide:', error)
    return NextResponse.json(
      { error: 'Erro ao criar slide' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar ordem dos slides
export async function PUT(request: NextRequest) {
  try {
    const { slides } = await request.json()

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: 'Slides deve ser um array' },
        { status: 400 }
      )
    }

    // Atualizar ordem de cada slide
    for (const slide of slides) {
      await executeQuery(
        'UPDATE hero_slides SET `order` = ? WHERE id = ?',
        [slide.order, slide.id]
      )
    }

    return NextResponse.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar ordem' },
      { status: 500 }
    )
  }
}

