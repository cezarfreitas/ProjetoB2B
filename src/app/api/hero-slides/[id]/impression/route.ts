import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// POST - Registrar impressão de um slide
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Incrementar contador de impressões
    await executeQuery(
      'UPDATE hero_slides SET impressions = impressions + 1 WHERE id = ?',
      [id]
    )

    return NextResponse.json({ message: 'Impressão registrada' })
  } catch (error) {
    console.error('Erro ao registrar impressão:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar impressão' },
      { status: 500 }
    )
  }
}

