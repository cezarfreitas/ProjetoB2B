'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  X,
  Check,
  ArrowUpDown,
  Code,
  Image
} from 'lucide-react'

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

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Dados mockados para demonstração
  useEffect(() => {
    const mockPages: Page[] = [
      {
        id: 1,
        title: 'Sobre Nós',
        slug: 'sobre-nos',
        content: 'Conheça nossa história e missão...',
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
        content: 'Nossa política de privacidade e proteção de dados...',
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
        content: 'Termos e condições de uso da plataforma...',
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
        content: 'Entre em contato conosco...',
        isVisible: true,
        showInFooter: true,
        order: 4,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-05'
      }
    ]
    
    setTimeout(() => {
      setPages(mockPages)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleEdit = (page: Page) => {
    router.push(`/admin/layout/pages/${page.id}/edit`)
  }

  const handleCreate = () => {
    router.push('/admin/layout/pages/new')
  }


  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
      setPages(pages.filter(p => p.id !== id))
    }
  }

  const toggleVisibility = (id: number) => {
    setPages(pages.map(p => 
      p.id === id ? { ...p, isVisible: !p.isVisible } : p
    ))
  }

  const toggleFooter = (id: number) => {
    setPages(pages.map(p => 
      p.id === id ? { ...p, showInFooter: !p.showInFooter } : p
    ))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Páginas</h1>
            <p className="text-muted-foreground">Gerencie as páginas institucionais</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Páginas</h1>
          <p className="text-muted-foreground">Gerencie as páginas institucionais do site</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Página
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Páginas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground">
              {pages.filter(p => p.isVisible).length} visíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Footer</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages.filter(p => p.showInFooter).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Páginas no menu do footer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Públicas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages.filter(p => p.isVisible).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Páginas visíveis aos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages.length > 0 ? formatDate(pages.reduce((prev, current) => 
                new Date(prev.updatedAt) > new Date(current.updatedAt) ? prev : current
              ).updatedAt) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data da última modificação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Footer</TableHead>
              <TableHead className="w-[120px]">Atualizado</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.order}</TableCell>
                <TableCell>
                  <div className="font-medium">{page.title}</div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={page.isVisible ? 'default' : 'secondary'}>
                    {page.isVisible ? 'Visível' : 'Oculta'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {page.showInFooter ? (
                    <Badge variant="outline">Sim</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Não</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(page.updatedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleVisibility(page.id)}
                    >
                      {page.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleFooter(page.id)}
                      className={page.showInFooter ? 'bg-primary/10 text-primary' : ''}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredPages.length === 0 && !isCreating && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma página encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira página institucional'}
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Página
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
