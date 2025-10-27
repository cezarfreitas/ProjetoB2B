import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validatePasswordStrength } from '@/lib/password'

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, cnpj, phone, whatsapp, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Garantir coluna password (para bancos ainda sem a coluna)
    const cols: any = await executeQuery(
      `SELECT COUNT(*) as cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password'`
    )

    if ((cols?.[0]?.cnt || 0) === 0) {
      await executeQuery(`ALTER TABLE customers ADD COLUMN password varchar(255) NULL AFTER email`)
    }

    // Política de senha segura
    const strength = validatePasswordStrength(password, { email, name })
    if (!strength.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: strength.errors },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const checkEmailQuery = 'SELECT id FROM customers WHERE email = ?'
    const existingUsers = await executeQuery(checkEmailQuery, [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (cnpj) {
      const checkCnpjQuery = 'SELECT id FROM customers WHERE cnpj = ?'
      const existingCnpj = await executeQuery(checkCnpjQuery, [cnpj])

      if (Array.isArray(existingCnpj) && existingCnpj.length > 0) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Gerar ID curto e seguro (<= 20 chars) para caber com folga em varchar(25)
    const ts = Date.now().toString(36) // ~8 chars
    const rnd = Math.random().toString(36).slice(2, 6) // 4 chars
    let id = `c_${ts}${rnd}` // ~1 + 8 + 4 = 13 chars
    if (id.length > 20) id = id.slice(0, 20)

    // Inserir novo usuário
    const insertQuery = `
      INSERT INTO customers (
        id, name, email, company, cnpj, phone, whatsapp, password,
        isActive, isApproved, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())
    `

    await executeQuery(insertQuery, [
      id,
      name,
      email,
      company || null,
      cnpj || null,
      phone || null,
      whatsapp || null,
      hashedPassword
    ])

    // Buscar usuário criado (sem senha)
    const getUserQuery = `
      SELECT 
        id, name, email, company, cnpj, phone, whatsapp,
        isActive, isApproved, createdAt
      FROM customers 
      WHERE id = ?
    `

    const newUsers = await executeQuery(getUserQuery, [id])
    const user = Array.isArray(newUsers) ? newUsers[0] : null

    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Conta criada com sucesso',
      token,
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no registro:', error)
    
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

    // Verificar se é erro de conexão com banco
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
