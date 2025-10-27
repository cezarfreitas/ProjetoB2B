import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json() // email ou whatsapp

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email ou WhatsApp é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se é email ou whatsapp
    const isEmail = identifier.includes('@')
    
    // Buscar usuário por email ou whatsapp
    const checkUserQuery = isEmail
      ? 'SELECT id, name, email, whatsapp FROM customers WHERE email = ? AND isActive = 1'
      : 'SELECT id, name, email, whatsapp FROM customers WHERE whatsapp = ? AND isActive = 1'
    
    const users = await executeQuery(checkUserQuery, [identifier])

    if (!Array.isArray(users) || users.length === 0) {
      // Por segurança, não informamos se o email/whatsapp existe ou não
      return NextResponse.json({
        message: 'Se os dados estiverem corretos, você receberá um link de recuperação'
      })
    }

    const user = users[0]

    // Gerar token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Verificar se a coluna resetToken existe
    const checkColumnQuery = `
      SELECT COUNT(*) as cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME = 'resetToken'
    `
    const cols: any = await executeQuery(checkColumnQuery)

    // Adicionar colunas se não existirem
    if ((cols?.[0]?.cnt || 0) === 0) {
      await executeQuery(`
        ALTER TABLE customers 
        ADD COLUMN resetToken VARCHAR(255) NULL,
        ADD COLUMN resetTokenExpiry DATETIME NULL
      `)
    }

    // Salvar token no banco
    const updateQuery = `
      UPDATE customers 
      SET resetToken = ?, resetTokenExpiry = ? 
      WHERE id = ?
    `
    await executeQuery(updateQuery, [resetToken, resetTokenExpiry, user.id])

    // Aqui você implementaria o envio de email ou WhatsApp
    // Por enquanto, vamos apenas retornar o link (para desenvolvimento)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    console.log('Link de recuperação:', resetLink)
    console.log('Para o usuário:', user.email || user.whatsapp)

    // TODO: Implementar envio de email ou mensagem WhatsApp real
    if (user.email && isEmail) {
      // await sendPasswordResetEmail(user.email, user.name, resetLink)
      console.log('Email seria enviado para:', user.email)
    } else if (user.whatsapp) {
      // await sendWhatsAppMessage(user.whatsapp, resetLink)
      console.log('WhatsApp seria enviado para:', user.whatsapp)
    }

    return NextResponse.json({
      message: isEmail 
        ? 'Link de recuperação enviado para seu email'
        : 'Link de recuperação enviado para seu WhatsApp',
      // Em produção, remover a linha abaixo
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    })

  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

