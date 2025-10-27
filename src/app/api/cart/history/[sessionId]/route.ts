import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Buscar itens de um carrinho arquivado específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Buscar itens do carrinho arquivado
    const cartItems = await executeQuery(
      `SELECT 
        id,
        product_id as productId,
        variant_id as variantId,
        quantity,
        price,
        product_name as name,
        product_image as image,
        variant_info as variant,
        status,
        created_at as createdAt,
        archived_at as archivedAt
      FROM cart
      WHERE customer_id = ? AND cart_session_id = ?
      ORDER BY created_at DESC`,
      [decoded.userId, sessionId]
    )

    // Parse variant_info JSON
    const formattedItems = (cartItems as any[]).map(item => ({
      ...item,
      variant: item.variant ? (typeof item.variant === 'string' ? JSON.parse(item.variant) : item.variant) : null
    }))

    return NextResponse.json(formattedItems)

  } catch (error) {
    console.error('❌ Erro ao buscar carrinho arquivado:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar carrinho arquivado' },
      { status: 500 }
    )
  }
}

