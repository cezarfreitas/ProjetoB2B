import React from 'react'
import { SidebarExpandableButton } from './SidebarButton'
import { SidebarMenuItem } from '@/lib/admin-sidebar'

interface SidebarMenuSectionProps {
  section: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    items: SidebarMenuItem[]
  }
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  onItemClick: (item: SidebarMenuItem) => void
  isItemActive: (href: string) => boolean
}

export function SidebarMenuSection({
  section,
  isActive,
  isExpanded,
  onToggle,
  onItemClick,
  isItemActive
}: SidebarMenuSectionProps) {
  return (
    <div>
      <SidebarExpandableButton
        icon={section.icon}
        isActive={isActive}
        isExpanded={isExpanded}
        onClick={onToggle}
      >
        {section.label}
      </SidebarExpandableButton>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="ml-4 space-y-1 mt-1 border-l-2 border-gray-700 pl-2">
          {section.items.map((item) => (
            <SidebarExpandableButton
              key={item.id}
              icon={item.icon}
              isActive={isItemActive(item.href)}
              onClick={() => onItemClick(item)}
            >
              {item.label}
            </SidebarExpandableButton>
          ))}
        </div>
      </div>
    </div>
  )
}
