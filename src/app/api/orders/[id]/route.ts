import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'

const dbConfig = {
  host: 'server.idenegociosdigitais.com.br',
  port: 3394,
  user: 'b2btropical',
  password: 'facbe3b2f9dfa94ddb49',
  database: 'b2btropical',
  charset: 'utf8mb4'
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// GET - Buscar pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  
  try {
    const { id } = await params
    console.log('Buscando pedido com ID/orderNumber:', id)
    
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
    console.log('User ID:', userId)

    connection = await mysql.createConnection(dbConfig)

    // Buscar pedido por ID ou orderNumber
    const orderQuery = `
      SELECT 
        o.*,
        c.name as customerName,
        c.company as customerCompany,
        c.email as customerEmail,
        c.phone as customerPhone
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      WHERE (o.id = ? OR o.orderNumber = ?) AND o.customerId = ?
    `

    const [orders] = await connection.execute(orderQuery, [id, id, userId])
    console.log('Resultado da busca:', orders)

    if (!Array.isArray(orders) || orders.length === 0) {
      console.log('Pedido não encontrado para:', { id, userId })
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    const order = orders[0]
    console.log('Pedido encontrado:', order.id, order.orderNumber)

    // Buscar itens do pedido
    const itemsQuery = `
      SELECT 
        id,
        productId,
        variantId,
        productName,
        variantName,
        sku,
        quantity,
        unitPrice,
        totalPrice,
        image,
        notes
      FROM order_items
      WHERE orderId = ?
      ORDER BY id
    `

    const [items] = await connection.execute(itemsQuery, [order.id])

    // Montar resposta
    const orderDetails = {
      ...order,
      items: items
    }

    return NextResponse.json(orderDetails)

  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// PUT - Atualizar pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  
  try {
    const { id } = await params
    const body = await request.json()
    
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

    connection = await mysql.createConnection(dbConfig)

    // Verificar se o pedido existe
    const [existingOrder] = await connection.execute(
      'SELECT id FROM orders WHERE id = ?',
      [id]
    )

    if (!Array.isArray(existingOrder) || existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Construir query de atualização dinamicamente
    const allowedFields = [
      'status', 'paymentStatus', 'paymentMethod', 'trackingNumber',
      'shippedDate', 'deliveredDate', 'notes', 'internalNotes'
    ]
    
    const updateFields = []
    const updateValues = []
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(body[field])
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualização' },
        { status: 400 }
      )
    }
    
    updateValues.push(id)
    
    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(', ')}, updatedAt = NOW()
      WHERE id = ?
    `
    
    await connection.execute(updateQuery, updateValues)
    
    // Buscar pedido atualizado
    const [updatedOrder] = await connection.execute(`
      SELECT 
        o.*,
        c.name as customerName,
        c.company as customerCompany,
        c.email as customerEmail,
        c.phone as customerPhone
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      WHERE o.id = ?
    `, [id])
    
    return NextResponse.json(updatedOrder[0])

  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// DELETE - Deletar pedido
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  
  try {
    const { id } = await params
    
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

    connection = await mysql.createConnection(dbConfig)
    await connection.beginTransaction()

    try {
      // Verificar se o pedido existe
      const [existingOrder] = await connection.execute(
        'SELECT id FROM orders WHERE id = ?',
        [id]
      )

      if (!Array.isArray(existingOrder) || existingOrder.length === 0) {
        await connection.rollback()
        return NextResponse.json(
          { error: 'Pedido não encontrado' },
          { status: 404 }
        )
      }

      // Deletar itens do pedido primeiro
      await connection.execute(
        'DELETE FROM order_items WHERE orderId = ?',
        [id]
      )
      
      // Deletar pedido
      await connection.execute(
        'DELETE FROM orders WHERE id = ?',
        [id]
      )
      
      await connection.commit()
      
      return NextResponse.json({ success: true })

    } catch (error) {
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
