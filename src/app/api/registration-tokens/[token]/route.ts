import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Buscar informações do token
    const tokenData = await executeQuery(
      `SELECT 
        customer_name,
        customer_email,
        customer_whatsapp,
        brand_ids,
        expires_at,
        used
      FROM registration_tokens 
      WHERE token = ?`,
      [token]
    )

    if (!Array.isArray(tokenData) || tokenData.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    const data = tokenData[0]

    // Verificar se já foi usado
    if (data.used) {
      return NextResponse.json(
        { error: 'Token já utilizado' },
        { status: 400 }
      )
    }

    // Verificar se está expirado
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Parse brand_ids
    const brandIds = typeof data.brand_ids === 'string' 
      ? JSON.parse(data.brand_ids) 
      : data.brand_ids

    return NextResponse.json({
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerWhatsapp: data.customer_whatsapp,
      brandIds
    })

  } catch (error) {
    console.error('❌ Erro ao buscar token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

