'use client'

import { ReactNode } from 'react'
import { usePublicAccess } from '@/hooks/usePublicAccess'

interface PublicAccessWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper que aguarda as configurações de acesso público serem carregadas
 * antes de renderizar o conteúdo. Evita o "flash" de conteúdo.
 */
export function PublicAccessWrapper({ children, fallback }: PublicAccessWrapperProps) {
  const { isLoading } = usePublicAccess()

  // Enquanto está carregando as configurações de acesso, mostra fallback ou nada
  if (isLoading) {
    return fallback ? <>{fallback}</> : null
  }

  // Configurações carregadas, renderiza o conteúdo
  return <>{children}</>
}

