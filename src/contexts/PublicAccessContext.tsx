'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export type PublicAccessMode = 'CLOSED' | 'PARTIAL' | 'OPEN'

interface PublicAccessConfig {
  mode: PublicAccessMode
  showProducts: boolean
  showPrices: boolean
  isLoading: boolean
}

const PublicAccessContext = createContext<PublicAccessConfig | undefined>(undefined)

export function PublicAccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [mode, setMode] = useState<PublicAccessMode>('CLOSED')
  const [isLoading, setIsLoading] = useState(true)

  const fetchAccessMode = async () => {
    try {
      const response = await fetch('/api/settings/store')
      if (response.ok) {
        const data = await response.json()
        const newMode = data.publicAccessMode || 'CLOSED'
        
        setMode(newMode)
        
        // Atualizar cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('publicAccessMode', newMode)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de acesso:', error)
      setMode('CLOSED')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Carregar configurações iniciais
    fetchAccessMode()

    // Escutar evento customizado de atualização de configurações
    const handleSettingsUpdate = () => {
      console.log('🔄 Configurações atualizadas, recarregando...')
      fetchAccessMode()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('publicAccessModeUpdated', handleSettingsUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('publicAccessModeUpdated', handleSettingsUpdate)
      }
    }
  }, [])

  // Enquanto está carregando, retorna modo fechado para evitar flash
  if (isLoading) {
    return (
      <PublicAccessContext.Provider
        value={{
          mode: 'CLOSED',
          showProducts: false,
          showPrices: false,
          isLoading: true
        }}
      >
        {children}
      </PublicAccessContext.Provider>
    )
  }

  // Se o usuário está logado, sempre mostra tudo
  if (user) {
    return (
      <PublicAccessContext.Provider
        value={{
          mode: 'OPEN',
          showProducts: true,
          showPrices: true,
          isLoading: false
        }}
      >
        {children}
      </PublicAccessContext.Provider>
    )
  }

  // Configurações baseadas no modo de acesso
  const config: Record<PublicAccessMode, Pick<PublicAccessConfig, 'showProducts' | 'showPrices'>> = {
    CLOSED: {
      showProducts: false,
      showPrices: false
    },
    PARTIAL: {
      showProducts: true,
      showPrices: false
    },
    OPEN: {
      showProducts: true,
      showPrices: true
    }
  }

  return (
    <PublicAccessContext.Provider
      value={{
        mode,
        ...config[mode],
        isLoading: false
      }}
    >
      {children}
    </PublicAccessContext.Provider>
  )
}

export function usePublicAccess() {
  const context = useContext(PublicAccessContext)
  if (context === undefined) {
    throw new Error('usePublicAccess deve ser usado dentro de um PublicAccessProvider')
  }
  return context
}

