import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const checkEmailQuery = 'SELECT id FROM customers WHERE email = ?'
    const [existingUsers] = await executeQuery(checkEmailQuery, [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      // Atualizar senha do usuário existente
      const hashedPassword = await bcrypt.hash(password, 12)
      await executeQuery(
        'UPDATE customers SET password = ?, isActive = 1, isApproved = 1 WHERE email = ?',
        [hashedPassword, email]
      )
      
      return NextResponse.json({
        message: 'Usuário existente - senha atualizada',
        email,
        password
      })
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash(password, 12)
    const id = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await executeQuery(`
      INSERT INTO customers (
        id, name, email, company, password,
        isActive, isApproved, createdAt
      ) VALUES (?, ?, ?, ?, ?, 1, 1, NOW())
    `, [id, name, email, company || null, hashedPassword])

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      id,
      email,
      password
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
