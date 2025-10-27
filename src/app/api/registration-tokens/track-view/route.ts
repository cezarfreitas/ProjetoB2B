import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se o token existe
    const tokenData = await executeQuery(
      'SELECT id, viewed, view_count FROM registration_tokens WHERE token = ?',
      [token]
    )

    if (!Array.isArray(tokenData) || tokenData.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    const currentToken = tokenData[0]

    // Atualizar viewed e view_count
    await executeQuery(
      `UPDATE registration_tokens 
       SET viewed = 1, 
           viewed_at = IF(viewed_at IS NULL, NOW(), viewed_at),
           view_count = view_count + 1
       WHERE token = ?`,
      [token]
    )

    console.log('👁️ Token visualizado:', {
      token,
      viewCount: currentToken.view_count + 1,
      firstView: !currentToken.viewed
    })

    return NextResponse.json({ 
      success: true,
      firstView: !currentToken.viewed
    })

  } catch (error) {
    console.error('❌ Erro ao rastrear visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

