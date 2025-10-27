import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST() {
  try {
    // Adicionar coluna brandIds se não existir
    await executeQuery(`
      ALTER TABLE sellers 
      ADD COLUMN IF NOT EXISTS brandIds JSON NULL AFTER region
    `)

    return NextResponse.json({
      success: true,
      message: 'Coluna brandIds adicionada com sucesso!'
    })
  } catch (error: any) {
    console.error('Error adding brandIds column:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar coluna' },
      { status: 500 }
    )
  }
}

