import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, active, inactive, approved, pending
    
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []

    // Filtro de busca
    if (search) {
      whereClause += ` AND (
        c.name LIKE ? OR 
        c.email LIKE ? OR 
        c.company LIKE ? OR 
        c.cnpj LIKE ?
      )`
      const searchTerm = `%${search}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    // Filtro de status
    if (status === 'active') {
      whereClause += ' AND c.isActive = true'
    } else if (status === 'inactive') {
      whereClause += ' AND c.isActive = false'
    } else if (status === 'approved') {
      whereClause += ' AND c.isActive = true AND c.isApproved = true'
    } else if (status === 'pending') {
      whereClause += ' AND c.isActive = true AND c.isApproved = false'
    }

    // Query principal
    const query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.cnpj,
        c.phone,
        c.company,
        c.contactPerson,
        c.address,
        c.city,
        c.state,
        c.zipCode,
        c.minimumOrder,
        c.creditLimit,
        c.paymentTerms,
        c.discountPercentage,
        c.isActive,
        c.isApproved,
        c.registrationDate,
        c.lastOrderDate,
        c.totalOrders,
        c.totalValue,
        c.notes,
        c.createdAt,
        c.updatedAt
      FROM customers c
      ${whereClause}
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?
    `

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customers c
      ${whereClause}
    `

    queryParams.push(limit, offset)
    const countParams = queryParams.slice(0, -2) // Remove limit e offset

    const [clients, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, countParams)
    ])

    const total = (countResult as any)[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      clients: clients || [],
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
    console.error('Erro ao buscar clientes:', error)
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
      contactPerson,
      address,
      city,
      state,
      zipCode,
      minimumOrder,
      creditLimit,
      paymentTerms,
      discountPercentage,
      notes
    } = body

    // Validações básicas
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar ID único
    const id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const query = `
      INSERT INTO customers (
        id, name, email, cnpj, phone, company, contactPerson,
        address, city, state, zipCode,
        minimumOrder, creditLimit, paymentTerms, discountPercentage,
        notes, isActive, isApproved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      id,
      name,
      email,
      cnpj || null,
      phone || null,
      company || null,
      contactPerson || null,
      address || null,
      city || null,
      state || null,
      zipCode || null,
      minimumOrder || 0.00,
      creditLimit || 0.00,
      paymentTerms || 'À vista',
      discountPercentage || 0.00,
      notes || null,
      true, // isActive
      false // isApproved - novos clientes precisam de aprovação
    ]

    await executeQuery(query, values)

    // Buscar o cliente criado
    const [newClient] = await executeQuery(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    )

    return NextResponse.json(
      { message: 'Cliente criado com sucesso', client: newClient },
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
