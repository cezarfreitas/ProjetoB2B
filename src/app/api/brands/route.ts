import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Verificar se há cliente logado e suas marcas permitidas
    let allowedBrandIds: number[] | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
        
        if (decoded.role === 'customer') {
          // Buscar brandIds do customer
          const customerQuery = 'SELECT brandIds FROM customers WHERE id = ?'
          const customerResult = await executeQuery(customerQuery, [decoded.userId])
          const customer = Array.isArray(customerResult) ? customerResult[0] : customerResult
          
          if (customer && customer.brandIds) {
            allowedBrandIds = typeof customer.brandIds === 'string' 
              ? JSON.parse(customer.brandIds) 
              : customer.brandIds
            console.log('🔍 Customer brandIds for brands API:', allowedBrandIds)
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    }
    
    // Montar query com ou sem filtro
    let query = 'SELECT id, name, description, isActive FROM brands WHERE isActive = 1'
    if (allowedBrandIds && allowedBrandIds.length > 0) {
      const brandIdsString = allowedBrandIds.join(',')
      query += ` AND id IN (${brandIdsString})`
      console.log('🔍 Filtering brands by allowed brands:', allowedBrandIds)
    }
    query += ' ORDER BY name ASC'
    
    const brands = await executeQuery(query)
    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar marcas' },
      { status: 500 }
    )
  }
}

