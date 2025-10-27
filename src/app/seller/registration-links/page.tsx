'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Calendar, User, Mail, Phone, ExternalLink, Trash2, Eye, CheckCircle } from 'lucide-react'

interface RegistrationLink {
  id: number
  token: string
  customer_name: string
  customer_whatsapp: string
  customer_email: string | null
  brand_ids: number[]
  expires_at: string
  used: boolean
  used_at: string | null
  viewed: boolean
  viewed_at: string | null
  view_count: number
  created_at: string
}

interface Brand {
  id: number
  name: string
}

export default function RegistrationLinksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [links, setLinks] = useState<RegistrationLink[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && user?.role !== 'seller') {
      router.push('/catalog')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchLinks()
      fetchBrands()
    }
  }, [user])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seller/registration-links', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Erro ao buscar links:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Erro ao buscar marcas:', error)
    }
  }

  const getBrandNames = (brandIds: number[]) => {
    return brands
      .filter(b => brandIds.includes(b.id))
      .map(b => b.name)
      .join(', ')
  }

  const copyLink = (link: RegistrationLink) => {
    const fullLink = `${window.location.origin}/register?token=${link.token}`
    navigator.clipboard.writeText(fullLink)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Links de Cadastro</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os links de cadastro criados</p>
        </div>

        {/* Lista de Links */}
        {links.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ExternalLink className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum link gerado ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro link de cadastro para compartilhar com clientes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {links.map((link) => {
              const expired = isExpired(link.expires_at)
              const fullLink = `${window.location.origin}/register?token=${link.token}`
              
              return (
                <Card key={link.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {link.customer_name}
                          </h3>
                          {link.used ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Cadastrado
                            </Badge>
                          ) : expired ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Expirado
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Ativo
                            </Badge>
                          )}
                          {link.viewed && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              <Eye className="h-3 w-3 mr-1" />
                              Visualizado {link.view_count}x
                            </Badge>
                          )}
                          {!link.viewed && !link.used && !expired && (
                            <Badge variant="outline" className="text-gray-600">
                              Não visualizado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{link.customer_whatsapp}</span>
                          </div>
                          {link.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{link.customer_email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              Criado: {formatDate(link.created_at)}
                            </span>
                          </div>
                          {link.viewed && link.viewed_at && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Eye className="h-3.5 w-3.5 text-purple-600" />
                              <span className="text-xs text-purple-700">
                                Primeira visualização: {formatDate(link.viewed_at)}
                              </span>
                            </div>
                          )}
                          {link.used && link.used_at && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-xs text-green-700">
                                Cadastrado em: {formatDate(link.used_at)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {expired ? 'Expirou' : 'Expira'} em: {formatDate(link.expires_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Marcas */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Marcas permitidas:</p>
                      <div className="flex flex-wrap gap-1">
                        {link.brand_ids.map((brandId) => {
                          const brand = brands.find(b => b.id === brandId)
                          return brand ? (
                            <Badge key={brandId} variant="secondary" className="text-xs">
                              {brand.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>

                    {/* Link */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Link de cadastro:</p>
                      <p className="text-sm text-gray-900 font-mono break-all">{fullLink}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={copiedId === link.id ? "secondary" : "default"}
                        onClick={() => copyLink(link)}
                        className="flex-1"
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-2" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copiar Link
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

