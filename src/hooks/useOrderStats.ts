import { useState, useEffect } from 'react'

interface OrderStats {
  totalOrders: number
  totalValue: number
  totalItemsSold: number
  averageOrderValue: number
  unpaidOrders: number
}

export function useOrderStats() {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalValue: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    unpaidOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/orders/stats')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar estatísticas')
        }
        
        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        setError('Erro ao carregar estatísticas')
        console.error('Erro ao buscar estatísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error
  }
}
