import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Excluir password por segurança
    const sellers = await executeQuery(
      'SELECT id, name, email, phone, commissionRate, region, brandIds, isActive, createdAt, updatedAt FROM sellers ORDER BY createdAt DESC'
    )
    
    // Para cada vendedor, buscar as marcas relacionadas
    const sellersWithBrands = await Promise.all(
      sellers.map(async (seller: any) => {
        // Parse brandIds se for string JSON
        let brandIds = []
        if (seller.brandIds) {
          try {
            brandIds = typeof seller.brandIds === 'string' 
              ? JSON.parse(seller.brandIds) 
              : seller.brandIds
          } catch (e) {
            console.error('Erro ao parsear brandIds:', e)
          }
        }
        
        // Buscar nomes das marcas
        let brands = []
        if (brandIds && brandIds.length > 0) {
          const placeholders = brandIds.map(() => '?').join(',')
          const brandsData = await executeQuery(
            `SELECT id, name FROM brands WHERE id IN (${placeholders})`,
            brandIds
          )
          brands = brandsData
        }
        
        return {
          ...seller,
          brandIds,
          brands
        }
      })
    )
    
    return NextResponse.json(sellersWithBrands)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vendedores' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validar senha
    if (!data.password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const brandIds = data.brandIds && data.brandIds.length > 0 
      ? JSON.stringify(data.brandIds) 
      : null
    
    const result = await executeQuery(
      `INSERT INTO sellers (id, name, email, password, phone, commissionRate, region, brandIds, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `seller_${Date.now()}`,
        data.name,
        data.email,
        hashedPassword,
        data.phone || null,
        data.commissionRate || 0,
        data.region || null,
        brandIds,
        data.isActive !== undefined ? data.isActive : true
      ]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error: any) {
    console.error('Error creating seller:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar vendedor' },
      { status: 500 }
    )
  }
}

