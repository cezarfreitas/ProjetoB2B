import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const DB_CONFIG = {
  host: 'server.idenegociosdigitais.com.br',
  port: 3394,
  user: 'b2btropical',
  password: 'facbe3b2f9dfa94ddb49',
  database: 'b2btropical',
  charset: 'utf8mb4'
}

async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const connection = await mysql.createConnection(DB_CONFIG)
  try {
    const [rows] = await connection.execute(query, params)
    return rows
  } catch (error) {
    console.error('Database error:', error)
    throw error
  } finally {
    await connection.end()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')

    // Buscar links de cadastro do vendedor
    const links = await executeQuery(
      `SELECT 
        id,
        token,
        seller_id,
        brand_ids,
        customer_name,
        customer_whatsapp,
        customer_email,
        expires_at,
        used,
        used_at,
        used_by_customer_id,
        viewed,
        viewed_at,
        view_count,
        created_at
      FROM registration_tokens
      WHERE seller_id = ?
      ORDER BY created_at DESC`,
      [decoded.userId]
    )

    // Parse brand_ids JSON
    const formattedLinks = (links as any[]).map(link => ({
      ...link,
      brand_ids: typeof link.brand_ids === 'string' 
        ? JSON.parse(link.brand_ids) 
        : link.brand_ids
    }))

    return NextResponse.json(formattedLinks)

  } catch (error) {
    console.error('❌ Erro ao buscar links de cadastro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar links de cadastro' },
      { status: 500 }
    )
  }
}

