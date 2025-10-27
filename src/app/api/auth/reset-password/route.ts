import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo token
    const getUserQuery = `
      SELECT id, email, resetTokenExpiry 
      FROM customers 
      WHERE resetToken = ? AND isActive = 1
    `
    const users = await executeQuery(getUserQuery, [token])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    const user = users[0]

    // Verificar se o token expirou
    const now = new Date()
    const expiry = new Date(user.resetTokenExpiry)

    if (now > expiry) {
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de recuperação' },
        { status: 400 }
      )
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar senha e limpar token
    const updateQuery = `
      UPDATE customers 
      SET password = ?, resetToken = NULL, resetTokenExpiry = NULL 
      WHERE id = ?
    `
    await executeQuery(updateQuery, [hashedPassword, user.id])

    return NextResponse.json({
      message: 'Senha redefinida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

