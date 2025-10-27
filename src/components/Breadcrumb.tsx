'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-2 overflow-x-auto">
      <Link 
        href="/" 
        className="flex items-center hover:text-primary transition-colors flex-shrink-0"
      >
        <Home className="h-3 w-3" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1 flex-shrink-0">
          <ChevronRight className="h-3 w-3 text-gray-400" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-primary transition-colors"
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{truncateText(item.label, 15)}</span>
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{truncateText(item.label, 15)}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
