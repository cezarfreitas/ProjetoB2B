import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import jwt from 'jsonwebtoken'

// GET - Buscar carrinho do cliente
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Buscar apenas itens ativos do carrinho
    const cartItems = await executeQuery(
      `SELECT 
        id,
        product_id as productId,
        variant_id as variantId,
        quantity,
        price,
        product_name as name,
        product_image as image,
        variant_info as variant,
        cart_session_id as sessionId
      FROM cart
      WHERE customer_id = ? AND status = 'active'
      ORDER BY created_at DESC`,
      [decoded.userId]
    )

    // Parse variant_info JSON
    const formattedItems = (cartItems as any[]).map(item => ({
      ...item,
      variant: item.variant ? (typeof item.variant === 'string' ? JSON.parse(item.variant) : item.variant) : null
    }))

    return NextResponse.json(formattedItems)

  } catch (error) {
    console.error('❌ Erro ao buscar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar carrinho' },
      { status: 500 }
    )
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    const { productId, variantId, quantity, price, name, image, variant } = await request.json()

    if (!productId || !quantity || !price || !name) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Gerar ou obter session_id do carrinho ativo
    const sessionResult = await executeQuery(
      `SELECT DISTINCT cart_session_id FROM cart 
       WHERE customer_id = ? AND status = 'active' 
       LIMIT 1`,
      [decoded.userId]
    )
    
    let sessionId: string
    if (Array.isArray(sessionResult) && sessionResult.length > 0 && sessionResult[0].cart_session_id) {
      sessionId = sessionResult[0].cart_session_id
    } else {
      // Criar novo session_id
      sessionId = `cart_${decoded.userId}_${Date.now()}`
    }

    // Verificar se o item já existe no carrinho ativo
    const existingItem = await executeQuery(
      `SELECT id, quantity FROM cart 
       WHERE customer_id = ? AND product_id = ? AND status = 'active'
       AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))`,
      [decoded.userId, productId, variantId || null, variantId || null]
    )

    if (Array.isArray(existingItem) && existingItem.length > 0) {
      // Atualizar quantidade
      const newQuantity = existingItem[0].quantity + quantity
      await executeQuery(
        `UPDATE cart SET quantity = ?, price = ?, updated_at = NOW() WHERE id = ?`,
        [newQuantity, price, existingItem[0].id]
      )

      return NextResponse.json({ 
        message: 'Quantidade atualizada',
        itemId: existingItem[0].id 
      })
    } else {
      // Verificar se existe item arquivado com os mesmos dados para reativar
      const archivedItem = await executeQuery(
        `SELECT id, quantity FROM cart 
         WHERE customer_id = ? AND product_id = ? AND status = 'archived'
         AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
         ORDER BY archived_at DESC LIMIT 1`,
        [decoded.userId, productId, variantId || null, variantId || null]
      )

      if (Array.isArray(archivedItem) && archivedItem.length > 0) {
        // Reativar item arquivado
        const newQuantity = quantity
        await executeQuery(
          `UPDATE cart SET status = 'active', quantity = ?, price = ?, updated_at = NOW(), archived_at = NULL WHERE id = ?`,
          [newQuantity, price, archivedItem[0].id]
        )

        return NextResponse.json({ 
          message: 'Item reativado no carrinho',
          itemId: archivedItem[0].id 
        })
      } else {
        // Inserir novo item
        const result = await executeQuery(
          `INSERT INTO cart (customer_id, status, cart_session_id, product_id, variant_id, quantity, price, product_name, product_image, variant_info)
           VALUES (?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            decoded.userId,
            sessionId,
            productId,
            variantId || null,
            quantity,
            price,
            name,
            image || null,
            variant ? JSON.stringify(variant) : null
          ]
        )

        return NextResponse.json({ 
          message: 'Item adicionado ao carrinho',
          itemId: result.insertId 
        }, { status: 201 })
      }
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar ao carrinho:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar ao carrinho' },
      { status: 500 }
    )
  }
}

// DELETE - Arquivar carrinho (não deleta, apenas marca como arquivado)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Arquivar todos os itens ativos do carrinho
    await executeQuery(
      `UPDATE cart 
       SET status = 'archived', archived_at = NOW() 
       WHERE customer_id = ? AND status = 'active'`,
      [decoded.userId]
    )

    console.log('📦 Carrinho arquivado para cliente:', decoded.userId)

    return NextResponse.json({ message: 'Carrinho arquivado com sucesso' })

  } catch (error) {
    console.error('❌ Erro ao arquivar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro ao arquivar carrinho' },
      { status: 500 }
    )
  }
}

