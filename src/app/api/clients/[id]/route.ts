import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

// GET - Buscar cliente específico
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
      WHERE c.id = ?
    `

    const [clients] = await executeQuery(query, [id])

    if (!Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(clients[0])
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
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
      contactPerson,
      address,
      city,
      state,
      zipCode,
      minimumOrder,
      creditLimit,
      paymentTerms,
      discountPercentage,
      isActive,
      isApproved,
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
        contactPerson = ?,
        address = ?,
        city = ?,
        state = ?,
        zipCode = ?,
        minimumOrder = ?,
        creditLimit = ?,
        paymentTerms = ?,
        discountPercentage = ?,
        isActive = ?,
        isApproved = ?,
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
      contactPerson || null,
      address || null,
      city || null,
      state || null,
      zipCode || null,
      minimumOrder || 0.00,
      creditLimit || 0.00,
      paymentTerms || 'À vista',
      discountPercentage || 0.00,
      isActive !== undefined ? isActive : true,
      isApproved !== undefined ? isApproved : false,
      notes || null,
      id
    ]

    const result = await executeQuery(query, values)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o cliente atualizado
    const [updatedClient] = await executeQuery(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    )

    return NextResponse.json({
      message: 'Cliente atualizado com sucesso',
      client: updatedClient
    })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    
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

// DELETE - Deletar cliente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete - apenas desativa o cliente
    const query = `
      UPDATE customers SET
        isActive = false,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const result = await executeQuery(query, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Cliente desativado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
