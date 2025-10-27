import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar buscar como SELLER primeiro
    const sellerQuery = `
      SELECT 
        id, name, email, phone, password, commissionRate, region, brandIds,
        isActive, createdAt, 'seller' as role
      FROM sellers 
      WHERE email = ?
      LIMIT 1
    `
    
    const sellerResult = await executeQuery(sellerQuery, [email]) as any
    const sellers = Array.isArray(sellerResult) ? sellerResult : (Array.isArray(sellerResult[0]) ? sellerResult[0] : [sellerResult])
    
    let user = null
    let userType = ''
    
    if (Array.isArray(sellers) && sellers.length > 0) {
      user = sellers[0]
      userType = 'seller'
      console.log('✅ Seller found:', { id: user.id, email: user.email })
    } else {
      // Se não for seller, buscar como CUSTOMER
      const customerQuery = `
        SELECT 
          id, name, email, company, cnpj, phone, password, brandIds,
          isActive, isApproved, createdAt, 'customer' as role
        FROM customers 
        WHERE email = ?
        LIMIT 1
      `
      
      const customerResult = await executeQuery(customerQuery, [email]) as any
      const customers = Array.isArray(customerResult) ? customerResult : (Array.isArray(customerResult[0]) ? customerResult[0] : [customerResult])
      
      if (Array.isArray(customers) && customers.length > 0) {
        user = customers[0]
        userType = 'customer'
        console.log('✅ Customer found:', { id: user.id, email: user.email })
      }
    }

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    console.log('✅ User found:', { id: user.id, email: user.email, type: userType, hasPassword: !!user.password, isActive: user.isActive })

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Conta inativa. Fale com o suporte.' },
        { status: 403 }
      )
    }
    
    // Verificar aprovação apenas para customers
    if (userType === 'customer' && !user.isApproved) {
      return NextResponse.json(
        { error: 'Conta ainda não aprovada.' },
        { status: 403 }
      )
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log('🔑 Password match:', passwordMatch)
    
    if (!passwordMatch) {
      console.log('❌ Password mismatch')
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    console.log('📤 Resposta do login:')
    console.log('   User ID:', userWithoutPassword.id)
    console.log('   User Email:', userWithoutPassword.email)
    console.log('   User Role:', userWithoutPassword.role)
    console.log('   User completo:', JSON.stringify(userWithoutPassword, null, 2))

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
