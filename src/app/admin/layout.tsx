'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getSidebarConfig, SIDEBAR_STYLES } from '@/lib/admin-sidebar'
import { SidebarButton, SidebarExpandableButton } from '@/components/admin/SidebarButton'
import { useAuth } from '@/contexts/AuthContext'
import SEO from '@/components/SEO'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [storeName, setStoreName] = useState('')
  
  // Obter configuração de menu (sempre admin por padrão, sem proteção)
  const sidebarConfig = getSidebarConfig('admin')

  // Buscar nome e logo da loja
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch('/api/settings/store')
        if (response.ok) {
          const data = await response.json()
          setStoreName(data.storeName)
          // Atualizar título da página dinamicamente
          document.title = `${data.storeName} - Admin`
        }
      } catch (error) {
        console.error('Erro ao buscar configurações da loja:', error)
        // Sem fallback - manter título vazio até carregar
      }
    }
    fetchStoreSettings()
  }, [])

  // Auto-expand menus if user is on a submenu page
  useEffect(() => {
    const newExpandedSections: Record<string, boolean> = {}
    
    sidebarConfig.forEach(section => {
      if (section.items.some(item => pathname.startsWith(item.href))) {
        newExpandedSections[section.id] = true
      }
    })
    
    setExpandedSections(newExpandedSections)
  }, [pathname, sidebarConfig])

  const isActive = (path: string) => pathname === path
  const isSectionActive = (sectionId: string) => {
    const section = sidebarConfig.find(s => s.id === sectionId)
    return section?.items.some(item => pathname.startsWith(item.href)) || false
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <>
      <SEO title="Painel Administrativo" noIndex={true} />
      <div className="min-h-screen bg-gray-50">
        <div className="flex w-full">
          {/* Sidebar */}
          <div className={SIDEBAR_STYLES.container}>
            <div className={SIDEBAR_STYLES.header}>
              <div className="mb-2">
                <h2 className={SIDEBAR_STYLES.title}>{storeName}</h2>
              </div>
              <p className={SIDEBAR_STYLES.subtitle}>Painel Administrativo</p>
            </div>
            
            <nav className={SIDEBAR_STYLES.nav}>
              <div className={SIDEBAR_STYLES.navContent}>
                {sidebarConfig.map((section) => (
                  <div key={section.id}>
                    {section.items.length === 1 ? (
                      <SidebarButton
                        href={section.items[0].href}
                        icon={section.items[0].icon}
                        isActive={isActive(section.items[0].href)}
                      >
                        {section.items[0].label}
                      </SidebarButton>
                    ) : (
                      <>
                        <SidebarExpandableButton
                          icon={section.icon}
                          isActive={isSectionActive(section.id)}
                          isExpanded={expandedSections[section.id] || false}
                          onClick={() => toggleSection(section.id)}
                        >
                          {section.label}
                        </SidebarExpandableButton>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className={SIDEBAR_STYLES.submenu}>
                            {section.items.map((item) => (
                              <SidebarButton
                                key={item.id}
                                href={item.href}
                                icon={item.icon}
                                isActive={isActive(item.href)}
                                isSubmenu={true}
                              >
                                {item.label}
                              </SidebarButton>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-1.5">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
