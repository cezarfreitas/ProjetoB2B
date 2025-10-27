'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Linkedin,
  CreditCard,
  Shield,
  Clock,
  Truck
} from 'lucide-react'

interface StoreSettings {
  storeName: string
  logoUrl: string
  description: string
  email: string
  contactPhone: string
  address: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cnpj: string
  facebook: string
  instagram: string
  tiktok: string
  linkedin: string
}

const defaultSettings: StoreSettings = {
  storeName: 'B2B Tropical',
  logoUrl: '',
  description: '',
  email: '',
  contactPhone: '',
  address: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  cnpj: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  linkedin: ''
}

// Cache em memória (compartilhado entre todas as instâncias)
let cachedSettings: StoreSettings | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || defaultSettings)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const fetchStoreSettings = async () => {
      // Verificar cache em memória
      const now = Date.now()
      if (cachedSettings && (now - cacheTimestamp < CACHE_DURATION)) {
        setSettings(cachedSettings)
        return
      }

      try {
        // Fetch com cache do navegador
        const response = await fetch('/api/settings/store', {
          cache: 'force-cache',
          next: { revalidate: 300 }
        })
        
        if (response.ok) {
          const data = await response.json()
          const newSettings: StoreSettings = {
            storeName: data.storeName || 'B2B Tropical',
            logoUrl: data.logoUrl || '',
            description: data.description || '',
            email: data.email || '',
            contactPhone: data.contactPhone || '',
            address: data.address || '',
            street: data.street || '',
            number: data.number || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
            cnpj: data.cnpj || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            tiktok: data.tiktok || '',
            linkedin: data.linkedin || ''
          }
          
          // Atualizar cache em memória
          cachedSettings = newSettings
          cacheTimestamp = now
          setSettings(newSettings)
        }
      } catch (error) {
        console.error('Erro ao buscar configurações da loja:', error)
      }
    }

    fetchStoreSettings()
    
    // Atualizar quando as configurações mudarem
    const handleSettingsUpdate = () => {
      cachedSettings = null // Limpar cache
      fetchStoreSettings()
    }
    
    window.addEventListener('storeSettingsUpdated', handleSettingsUpdate)
    return () => window.removeEventListener('storeSettingsUpdated', handleSettingsUpdate)
  }, [])

  return (
    <footer className="bg-black text-gray-300">
      {/* Benefícios */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Entrega Rápida</h4>
                <p className="text-sm text-gray-400">Em todo o Brasil</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Compra Segura</h4>
                <p className="text-sm text-gray-400">Ambiente protegido</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Pagamento Facilitado</h4>
                <p className="text-sm text-gray-400">Várias opções</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Atendimento Ágil</h4>
                <p className="text-sm text-gray-400">Suporte dedicado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Sobre */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              {settings.logoUrl ? (
                <div className="relative w-40 h-20">
                  <Image
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-white">{settings.storeName}</h3>
              )}
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {settings.description || 'Plataforma completa para compras empresariais. Qualidade, variedade e os melhores preços para o seu negócio.'}
            </p>
            <div className="flex gap-4">
              {settings.facebook && (
                <a 
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 text-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {settings.instagram && (
                <a 
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 text-primary hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {settings.tiktok && (
                <a 
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 text-primary hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {settings.linkedin && (
                <a 
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 text-primary hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          {/* Informações */}
          <div>
            <h3 className="text-white font-bold text-xl mb-6">Institucional</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-base">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-base">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-base">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-base">
                  Política de Troca
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors text-base">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-bold text-xl mb-6">Contato</h3>
            <ul className="space-y-5">
              {settings.email && (
                <li className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-primary transition-colors text-base">
                      {settings.email}
                    </a>
                  </div>
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Telefone</p>
                    <a href={`tel:+55${settings.contactPhone.replace(/\D/g, '')}`} className="text-gray-400 hover:text-primary transition-colors text-base">
                      {settings.contactPhone}
                    </a>
                  </div>
                </li>
              )}
              {(settings.street || settings.address) && (
                <li className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Endereço</p>
                    <p className="text-gray-400 text-base leading-relaxed">
                      {settings.street && settings.number ? (
                        <>
                          {settings.street}, {settings.number}<br />
                          {settings.neighborhood && `${settings.neighborhood} - `}
                          {settings.city}/{settings.state}
                        </>
                      ) : (
                        settings.address
                      )}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {currentYear} {settings.storeName}. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              {settings.cnpj && <span>CNPJ: {settings.cnpj}</span>}
              {settings.cnpj && <span className="hidden md:inline">|</span>}
              <Link href="#" className="hover:text-primary transition-colors">
                Desenvolvido por B2B Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

