import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { id } = params

    const brandIds = data.brandIds && data.brandIds.length > 0 
      ? JSON.stringify(data.brandIds) 
      : null

    // Se senha foi fornecida, atualizar com hash
    if (data.password && data.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(data.password, 10)
      
      await executeQuery(
        `UPDATE sellers SET 
          name = ?,
          email = ?,
          password = ?,
          phone = ?,
          commissionRate = ?,
          region = ?,
          brandIds = ?,
          isActive = ?,
          updatedAt = CURRENT_TIMESTAMP(3)
        WHERE id = ?`,
        [
          data.name,
          data.email,
          hashedPassword,
          data.phone || null,
          data.commissionRate || 0,
          data.region || null,
          brandIds,
          data.isActive !== undefined ? data.isActive : true,
          id
        ]
      )
    } else {
      // Atualizar sem alterar senha
      await executeQuery(
        `UPDATE sellers SET 
          name = ?,
          email = ?,
          phone = ?,
          commissionRate = ?,
          region = ?,
          brandIds = ?,
          isActive = ?,
          updatedAt = CURRENT_TIMESTAMP(3)
        WHERE id = ?`,
        [
          data.name,
          data.email,
          data.phone || null,
          data.commissionRate || 0,
          data.region || null,
          brandIds,
          data.isActive !== undefined ? data.isActive : true,
          id
        ]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating seller:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar vendedor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await executeQuery('DELETE FROM sellers WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting seller:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar vendedor' },
      { status: 500 }
    )
  }
}

