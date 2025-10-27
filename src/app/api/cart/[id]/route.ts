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
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Verificar se o item existe e pertence ao usuário
    const existingItem = await executeQuery(
      `SELECT id FROM cart WHERE id = ? AND customer_id = ? AND status = 'active'`,
      [id, decoded.userId]
    )

    if (!Array.isArray(existingItem) || existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Arquivar item do carrinho ao invés de deletar
    await executeQuery(
      `UPDATE cart 
       SET status = 'archived', archived_at = NOW() 
       WHERE id = ? AND customer_id = ? AND status = 'active'`,
      [id, decoded.userId]
    )

    return NextResponse.json({ message: 'Item removido do carrinho' })

  } catch (error) {
    console.error('❌ Erro ao remover item:', error)
    return NextResponse.json(
      { error: 'Erro ao remover item' },
      { status: 500 }
    )
  }
}

