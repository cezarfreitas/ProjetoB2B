import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// PUT - Atualizar quantidade de um item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantidade inválida' },
        { status: 400 }
      )
    }

    // Atualizar quantidade
    await executeQuery(
      `UPDATE cart SET quantity = ?, updated_at = NOW() 
       WHERE id = ? AND customer_id = ? AND status = 'active'`,
      [quantity, id, decoded.userId]
    )

    return NextResponse.json({ message: 'Quantidade atualizada' })

  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar item' },
      { status: 500 }
    )
  }
}

// DELETE - Remover item do carrinho (arquiva o item)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    console.log('🗑️ DELETE - Item ID:', id)
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    console.log('👤 Usuário ID:', decoded.userId)
    console.log('👤 Role:', decoded.role)

    // Verificar se o item existe e pertence ao usuário
    const existingItem = await executeQuery(
      `SELECT * FROM cart WHERE id = ? AND status = 'active'`,
      [id]
    )

    console.log('🔍 Item encontrado:', existingItem)

    if (!Array.isArray(existingItem) || existingItem.length === 0) {
      console.log('❌ Item não encontrado ou já arquivado')
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    console.log('🔍 customer_id do item:', existingItem[0].customer_id)
    console.log('🔍 userId do token:', decoded.userId)
    console.log('✅ IDs coincidem?', String(existingItem[0].customer_id) === String(decoded.userId))

    // Verificar se o item pertence ao usuário
    if (String(existingItem[0].customer_id) !== String(decoded.userId)) {
      console.log('❌ Item não pertence ao usuário')
      return NextResponse.json(
        { error: 'Item não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Arquivar item do carrinho ao invés de deletar
    const result = await executeQuery(
      `UPDATE cart 
       SET status = 'archived', archived_at = NOW() 
       WHERE id = ? AND customer_id = ? AND status = 'active'`,
      [id, decoded.userId]
    )

    console.log('✅ Item arquivado com sucesso:', result)

    return NextResponse.json({ message: 'Item removido do carrinho' })

  } catch (error) {
    console.error('❌ Erro ao remover item:', error)
    return NextResponse.json(
      { error: 'Erro ao remover item' },
      { status: 500 }
    )
  }
}

