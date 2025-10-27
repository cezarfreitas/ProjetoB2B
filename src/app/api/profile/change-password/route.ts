import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { hashPassword, verifyPassword } from '@/lib/password'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('🔍 POST /api/profile/change-password - Token decoded:', decoded)
    } catch (err) {
      console.error('❌ POST /api/profile/change-password - Token verification failed:', err)
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId || decoded.id
    console.log('👤 POST /api/profile/change-password - User ID from token:', userId)

    // Obter dados do corpo da requisição
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const [users] = await executeQuery(
      'SELECT id, password FROM customers WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Verificar senha atual
    const isPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword)

    // Atualizar senha
    await executeQuery(
      'UPDATE customers SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    )

    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

