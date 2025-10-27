import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todos os customers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    
    const offset = (page - 1) * limit
    
    // Construir WHERE clause
    let whereConditions = 'WHERE 1=1'
    if (search) {
      whereConditions += ` AND (
        c.name LIKE '%${search}%' OR
        c.email LIKE '%${search}%' OR
        c.company LIKE '%${search}%' OR
        c.cnpj LIKE '%${search}%'
      )`
    }
    if (status !== 'all') {
      if (status === 'active') {
        whereConditions += ' AND c.isActive = 1'
      } else if (status === 'inactive') {
        whereConditions += ' AND c.isActive = 0'
      } else if (status === 'approved') {
        whereConditions += ' AND c.isApproved = 1'
      } else if (status === 'pending') {
        whereConditions += ' AND c.isApproved = 0'
      }
    }
    
    const query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.cnpj,
        c.phone,
        c.company,
        c.address,
        c.addressNumber,
        c.addressComplement,
        c.city,
        c.state,
        c.zipCode,
        c.minimumOrder,
        c.isActive,
        c.isApproved,
        c.sellerId,
        s.name as sellerName,
        c.brandIds,
        c.registrationDate,
        c.notes,
        c.createdAt,
        c.updatedAt,
        COALESCE(COUNT(DISTINCT o.id), 0) as totalOrders,
        COALESCE(SUM(o.totalAmount), 0) as totalValue,
        MAX(o.createdAt) as lastOrderDate
      FROM customers c
      LEFT JOIN sellers s ON c.sellerId = s.id
      LEFT JOIN orders o ON c.id = o.customerId
      ${whereConditions}
      GROUP BY c.id
      ORDER BY c.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM customers c
      ${whereConditions}
    `

    const [customers, countResult] = await Promise.all([
      executeQuery(query, []),
      executeQuery(countQuery, [])
    ])

    const total = (countResult as any)[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar customers:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
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
      zipCode,
      minimumOrder,
      sellerId,
      notes
    } = body

    // Validações básicas
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // ID será gerado automaticamente pelo AUTO_INCREMENT
    const query = `
      INSERT INTO customers (
        name, email, cnpj, phone, company,
        address, addressNumber, addressComplement, city, state, zipCode,
        minimumOrder, sellerId, notes, isActive, isApproved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      minimumOrder || 0.00,
      sellerId || null,
      notes || null,
      true, // isActive
      true // isApproved - marcado por padrão no formulário
    ]

    const result = await executeQuery(query, values)
    
    // Obter o ID gerado automaticamente
    const insertId = result.insertId

    // Buscar o cliente criado
    const [newClient] = await executeQuery(
      'SELECT * FROM customers WHERE id = ?',
      [insertId]
    )

    return NextResponse.json(
      { message: 'Customer criado com sucesso', customer: newClient },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    
    // Verificar se é erro de duplicata
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        )
      } else if (error.message.includes('cnpj')) {
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
