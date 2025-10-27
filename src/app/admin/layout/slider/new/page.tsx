'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload, ArrowLeft, Infinity, Save } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function NewSlidePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    imageDesktop: '',
    imageMobile: '',
    link: '/catalog',
    isUnlimited: true,
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        setFormData(prev => ({ ...prev, [field]: data.url }))
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Por favor, preencha o nome do slide')
      return
    }

    if (!formData.imageDesktop) {
      alert('Por favor, faça upload da imagem desktop')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Slide criado com sucesso!')
        router.push('/admin/layout/slider')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao criar slide')
      }
    } catch (error) {
      console.error('Erro ao criar slide:', error)
      alert('Erro ao criar slide')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Novo Slide</h1>
          <p className="text-gray-600">Adicione um novo slide ao carrossel</p>
        </div>
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
          {isSubmitting ? 'Salvando...' : 'Salvar Slide'}
        </Button>
      </div>
    </div>
  )
}

