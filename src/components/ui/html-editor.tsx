'use client'

import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Code, Eye, Bold, Italic, Underline, List, ListOrdered, Link, Image, Quote } from 'lucide-react'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
}

export function HtmlEditor({ value, onChange, height = 400, placeholder = "Digite o conteúdo aqui..." }: HtmlEditorProps) {
  const [activeTab, setActiveTab] = useState('editor')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Configuração do Quill
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), [])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'code-block'
  ]

  const handleChange = (content: string) => {
    onChange(content)
  }

  return (
    <div className="border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="mt-0">
          <div style={{ height: `${height}px` }}>
            {isMounted ? (
              <ReactQuill
                theme="snow"
                value={value}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ height: `${height - 42}px` }}
              />
            ) : (
              <div className="h-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                Carregando editor...
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div 
            className="p-6 bg-white border rounded-md"
            style={{ height: `${height}px`, overflow: 'auto' }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: value || '<p>Digite algo no editor para ver o preview...</p>' }}
              className="prose max-w-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
