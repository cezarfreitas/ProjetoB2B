import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas dos clientes
    const rows = await executeQuery(`
      SELECT 
        COUNT(*) as totalCustomers,
        COUNT(CASE WHEN isActive = 1 THEN 1 END) as activeCustomers,
        COUNT(CASE WHEN isActive = 0 THEN 1 END) as inactiveCustomers,
        COUNT(CASE WHEN isActive = 1 AND isApproved = 0 THEN 1 END) as pendingApproval
      FROM customers
    `)

    const customerData = rows as any[]
    const stats = {
      totalCustomers: Number(customerData[0].totalCustomers) || 0,
      activeCustomers: Number(customerData[0].activeCustomers) || 0,
      inactiveCustomers: Number(customerData[0].inactiveCustomers) || 0,
      pendingApproval: Number(customerData[0].pendingApproval) || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de clientes' },
      { status: 500 }
    )
  }
}

