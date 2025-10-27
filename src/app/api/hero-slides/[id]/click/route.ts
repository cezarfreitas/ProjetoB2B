import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// POST - Registrar clique em um slide
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Incrementar contador de cliques
    await executeQuery(
      'UPDATE hero_slides SET clicks = clicks + 1 WHERE id = ?',
      [id]
    )

    return NextResponse.json({ message: 'Clique registrado' })
  } catch (error) {
    console.error('Erro ao registrar clique:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar clique' },
      { status: 500 }
    )
  }
}

