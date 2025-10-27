import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Buscar histórico de carrinhos arquivados
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

    // Buscar carrinhos arquivados agrupados por session_id
    const archivedCarts = await executeQuery(
      `SELECT 
        cart_session_id as sessionId,
        status,
        COUNT(*) as itemCount,
        SUM(quantity * price) as totalValue,
        MIN(created_at) as createdAt,
        MAX(archived_at) as archivedAt
      FROM cart
      WHERE customer_id = ? AND status IN ('archived', 'converted')
      GROUP BY cart_session_id, status
      ORDER BY archivedAt DESC`,
      [decoded.userId]
    )

    return NextResponse.json(archivedCarts)

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}

