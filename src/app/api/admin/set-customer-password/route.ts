import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/password'

export async function POST(request: NextRequest) {
  try {
    const { email, password, approve } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Política de senha segura
    const check = validatePasswordStrength(password, { email })
    if (!check.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: check.errors },
        { status: 400 }
      )
    }

    // 1) Garante que a coluna password exista (idempotente)
    const cols: any = await executeQuery(
      `SELECT COUNT(*) as cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password'`
    )

    if ((cols?.[0]?.cnt || 0) === 0) {
      await executeQuery(
        `ALTER TABLE customers ADD COLUMN password varchar(255) NULL AFTER email`
      )
    }

    // 2) Confere se o cliente existe
    const existing = await executeQuery(
      'SELECT id, isActive, isApproved FROM customers WHERE email = ? LIMIT 1',
      [email]
    )

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado para este email' },
        { status: 404 }
      )
    }

    // 3) Atualiza a senha (bcrypt)
    const hashedPassword = await bcrypt.hash(password, 12)

    await executeQuery(
      `UPDATE customers
       SET password = ?, isActive = 1, isApproved = COALESCE(?, isApproved), updatedAt = NOW()
       WHERE email = ?`,
      [hashedPassword, approve ? 1 : null, email]
    )

    return NextResponse.json({
      message: 'Senha atualizada com sucesso',
      email,
      approved: !!approve
    })
  } catch (error: any) {
    console.error('Erro ao definir senha do cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}


