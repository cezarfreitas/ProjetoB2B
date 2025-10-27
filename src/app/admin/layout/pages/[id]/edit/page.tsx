'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { HtmlEditor } from '@/components/ui/html-editor'
import { 
  Save,
  X,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Page {
  id: number
  title: string
  slug: string
  content: string
  isVisible: boolean
  showInFooter: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [pageData, setPageData] = useState<Partial<Page>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Unwrap params using React.use()
  const resolvedParams = use(params)

  // Dados mockados para demonstração
  useEffect(() => {
    const mockPages: Page[] = [
      {
        id: 1,
        title: 'Sobre Nós',
        slug: 'sobre-nos',
        content: '<div><h1>Sobre Nós</h1><p>Conheça nossa história e missão...</p></div>',
        isVisible: true,
        showInFooter: true,
        order: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: 2,
        title: 'Política de Privacidade',
        slug: 'politica-privacidade',
        content: '<div><h1>Política de Privacidade</h1><p>Nossa política de privacidade e proteção de dados...</p></div>',
        isVisible: true,
        showInFooter: true,
        order: 2,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15'
      },
      {
        id: 3,
        title: 'Termos de Uso',
        slug: 'termos-uso',
        content: '<div><h1>Termos de Uso</h1><p>Termos e condições de uso da plataforma...</p></div>',
        isVisible: true,
        showInFooter: true,
        order: 3,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-10'
      },
      {
        id: 4,
        title: 'Contato',
        slug: 'contato',
        content: '<div><h1>Contato</h1><p>Entre em contato conosco...</p></div>',
        isVisible: true,
        showInFooter: true,
        order: 4,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-05'
      }
    ]

    const pageId = parseInt(resolvedParams.id)
    const page = mockPages.find(p => p.id === pageId)
    
    if (page) {
      setPageData(page)
    }
    
    setIsLoading(false)
  }, [resolvedParams.id])

  const handleSave = async () => {
    if (!pageData.title || !pageData.slug) {
      alert('Título e slug são obrigatórios')
      return
    }

    setIsSaving(true)
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Aqui você faria a chamada para a API
    console.log('Salvando página:', pageData)
    
    setIsSaving(false)
    router.push('/admin/layout/pages')
  }

  const handleCancel = () => {
    router.push('/admin/layout/pages')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!pageData.id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Página não encontrada</h1>
            <p className="text-muted-foreground">A página solicitada não existe</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Página</h1>
            <p className="text-muted-foreground">Modifique o conteúdo da página</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Campos básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={pageData.title || ''}
                  onChange={(e) => setPageData({...pageData, title: e.target.value})}
                  placeholder="Nome da página"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug (URL) *</label>
                <Input
                  value={pageData.slug || ''}
                  onChange={(e) => setPageData({...pageData, slug: e.target.value})}
                  placeholder="slug-da-pagina"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem</label>
                <Input
                  type="number"
                  value={pageData.order || 1}
                  onChange={(e) => setPageData({...pageData, order: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={pageData.isVisible ?? true}
                  onChange={(e) => setPageData({...pageData, isVisible: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="isVisible" className="text-sm font-medium">
                  Página Visível
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showInFooter"
                  checked={pageData.showInFooter ?? true}
                  onChange={(e) => setPageData({...pageData, showInFooter: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="showInFooter" className="text-sm font-medium">
                  Exibir no Footer
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor de HTML */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da Página</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <HtmlEditor
                value={pageData.content || ''}
                onChange={(content) => setPageData({...pageData, content})}
                height={500}
                placeholder="Digite o conteúdo da página aqui..."
              />
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Dica:</strong> Use a barra de ferramentas para formatar texto, adicionar links, imagens e listas. 
                  O editor Quill gera HTML automaticamente. Use a aba "Preview" para ver o resultado final.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
