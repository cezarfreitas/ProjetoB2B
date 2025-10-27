'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Store, Save, Loader2, Upload, X, Image as ImageIcon, Eye, EyeOff, Lock, Mail, Search } from 'lucide-react'
import Image from 'next/image'

interface StoreSettings {
  storeName: string
  description: string
  contactPhone: string
  address: string
  cnpj: string
  email: string
  detailedAddress: string
  street: string
  number: string
  complement: string
  zipCode: string
  neighborhood: string
  city: string
  state: string
  facebook: string
  instagram: string
  tiktok: string
  googleBusiness: string
  youtube: string
  linkedin: string
  website: string
  logoUrl?: string
  publicAccessMode?: 'closed' | 'partial' | 'open'
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: '',
    description: '',
    contactPhone: '',
    address: '',
    cnpj: '',
    email: '',
    detailedAddress: '',
    street: '',
    number: '',
    complement: '',
    zipCode: '',
    neighborhood: '',
    city: '',
    state: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    googleBusiness: '',
    youtube: '',
    linkedin: '',
    website: '',
    logoUrl: '',
    publicAccessMode: 'open'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/store')
      if (response.ok) {
        const data = await response.json()
        // Converter publicAccessMode para lowercase para o formulário
        setSettings({
          ...data,
          publicAccessMode: data.publicAccessMode?.toLowerCase() || 'open'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      console.log('Salvando configurações:', settings)

      const response = await fetch('/api/settings/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Configurações salvas:', data)
        
        // Atualizar cache do localStorage
        if (data.settings?.publicAccessMode) {
          localStorage.setItem('publicAccessMode', data.settings.publicAccessMode)
          
          // Disparar evento customizado para atualizar todos os componentes
          window.dispatchEvent(new CustomEvent('publicAccessModeUpdated', {
            detail: { mode: data.settings.publicAccessMode }
          }))
        }
        
        // Atualizar cache das configurações da loja
        if (data.settings?.storeName) {
          localStorage.setItem('storeName', data.settings.storeName)
        }
        if (data.settings?.logoUrl) {
          localStorage.setItem('logoUrl', data.settings.logoUrl)
        }
        
        // Disparar evento para atualizar store settings
        window.dispatchEvent(new Event('storeSettingsUpdated'))
        
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso! A visualização será atualizada automaticamente.' })
        // Recarregar configurações para garantir sincronização
        await loadSettings()
      } else {
        const errorData = await response.json()
        console.error('Erro ao salvar:', errorData)
        setMessage({ type: 'error', text: errorData.error || 'Erro ao salvar configurações.' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida.' })
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' })
      return
    }

    try {
      setUploading(true)
      setMessage(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload response:', data)
        setSettings(prev => ({ ...prev, logoUrl: data.url }))
        setMessage({ type: 'success', text: 'Logo enviado com sucesso!' })
      } else {
        const errorData = await response.json()
        console.error('Upload error:', errorData)
        setMessage({ type: 'error', text: errorData.error || 'Erro ao fazer upload do logo.' })
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      setMessage({ type: 'error', text: 'Erro ao fazer upload do logo.' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: '' }))
  }

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        if (response.ok) {
          const data = await response.json()
          if (!data.erro) {
            setSettings(prev => ({
              ...prev,
              street: data.logradouro || '',
              neighborhood: data.bairro || '',
              city: data.localidade || '',
              state: data.uf || '',
              zipCode: cleanCep
            }))
            setMessage({ type: 'success', text: 'CEP encontrado! Campos preenchidos automaticamente.' })
          } else {
            setMessage({ type: 'error', text: 'CEP não encontrado.' })
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        setMessage({ type: 'error', text: 'Erro ao buscar CEP. Tente novamente.' })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-2.5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações da Loja
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as informações básicas da sua loja
          </p>
        </div>
        <Store className="w-8 h-8 text-gray-400" />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{settings.storeName || 'Não definido'}</p>
                <p className="text-xs text-gray-400">Nome da Loja</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{settings.email || 'Não definido'}</p>
                <p className="text-xs text-gray-400">Email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              {settings.publicAccessMode === 'open' ? (
                <Eye className="h-6 w-6 text-primary" />
              ) : settings.publicAccessMode === 'partial' ? (
                <EyeOff className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-primary" />
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {settings.publicAccessMode === 'open' ? 'Aberto' : settings.publicAccessMode === 'partial' ? 'Parcial' : 'Fechado'}
                </p>
                <p className="text-xs text-gray-400">Modo de Acesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicador de Completude */}
      {(() => {
        const allFields = [
          settings.storeName,
          settings.cnpj,
          settings.email,
          settings.contactPhone,
          settings.description,
          settings.logoUrl,
          settings.zipCode,
          settings.street,
          settings.number,
          settings.complement,
          settings.neighborhood,
          settings.city,
          settings.state,
          settings.facebook,
          settings.instagram,
          settings.tiktok,
          settings.youtube,
          settings.linkedin,
          settings.googleBusiness,
          settings.website
        ]
        const filledFields = allFields.filter(field => field && field.trim() !== '').length
        const totalFields = allFields.length
        const percentage = Math.round((filledFields / totalFields) * 100)
        
        return (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className="text-sm font-semibold text-gray-900">
                    Perfil da Loja: {percentage}% completo
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {filledFields} de {totalFields} campos preenchidos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    percentage === 100 ? 'bg-green-500' : percentage >= 70 ? 'bg-blue-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Cards: Informações Básicas + Logo */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Card: Informações Básicas (80%) */}
        <Card className="bg-white border-gray-200 lg:col-span-4">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Store className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">Informações Básicas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Nome da Loja */}
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-sm font-medium">Nome da Loja *</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="Ex: B2B Tropical"
                  className="h-10"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-1.5">
                <Label htmlFor="cnpj" className="text-sm font-medium">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={settings.cnpj}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    const formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                    handleChange('cnpj', formatted)
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="h-10"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="h-10"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone" className="text-sm font-medium">Telefone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                    handleChange('contactPhone', formatted)
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="h-10"
                />
              </div>
            </div>

            {/* Descrição - Largura completa */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva sua loja..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card: Logo (20%) */}
        <Card className="bg-white border-gray-200 lg:col-span-1">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">Logo</h3>
            </div>
            
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Preview do Logo */}
              {settings.logoUrl ? (
                <div className="relative group w-full">
                  <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={settings.logoUrl}
                      alt="Logo da loja"
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Sem logo</p>
                  </div>
                </div>
              )}

              {/* Botão de Upload */}
              <div className="w-full space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-9 w-full text-xs"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      Selecionar
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Máx 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card: Endereço */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Search className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">Endereço Completo</h3>
          </div>
          
          {/* CEP com Busca */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="zipCode" className="text-sm font-medium">CEP *</Label>
              <Input
                id="zipCode"
                value={settings.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2')
                  handleChange('zipCode', formatted)
                  if (value.length === 8) {
                    handleCepSearch(value)
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
                className="h-10"
              />
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button
                type="button"
                size="sm"
                onClick={() => handleCepSearch(settings.zipCode)}
                disabled={settings.zipCode.replace(/\D/g, '').length !== 8}
                className="h-10 bg-black hover:bg-gray-900 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar CEP
              </Button>
            </div>
          </div>

          {/* Rua e Número */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-1.5">
              <Label htmlFor="street" className="text-sm font-medium">Rua *</Label>
              <Input
                id="street"
                value={settings.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Nome da rua"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="number" className="text-sm font-medium">Número *</Label>
              <Input
                id="number"
                value={settings.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="123"
                className="h-10"
              />
            </div>
          </div>

          {/* Complemento e Bairro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
              <Input
                id="complement"
                value={settings.complement}
                onChange={(e) => handleChange('complement', e.target.value)}
                placeholder="Apto, sala, etc."
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm font-medium">Bairro *</Label>
              <Input
                id="neighborhood"
                value={settings.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Nome do bairro"
                className="h-10"
              />
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="city" className="text-sm font-medium">Cidade *</Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Nome da cidade"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-sm font-medium">Estado *</Label>
              <Input
                id="state"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                placeholder="UF"
                maxLength={2}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Redes Sociais */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">Redes Sociais</h3>
          </div>
          
          {/* Facebook */}
          <div className="space-y-1.5">
              <Label htmlFor="facebook" className="text-sm font-medium">Facebook</Label>
              <Input
                id="facebook"
                value={settings.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/sualoja"
                className="h-10"
              />
            </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
            <Input
              id="instagram"
              value={settings.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="https://instagram.com/sualoja"
              className="h-10"
            />
          </div>

          {/* TikTok */}
          <div className="space-y-1.5">
            <Label htmlFor="tiktok" className="text-sm font-medium">TikTok</Label>
            <Input
              id="tiktok"
              value={settings.tiktok}
              onChange={(e) => handleChange('tiktok', e.target.value)}
              placeholder="https://tiktok.com/@sualoja"
              className="h-10"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <Label htmlFor="youtube" className="text-sm font-medium">YouTube</Label>
            <Input
              id="youtube"
              value={settings.youtube}
              onChange={(e) => handleChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@sualoja"
              className="h-10"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</Label>
            <Input
              id="linkedin"
              value={settings.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/sualoja"
              className="h-10"
            />
          </div>

          {/* Google Meu Negócio */}
          <div className="space-y-1.5">
            <Label htmlFor="googleBusiness" className="text-sm font-medium">Google Meu Negócio</Label>
            <Input
              id="googleBusiness"
              value={settings.googleBusiness}
              onChange={(e) => handleChange('googleBusiness', e.target.value)}
              placeholder="https://business.google.com/sualoja"
              className="h-10"
            />
          </div>

          {/* Site Oficial */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium">Site Oficial</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.sualoja.com.br"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

      {/* Card: Controle de Acesso */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">Controle de Acesso</h3>
          </div>
          
          <div className="space-y-1.5">
              <Label htmlFor="publicAccessMode" className="text-sm font-medium">Modo de Acesso Público</Label>
              <Select 
                value={settings.publicAccessMode || 'open'} 
                onValueChange={(value) => handleChange('publicAccessMode', value as 'closed' | 'partial' | 'open')}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="font-medium">Fechado</div>
                        <div className="text-xs text-muted-foreground">Apenas home</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-yellow-500" />
                      <div>
                        <div className="font-medium">Parcial</div>
                        <div className="text-xs text-muted-foreground">Sem preços</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">Aberto</div>
                        <div className="text-xs text-muted-foreground">Tudo visível</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Usuários logados sempre veem tudo normalmente
              </p>
            </div>

            {/* Área de informações adicionais */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Modos de Acesso</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fechado</p>
                    <p className="text-xs text-gray-600">Visitantes veem apenas a home com slider de imagens</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <EyeOff className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Parcial</p>
                    <p className="text-xs text-gray-600">Produtos visíveis mas sem preços. Login necessário para ver valores</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aberto</p>
                    <p className="text-xs text-gray-600">Tudo visível incluindo preços. Recomendado para lojas públicas</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Mensagem de Feedback e Botão Salvar */}
      {message && (
        <div
          className={`p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="sm"
          className="px-6 bg-black hover:bg-gray-900 text-white h-10"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

