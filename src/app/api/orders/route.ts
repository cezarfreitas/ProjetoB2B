import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Configuração do banco de dados
const dbConfig = {
  host: 'server.idenegociosdigitais.com.br',
  port: 3394,
  user: 'b2btropical',
  password: 'facbe3b2f9dfa94ddb49',
  database: 'b2btropical',
  charset: 'utf8mb4'
}

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  let connection
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const sellerId = searchParams.get('sellerId')
    const customerId = searchParams.get('customerId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit

    connection = await mysql.createConnection(dbConfig)

    // Construir condições WHERE
    let whereConditions = []
    let whereParams: any[] = []

    if (status) {
      whereConditions.push('o.status = ?')
      whereParams.push(status)
    }

    if (paymentStatus) {
      whereConditions.push('o.paymentStatus = ?')
      whereParams.push(paymentStatus)
    }

    if (sellerId) {
      whereConditions.push('c.sellerId = ?')
      whereParams.push(sellerId)
    }

    if (customerId) {
      whereConditions.push('o.customerId = ?')
      whereParams.push(customerId)
    }

    if (dateFrom) {
      whereConditions.push('DATE(o.createdAt) >= ?')
      whereParams.push(dateFrom)
    }

    if (dateTo) {
      whereConditions.push('DATE(o.createdAt) <= ?')
      whereParams.push(dateTo)
    }

    if (search) {
      whereConditions.push('(o.orderNumber LIKE ? OR c.name LIKE ? OR c.company LIKE ?)')
      const searchPattern = `%${search}%`
      whereParams.push(searchPattern, searchPattern, searchPattern)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query principal simplificada com LIMIT e OFFSET hardcoded
    const query = `
      SELECT 
        o.*,
        c.name as customerName,
        c.company as customerCompany,
        c.email as customerEmail,
        c.phone as customerPhone
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      ${whereClause}
      ORDER BY o.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [orders] = await connection.execute(query, whereParams)

    // Buscar contagem de itens e soma das quantidades para cada pedido separadamente
    const ordersWithItems = []
    for (const order of (orders as any[])) {
      const [itemCountResult] = await connection.execute(
        'SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as totalQuantity, COALESCE(SUM(totalPrice), 0) as total FROM order_items WHERE orderId = ?',
        [order.id]
      )
      
      const itemData = (itemCountResult as any[])[0]
      ordersWithItems.push({
        ...order,
        itemCount: itemData.totalQuantity, // Agora mostra a soma das quantidades
        itemTypes: itemData.count, // Número de tipos de itens diferentes
        calculatedTotal: itemData.total
      })
    }

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      ${whereClause}
    `

    const [countResult] = await connection.execute(countQuery, whereParams)
    const total = (countResult as any[])[0]?.total || 0

    return NextResponse.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
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

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  let connection
  
  try {
    const body = await request.json()
    const {
      customerId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = 'BANK_TRANSFER',
      notes,
      shippingCost = 0,
      discountAmount = 0
    } = body

    // Validações básicas
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Endereço de entrega é obrigatório' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)
    await connection.beginTransaction()

    try {
      // Gerar ID único para o pedido
      const orderId = `PED${Date.now()}`
      
      // Gerar número do pedido
      const orderNumber = `PED${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString().substr(2, 4)}`

      // Calcular totais
      let subtotal = 0
      for (const item of items) {
        subtotal += (item.unitPrice || 0) * (item.quantity || 1)
      }

      const totalAmount = subtotal + shippingCost - discountAmount

      // Inserir pedido
      const insertOrderQuery = `
        INSERT INTO orders (
          id, orderNumber, customerId, status, paymentStatus, paymentMethod,
          shippingAddress, billingAddress, subtotal, shippingCost, discountAmount,
          totalAmount, notes
        ) VALUES (?, ?, ?, 'PENDING', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)
      `

      await connection.execute(insertOrderQuery, [
        orderId,
        orderNumber,
        customerId,
        paymentMethod,
        JSON.stringify(shippingAddress),
        billingAddress ? JSON.stringify(billingAddress) : null,
        subtotal,
        shippingCost,
        discountAmount,
        totalAmount,
        notes
      ])

      // Inserir itens do pedido
      for (const item of items) {
        const itemId = `ITM${Date.now()}${Math.random().toString().substr(2, 4)}`
        const totalPrice = (item.unitPrice || 0) * (item.quantity || 1)

        const insertItemQuery = `
          INSERT INTO order_items (
            id, orderId, productId, variantId, productName, variantName,
            sku, quantity, unitPrice, totalPrice, image, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        await connection.execute(insertItemQuery, [
          itemId,
          orderId,
          item.productId,
          item.variantId || null,
          item.productName || item.name,
          item.variantName || null,
          item.sku || '',
          item.quantity || 1,
          item.unitPrice || item.price || 0,
          totalPrice,
          item.image || null,
          item.notes || null
        ])
      }

      await connection.commit()

      // Marcar carrinho como convertido (itens ativos viram "converted")
      try {
        await connection.execute(`
          UPDATE cart 
          SET status = 'converted', archived_at = NOW() 
          WHERE customer_id = ? AND status = 'active'
        `, [customerId])
        console.log('✅ Carrinho marcado como convertido para pedido:', orderNumber)
      } catch (cartError) {
        console.error('⚠️ Erro ao marcar carrinho como convertido:', cartError)
        // Não falhar o pedido se houver erro ao atualizar carrinho
      }

      // Buscar pedido criado com detalhes
      const [newOrder] = await connection.execute(`
        SELECT 
          o.*,
          c.name as customerName,
          c.company as customerCompany,
          c.email as customerEmail
        FROM orders o
        LEFT JOIN customers c ON o.customerId = c.id
        WHERE o.id = ?
      `, [orderId])

      return NextResponse.json({
        order: (newOrder as any[])[0],
        message: 'Pedido criado com sucesso'
      }, { status: 201 })

    } catch (error) {
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error)
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
