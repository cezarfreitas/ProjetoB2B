import { NextRequest, NextResponse } from 'next/server'

// Dados mockados para usuários do sistema
const mockUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@admin.com',
    whatsapp: '(11) 99999-1111',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-12-01T08:00:00Z',
    permissions: ['users', 'products', 'orders', 'settings']
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@admin.com',
    whatsapp: '(11) 99999-2222',
    isActive: true,
    lastLogin: '2024-01-14T15:45:00Z',
    createdAt: '2023-11-15T09:30:00Z',
    permissions: ['products', 'orders', 'customers']
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro@admin.com',
    whatsapp: '(11) 99999-3333',
    isActive: true,
    lastLogin: '2024-01-13T14:20:00Z',
    createdAt: '2023-10-20T11:15:00Z',
    permissions: ['products', 'customers']
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana@admin.com',
    whatsapp: '(11) 99999-4444',
    isActive: false,
    lastLogin: '2024-01-10T16:30:00Z',
    createdAt: '2023-09-05T13:45:00Z',
    permissions: ['users', 'products', 'orders', 'settings']
  },
  {
    id: 5,
    name: 'Carlos Ferreira',
    email: 'carlos@admin.com',
    whatsapp: '(11) 99999-5555',
    isActive: true,
    lastLogin: '2024-01-12T09:15:00Z',
    createdAt: '2023-08-12T10:20:00Z',
    permissions: ['orders', 'customers']
  },
  {
    id: 6,
    name: 'Lucia Mendes',
    email: 'lucia@admin.com',
    whatsapp: '(11) 99999-6666',
    isActive: true,
    lastLogin: '2024-01-11T12:00:00Z',
    createdAt: '2023-07-18T14:30:00Z',
    permissions: ['users', 'products', 'orders', 'settings', 'reports']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredUsers = [...mockUsers]

    // Filtrar por status
    if (status === 'active') {
      filteredUsers = filteredUsers.filter(user => user.isActive)
    } else if (status === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !user.isActive)
    }

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.whatsapp.toLowerCase().includes(searchLower)
      )
    }

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json(filteredUsers)

  } catch (error) {
    console.error('❌ Erro ao buscar usuários do sistema:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários do sistema' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, isActive, role, permissions } = await request.json()

    // Simular atualização (em uma implementação real, isso seria salvo no banco)
    const userIndex = mockUsers.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        isActive: isActive !== undefined ? isActive : mockUsers[userIndex].isActive,
        role: role || mockUsers[userIndex].role,
        permissions: permissions || mockUsers[userIndex].permissions
      }
    }

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 200))

    return NextResponse.json({ message: 'Usuário atualizado com sucesso' })

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Simular exclusão (em uma implementação real, isso seria removido do banco)
    const userIndex = mockUsers.findIndex(user => user.id === parseInt(id))
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1)
    }

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 200))

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })

  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}
