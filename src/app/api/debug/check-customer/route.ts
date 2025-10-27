import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const [users] = await executeQuery(
      'SELECT id, name, email, isActive, isApproved, password IS NOT NULL as hasPassword FROM customers WHERE email = ?',
      [email]
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ exists: false, message: 'Cliente não encontrado' })
    }

    return NextResponse.json({ 
      exists: true, 
      customer: users[0],
      message: users[0].hasPassword ? 'Cliente existe com senha' : 'Cliente existe SEM senha'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

