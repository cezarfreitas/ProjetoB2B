import { useState, useEffect } from 'react'

interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  pendingApproval: number
}

export function useCustomerStats() {
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    pendingApproval: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/customers/stats')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar estatísticas')
        }

        const data = await response.json()
        setStats({
          totalCustomers: Number(data.totalCustomers) || 0,
          activeCustomers: Number(data.activeCustomers) || 0,
          inactiveCustomers: Number(data.inactiveCustomers) || 0,
          pendingApproval: Number(data.pendingApproval) || 0
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar estatísticas de clientes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

