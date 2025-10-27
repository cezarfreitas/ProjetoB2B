import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verificar token JWT
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar se é vendedor
    if (decoded.role !== 'seller') {
      return NextResponse.json(
        { error: 'Apenas vendedores podem gerar links de cadastro' },
        { status: 403 }
      )
    }

    const { brandIds, customerName, customerWhatsapp, customerEmail, expirationDays } = await request.json()

    // Validações
    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos uma marca' },
        { status: 400 }
      )
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: 'Nome do cliente é obrigatório' },
        { status: 400 }
      )
    }

    if (!customerWhatsapp || !customerWhatsapp.trim()) {
      return NextResponse.json(
        { error: 'WhatsApp do cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Gerar token único
    const registrationToken = crypto.randomBytes(32).toString('hex')

    // Calcular data de expiração
    const expiresAt = new Date()
    const days = expirationDays && expirationDays > 0 ? expirationDays : 7
    expiresAt.setDate(expiresAt.getDate() + days)

    // Salvar token no banco com todas as informações
    await executeQuery(
      `INSERT INTO registration_tokens 
       (token, seller_id, brand_ids, customer_name, customer_whatsapp, customer_email, expires_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        registrationToken,
        decoded.userId,
        JSON.stringify(brandIds),
        customerName.trim(),
        customerWhatsapp.trim(),
        customerEmail?.trim() || null,
        expiresAt
      ]
    )

    console.log('✅ Link de cadastro gerado:', {
      sellerId: decoded.userId,
      token: registrationToken,
      customerName,
      customerWhatsapp,
      customerEmail,
      brandIds,
      expiresAt
    })

    return NextResponse.json({
      token: registrationToken,
      expiresAt: expiresAt.toISOString(),
      brandIds
    })

  } catch (error) {
    console.error('❌ Erro ao gerar link de cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

