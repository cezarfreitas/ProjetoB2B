import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Listar todos os registros da tabela cart para debug
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Verificar se é admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Listar todos os registros da tabela cart
    const allCartItems = await executeQuery(
      `SELECT 
        id,
        customer_id as customerId,
        product_id as productId,
        variant_id as variantId,
        quantity,
        price,
        product_name as name,
        product_image as image,
        status,
        cart_session_id as sessionId,
        created_at as createdAt,
        updated_at as updatedAt,
        archived_at as archivedAt
      FROM cart
      ORDER BY created_at DESC`
    )

    console.log('📊 Total de registros na tabela cart:', Array.isArray(allCartItems) ? allCartItems.length : 0)

    return NextResponse.json({
      total: Array.isArray(allCartItems) ? allCartItems.length : 0,
      items: allCartItems
    })

  } catch (error) {
    console.error('❌ Erro ao listar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro ao listar carrinho' },
      { status: 500 }
    )
  }
}
