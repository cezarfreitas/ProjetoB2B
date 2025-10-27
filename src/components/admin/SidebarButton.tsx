import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SIDEBAR_STYLES } from '@/lib/admin-sidebar'

interface SidebarButtonProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isActive?: boolean
  isSubmenu?: boolean
  onClick?: () => void
}

export function SidebarButton({ 
  href, 
  icon: Icon, 
  children, 
  isActive = false, 
  isSubmenu = false,
  onClick 
}: SidebarButtonProps) {
  const baseClasses = isSubmenu ? SIDEBAR_STYLES.submenuButton : SIDEBAR_STYLES.button
  const activeClasses = isSubmenu ? SIDEBAR_STYLES.submenuButtonActive : SIDEBAR_STYLES.buttonActive
  
  return (
    <Button 
      variant="ghost" 
      className={`${baseClasses} ${isActive ? activeClasses : ''}`}
      asChild
    >
      <Link href={href} onClick={onClick}>
        <Icon className="w-4 h-4 mr-3" />
        {children}
      </Link>
    </Button>
  )
}

interface SidebarExpandableButtonProps {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isActive?: boolean
  isExpanded?: boolean
  onClick: () => void
}

export function SidebarExpandableButton({ 
  icon: Icon, 
  children, 
  isActive = false, 
  isExpanded = false,
  onClick 
}: SidebarExpandableButtonProps) {
  return (
    <Button 
      variant="ghost" 
      className={`${SIDEBAR_STYLES.buttonExpanded} ${isActive ? SIDEBAR_STYLES.buttonActive : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className="w-4 h-4 mr-3" />
        {children}
      </div>
      <ChevronRight 
        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
      />
    </Button>
  )
}
