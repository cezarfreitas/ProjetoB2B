'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Eye, Edit, Trash2, Infinity, Calendar, BarChart3, ExternalLink, GripVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface SortableRowProps {
  slide: Slide
  index: number
  onDelete: (id: string) => void
  calculateCTR: (clicks: number, impressions: number) => string
}

function SortableRow({ slide, index, onDelete, calculateCTR }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell className="font-semibold">{slide.name}</TableCell>
      <TableCell>
        {slide.imageDesktop ? (
          <div className="relative w-24 h-14 rounded overflow-hidden border">
            <Image
              src={slide.imageDesktop}
              alt={slide.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-14 bg-gray-100 rounded flex items-center justify-center border">
            <span className="text-xs text-gray-400">Sem imagem</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
        {slide.link}
      </TableCell>
      <TableCell className="text-sm">
        {slide.isUnlimited ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Infinity className="w-3 h-3 mr-1" />
            Ilimitado
          </Badge>
        ) : (
          <div className="text-xs text-muted-foreground">
            {slide.startDate && new Date(slide.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            {' - '}
            {slide.endDate && new Date(slide.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </div>
        )}
      </TableCell>
      <TableCell className="text-center">{slide.impressions.toLocaleString()}</TableCell>
      <TableCell className="text-center">{slide.clicks.toLocaleString()}</TableCell>
      <TableCell className="text-center font-medium">
        {calculateCTR(slide.clicks, slide.impressions)}
      </TableCell>
      <TableCell className="text-center">
        {slide.isActive ? (
          <Badge className="bg-green-500">Ativo</Badge>
        ) : (
          <Badge variant="secondary">Inativo</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Link href={`/admin/layout/slider/${slide.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            onClick={() => onDelete(slide.id)}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function SliderManagementPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides?admin=true')
      if (response.ok) {
        const data = await response.json()
        setSlides(data.slides || [])
      }
    } catch (error) {
      console.error('Erro ao buscar slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((item) => item.id === active.id)
      const newIndex = slides.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(slides, oldIndex, newIndex)
      
      // Atualizar ordem local
      const updatedSlides = newItems.map((item, idx) => ({
        ...item,
        order: idx + 1
      }))
      
      setSlides(updatedSlides)

      // Salvar ordem no banco
      try {
        await fetch('/api/hero-slides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: updatedSlides.map(s => ({ id: s.id, order: s.order }))
          })
        })
      } catch (error) {
        console.error('Erro ao salvar ordem:', error)
        alert('Erro ao salvar ordem. Recarregue a página.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este slide?')) {
      try {
        const response = await fetch(`/api/hero-slides/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setSlides(slides.filter(slide => slide.id !== id))
        } else {
          alert('Erro ao deletar slide')
        }
      } catch (error) {
        console.error('Erro ao deletar slide:', error)
        alert('Erro ao deletar slide')
      }
    }
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0%'
    return ((clicks / impressions) * 100).toFixed(2) + '%'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slider da Home</h1>
          <p className="text-gray-600">Gerencie os banners do carrossel da página inicial</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar Preview' : 'Visualizar'}
          </Button>
          <Link href="/admin/layout/slider/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Slide
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card className="p-0 overflow-hidden">
          <div className="relative h-96 bg-gray-100">
            {slides.length > 0 ? (
              <>
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentPreviewSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {slide.imageDesktop ? (
                      <Image
                        src={slide.imageDesktop}
                        alt={slide.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        Sem imagem de fundo
                      </div>
                    )}
                  </div>
                ))}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPreviewSlide(index)}
                      className={`rounded-full transition-all ${
                        index === currentPreviewSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Nenhum slide configurado
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Impressões</p>
              <p className="text-2xl font-bold">
                {slides.reduce((acc, slide) => acc + slide.impressions, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ExternalLink className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Cliques</p>
              <p className="text-2xl font-bold">
                {slides.reduce((acc, slide) => acc + slide.clicks, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CTR Médio</p>
              <p className="text-2xl font-bold">
                {calculateCTR(
                  slides.reduce((acc, slide) => acc + slide.clicks, 0),
                  slides.reduce((acc, slide) => acc + slide.impressions, 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Slides com Drag & Drop */}
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-32">Preview</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="w-40">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </div>
                </TableHead>
                <TableHead className="w-28 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Impressões
                  </div>
                </TableHead>
                <TableHead className="w-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Cliques
                  </div>
                </TableHead>
                <TableHead className="w-20 text-center">CTR</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    Nenhum slide cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {slides.map((slide, index) => (
                    <SortableRow
                      key={slide.id}
                      slide={slide}
                      index={index}
                      onDelete={handleDelete}
                      calculateCTR={calculateCTR}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
