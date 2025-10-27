'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface StoreSettings {
  storeName: string
  logoUrl: string
  description: string
  isLoading: boolean
}

const StoreSettingsContext = createContext<StoreSettings | undefined>(undefined)

const DEFAULT_STORE_NAME = ''
const DEFAULT_DESCRIPTION = ''

// Função para obter valor inicial do localStorage (somente cliente)
function getInitialStoreName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('storeName') || ''
}

function getInitialLogoUrl(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('logoUrl') || ''
}

function getInitialDescription(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('storeDescription') || ''
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  // Inicializar com valores do localStorage se disponível
  const [storeName, setStoreName] = useState(getInitialStoreName)
  const [logoUrl, setLogoUrl] = useState(getInitialLogoUrl)
  const [description, setDescription] = useState(getInitialDescription)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Marcar como montado
  useEffect(() => {
    setIsMounted(true)
    setIsLoading(false)
  }, [])

  // Buscar configurações da API
  useEffect(() => {
    if (!isMounted) return

    const fetchStoreSettings = async () => {
      try {
        const response = await fetch('/api/settings/store')
        if (response.ok) {
          const data = await response.json()
          const newStoreName = data.storeName || ''
          const newLogoUrl = data.logoUrl || ''
          const newDescription = data.description || ''
          
          // Só atualizar se houver dados válidos
          if (newStoreName) {
            setStoreName(newStoreName)
            localStorage.setItem('storeName', newStoreName)
          }
          
          if (newLogoUrl) {
            setLogoUrl(newLogoUrl)
            localStorage.setItem('logoUrl', newLogoUrl)
          }
          
          if (newDescription) {
            setDescription(newDescription)
            localStorage.setItem('storeDescription', newDescription)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar configurações da loja:', error)
      }
    }

    fetchStoreSettings()
    
    // Escutar atualizações de configurações
    const handleSettingsUpdate = () => {
      fetchStoreSettings()
    }

    window.addEventListener('storeSettingsUpdated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('storeSettingsUpdated', handleSettingsUpdate)
    }
  }, [isMounted])

  return (
    <StoreSettingsContext.Provider
      value={{
        storeName,
        logoUrl,
        description,
        isLoading
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext)
  if (context === undefined) {
    throw new Error('useStoreSettings deve ser usado dentro de um StoreSettingsProvider')
  }
  return context
}

