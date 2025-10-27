import { useState, useEffect } from 'react'

interface StoreSettings {
  storeName: string
  logoUrl: string
  description: string
  seoText: string
  contactPhone: string
  address: string
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: '',
    logoUrl: '',
    description: '',
    seoText: '',
    contactPhone: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/settings/store')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações da loja')
        }
        
        const data = await response.json()
        setSettings({
          storeName: data.storeName || '',
          logoUrl: data.logoUrl || '',
          description: data.description || '',
          seoText: data.seoText || '',
          contactPhone: data.contactPhone || '',
          address: data.address || ''
        })
      } catch (err) {
        setError('Erro ao carregar configurações da loja')
        console.error('Erro ao buscar configurações da loja:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error
  }
}
