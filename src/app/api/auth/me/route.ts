import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const DB_CONFIG = {
  host: process.env.DB_HOST || 'server.idenegociosdigitais.com.br',
  port: parseInt(process.env.DB_PORT || '3394'),
  user: process.env.DB_USER || 'b2btropical',
  password: process.env.DB_PASSWORD || 'facbe3b2f9dfa94ddb49',
  database: process.env.DB_NAME || 'b2btropical',
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
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verificar token JWT
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Tentar buscar como SELLER primeiro
    const sellerQuery = `
      SELECT 
        id, name, email, phone, commissionRate, region, brandIds,
        isActive, createdAt, 'seller' as role
      FROM sellers 
      WHERE id = ? AND isActive = 1
    `
    
    const sellerResult = await executeQuery(sellerQuery, [decoded.userId]) as any
    const sellers = Array.isArray(sellerResult) ? sellerResult : (Array.isArray(sellerResult[0]) ? sellerResult[0] : [sellerResult])
    
    let user = null
    
    if (Array.isArray(sellers) && sellers.length > 0) {
      user = sellers[0]
      console.log('✅ /api/auth/me - Seller restored:', user.email)
    } else {
      // Se não for seller, buscar como CUSTOMER
      const customerQuery = `
        SELECT 
          id, name, email, company, cnpj, phone, brandIds,
          isActive, isApproved, createdAt, 'customer' as role
        FROM customers 
        WHERE id = ? AND isActive = 1
      `
      
      const customerResult = await executeQuery(customerQuery, [decoded.userId]) as any
      const customers = Array.isArray(customerResult) ? customerResult : (Array.isArray(customerResult[0]) ? customerResult[0] : [customerResult])
      
      if (Array.isArray(customers) && customers.length > 0) {
        user = customers[0]
        console.log('✅ /api/auth/me - Customer restored:', user.email)
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
