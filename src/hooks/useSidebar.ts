import { useState, useEffect } from 'react'
import { Category, Color } from '@/types/sidebar'

export function useSidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [categoriesResponse, colorsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/characteristics/colors')
        ])

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.filter((category: Category) => category.isActive))
        }

        if (colorsResponse.ok) {
          const colorsData = await colorsResponse.json()
          setColors(colorsData.filter((color: Color) => color.isActive))
        }
      } catch (err) {
        console.error('Erro ao buscar dados do sidebar:', err)
        setError('Erro ao carregar filtros')
      } finally {
        setLoading(false)
      }
    }

    fetchSidebarData()
  }, [])

  return {
    categories,
    colors,
    loading,
    error
  }
}
