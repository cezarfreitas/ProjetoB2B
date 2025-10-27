'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload, ArrowLeft, Infinity, Save } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Slide {
  id: string
  name: string
  imageDesktop: string
  imageMobile: string
  link: string
  order: number
  clicks: number
  impressions: number
  isActive: boolean
  isUnlimited: boolean
  startDate: string
  endDate: string
}

export default function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Slide | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const response = await fetch(`/api/hero-slides/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data.slide)
        } else {
          alert('Slide não encontrado')
          router.push('/admin/layout/slider')
        }
      } catch (error) {
        console.error('Erro ao buscar slide:', error)
        alert('Erro ao buscar slide')
        router.push('/admin/layout/slider')
      }
    }

    fetchSlide()
  }, [resolvedParams.id, router])

  const handleSubmit = async () => {
    if (!formData?.name) {
      alert('Por favor, preencha o nome do slide')
      return
    }

    if (!formData?.imageDesktop) {
      alert('Por favor, faça upload da imagem desktop')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/hero-slides/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Slide atualizado com sucesso!')
        router.push('/admin/layout/slider')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar slide')
      }
    } catch (error) {
      console.error('Erro ao atualizar slide:', error)
      alert('Erro ao atualizar slide')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (type: 'desktop' | 'mobile', file: File) => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', 'slider')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        const field = type === 'desktop' ? 'imageDesktop' : 'imageMobile'
        setFormData(prev => prev ? { ...prev, [field]: data.url } : null)
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem')
    }
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0%'
    return ((clicks / impressions) * 100).toFixed(2) + '%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/layout/slider">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Slide</h1>
          <p className="text-gray-600">Atualize as informações do slide</p>
        </div>
      </div>

      {/* Estatísticas do Slide */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Impressões</p>
          <p className="text-2xl font-bold">{formData.impressions.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Cliques</p>
          <p className="text-2xl font-bold">{formData.clicks.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">CTR</p>
          <p className="text-2xl font-bold">{calculateCTR(formData.clicks, formData.impressions)}</p>
        </Card>
      </div>

      {/* Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label>Nome do Slide *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Promoção Verão 2024"
            />
            <p className="text-xs text-muted-foreground">
              Nome descritivo para identificar o slide internamente
            </p>
          </div>

          {/* Imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem Desktop */}
            <div className="space-y-2">
              <Label>Imagem Desktop * (1920x600px recomendado)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition-colors">
                {formData.imageDesktop ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded overflow-hidden">
                      <Image
                        src={formData.imageDesktop}
                        alt="Preview Desktop"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImageUpload('desktop', file)
                        }
                        input.click()
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Trocar Imagem
                    </Button>
                  </div>
                ) : (
                  <button
                    className="w-full flex flex-col items-center justify-center py-12 text-gray-500 hover:text-primary transition-colors"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleImageUpload('desktop', file)
                      }
                      input.click()
                    }}
                  >
                    <Upload className="w-12 h-12 mb-3" />
                    <span className="text-sm font-medium">Clique para fazer upload</span>
                    <span className="text-xs text-gray-400 mt-1">Tamanho recomendado: 1920x600px</span>
                  </button>
                )}
              </div>
            </div>

            {/* Imagem Mobile */}
            <div className="space-y-2">
              <Label>Imagem Mobile (768x600px recomendado)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition-colors">
                {formData.imageMobile ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded overflow-hidden">
                      <Image
                        src={formData.imageMobile}
                        alt="Preview Mobile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImageUpload('mobile', file)
                        }
                        input.click()
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Trocar Imagem
                    </Button>
                  </div>
                ) : (
                  <button
                    className="w-full flex flex-col items-center justify-center py-12 text-gray-500 hover:text-primary transition-colors"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleImageUpload('mobile', file)
                      }
                      input.click()
                    }}
                  >
                    <Upload className="w-12 h-12 mb-3" />
                    <span className="text-sm font-medium">Clique para fazer upload</span>
                    <span className="text-xs text-gray-400 mt-1">Tamanho recomendado: 768x600px</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label>Link de Destino *</Label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/catalog ou /category/chinelos"
            />
            <p className="text-xs text-muted-foreground">
              URL para onde o usuário será direcionado ao clicar no slide
            </p>
          </div>

          {/* Período de Exibição */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unlimited"
                checked={formData.isUnlimited}
                onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="unlimited" className="cursor-pointer flex items-center gap-2">
                <Infinity className="w-4 h-4" />
                Exibição Ilimitada
              </Label>
            </div>

            {!formData.isUnlimited && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Slide Ativo
            </Label>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Link href="/admin/layout/slider">
          <Button variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  )
}

