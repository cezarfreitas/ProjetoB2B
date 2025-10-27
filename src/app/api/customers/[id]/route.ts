import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar customer específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        c.brandIds,
        c.registrationDate,
        c.notes,
        c.createdAt,
        c.updatedAt
      FROM customers c
      WHERE c.id = ?
    `

    const result = await executeQuery(query, [id])
    console.log('🔍 API GET /customers/[id] - Resultado da query:', result)
    console.log('🔍 API GET /customers/[id] - ID buscado:', id)

    // Verificar se o resultado é um array ou se está dentro de um array
    let customers
    if (Array.isArray(result)) {
      customers = result
    } else if (Array.isArray(result[0])) {
      customers = result[0]
    } else {
      customers = result
    }

    console.log('🔍 API GET /customers/[id] - Customers processado:', customers)

    if (!Array.isArray(customers) || customers.length === 0) {
      console.log('❌ API GET /customers/[id] - Customer não encontrado')
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ API GET /customers/[id] - Customer encontrado:', customers[0])
    
    // Processar brandIds se existir
    const customer = customers[0]
    if (customer.brandIds) {
      // Se já é um array, usar diretamente
      if (Array.isArray(customer.brandIds)) {
        console.log('✅ brandIds já é um array:', customer.brandIds)
      } else {
        // Se é string JSON, fazer parse
        try {
          customer.brandIds = JSON.parse(customer.brandIds)
          console.log('✅ brandIds convertido de JSON:', customer.brandIds)
        } catch (error) {
          console.error('Erro ao fazer parse do brandIds:', error)
          customer.brandIds = []
        }
      }
    } else {
      customer.brandIds = []
    }
    
    console.log('✅ API GET /customers/[id] - Customer processado com brandIds:', customer.brandIds)
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Erro ao buscar customer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      isActive,
      isApproved,
      sellerId,
      brandIds,
      notes
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
        minimumOrder = ?,
        isActive = ?,
        isApproved = ?,
        sellerId = ?,
        brandIds = ?,
        notes = ?,
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
      minimumOrder || 0.00,
      isActive !== undefined ? isActive : true,
      isApproved !== undefined ? isApproved : false,
      sellerId || null,
      brandIds ? JSON.stringify(brandIds) : '[]',
      notes || null,
      id
    ]

    console.log('🔍 API PUT /customers/[id] - Valores sendo enviados:', values)
    console.log('🔍 API PUT /customers/[id] - brandIds:', brandIds)
    console.log('🔍 API PUT /customers/[id] - brandIds JSON:', brandIds ? JSON.stringify(brandIds) : '[]')
    
    const result = await executeQuery(query, values)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o customer atualizado
    const [updatedCustomer] = await executeQuery(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    )

    return NextResponse.json({
      message: 'Customer atualizado com sucesso',
      customer: updatedCustomer
    })
  } catch (error) {
    console.error('Erro ao atualizar customer:', error)
    
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

// DELETE - Deletar customer (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete - apenas desativa o customer
    const query = `
      UPDATE customers SET
        isActive = false,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const result = await executeQuery(query, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Customer desativado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar customer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
