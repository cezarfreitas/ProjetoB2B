'use client'

import { Suspense } from 'react'
import CatalogPage from './CatalogPageInner'

export default function CatalogContent() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CatalogPage />
    </Suspense>
  )
}

