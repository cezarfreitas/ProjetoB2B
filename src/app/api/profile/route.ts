import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// GET - Buscar perfil do usuário logado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('🔍 GET /api/profile - Token decoded:', decoded)
    } catch (err) {
      console.error('❌ GET /api/profile - Token verification failed:', err)
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId || decoded.id
    console.log('👤 GET /api/profile - User ID from token:', userId)

    // Buscar dados completos do usuário
    const query = `
      SELECT 
        id, name, email, cnpj, phone, company,
        address, addressNumber, addressComplement, city, state, zipCode,
        minimumOrder, isActive, isApproved, registrationDate,
        notes, createdAt, updatedAt
      FROM customers
      WHERE id = ?
    `

    const result = await executeQuery(query, [userId])
    console.log('📊 GET /api/profile - Query result:', result)
    
    const customers = Array.isArray(result) ? result : (Array.isArray(result[0]) ? result[0] : [result])
    console.log('📊 GET /api/profile - Customers array:', customers)

    if (!Array.isArray(customers) || customers.length === 0) {
      console.log('❌ GET /api/profile - No customer found')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ GET /api/profile - Customer found:', customers[0])
    return NextResponse.json(customers[0])
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar perfil do usuário logado
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId || decoded.id
    const body = await request.json()

    const {
      name,
      email,
      cnpj,
      phone,
      company,
      address,
      addressNumber,
      addressComplement,
      city,
      state,
      zipCode
    } = body

    // Validações básicas
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE customers SET
        name = ?,
        email = ?,
        cnpj = ?,
        phone = ?,
        company = ?,
        address = ?,
        addressNumber = ?,
        addressComplement = ?,
        city = ?,
        state = ?,
        zipCode = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const values = [
      name,
      email,
      cnpj || null,
      phone || null,
      company || null,
      address || null,
      addressNumber || null,
      addressComplement || null,
      city || null,
      state || null,
      zipCode || null,
      userId
    ]

    const result = await executeQuery(query, values)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o usuário atualizado
    const [updatedUser] = await executeQuery(
      'SELECT id, name, email, company, cnpj, phone, address, city, state, zipCode FROM customers WHERE id = ?',
      [userId]
    )

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: Array.isArray(updatedUser) ? updatedUser[0] : updatedUser
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    
    // Verificar se é erro de duplicata
    if ((error as any).code === 'ER_DUP_ENTRY') {
      if ((error as any).message.includes('email')) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        )
      } else if ((error as any).message.includes('cnpj')) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

