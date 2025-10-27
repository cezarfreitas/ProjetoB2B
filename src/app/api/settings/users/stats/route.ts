import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Estatísticas mockadas baseadas nos dados de exemplo
    const stats = {
      // Estatísticas gerais
      totalUsers: 6,
      activeUsers: 5,
      inactiveUsers: 1,
      
      // Estatísticas de atividade
      usersOnlineToday: 3,
      usersOnlineThisWeek: 5,
      newUsersThisMonth: 1
    }

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 200))

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de usuários' },
      { status: 500 }
    )
  }
}
