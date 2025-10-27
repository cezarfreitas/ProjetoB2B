import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: 'server.idenegociosdigitais.com.br',
  port: 3394,
  user: 'b2btropical',
  password: 'facbe3b2f9dfa94ddb49',
  database: 'b2btropical',
  charset: 'utf8mb4'
}

// GET - Estatísticas dos pedidos
export async function GET(request: NextRequest) {
  let connection
  
  try {
    connection = await mysql.createConnection(dbConfig)

    // Buscar estatísticas dos pedidos
    const [orderStats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(totalAmount), 0) as totalValue,
        COALESCE(AVG(totalAmount), 0) as averageOrderValue,
        COUNT(CASE WHEN paymentStatus = 'PENDING' THEN 1 END) as unpaidOrders
      FROM orders
    `)

    // Buscar total de itens vendidos
    const [itemsStats] = await connection.execute(`
      SELECT 
        COALESCE(SUM(quantity), 0) as totalItemsSold
      FROM order_items
    `)

    const orderData = (orderStats as any[])[0]
    const itemsData = (itemsStats as any[])[0]

    const stats = {
      totalOrders: Number(orderData.totalOrders),
      totalValue: Number(orderData.totalValue),
      totalItemsSold: Number(itemsData.totalItemsSold),
      averageOrderValue: Number(orderData.averageOrderValue),
      unpaidOrders: Number(orderData.unpaidOrders)
    }

    return NextResponse.json({ stats })
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
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
