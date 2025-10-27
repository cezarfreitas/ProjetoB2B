'use client'

import { useEffect, useMemo } from 'react'
import { useStoreSettings } from '@/contexts/StoreSettingsContext'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  noIndex?: boolean
}

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false
}: SEOProps) {
  // Usar contexto existente - sem flash!
  const { storeName, description: storeDescription } = useStoreSettings()

  // Memoizar valores para evitar recálculos
  const fullTitle = useMemo(() => 
    title ? `${title} - ${storeName}` : storeName,
    [title, storeName]
  )
  
  const fullDescription = useMemo(() => 
    description || storeDescription,
    [description, storeDescription]
  )
  
  const fullUrl = useMemo(() => 
    url || (typeof window !== 'undefined' ? window.location.href : ''),
    [url]
  )

  useEffect(() => {
    // Só atualizar se tiver storeName carregado
    if (!storeName) return
    
    // Atualizar document.title
    document.title = fullTitle

    // Atualizar meta tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.name = name
        document.head.appendChild(element)
      }
      element.content = content
    }

    const updatePropertyTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        document.head.appendChild(element)
      }
      element.content = content
    }

    // Meta tags básicas
    updateMetaTag('description', fullDescription)
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow')
    }

    // Open Graph
    updatePropertyTag('og:title', fullTitle)
    updatePropertyTag('og:description', fullDescription)
    updatePropertyTag('og:type', type)
    if (fullUrl) updatePropertyTag('og:url', fullUrl)
    if (image) updatePropertyTag('og:image', image)

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', fullDescription)
    if (image) updateMetaTag('twitter:image', image)

  }, [fullTitle, fullDescription, fullUrl, image, type, noIndex, storeName])

  return null
}

