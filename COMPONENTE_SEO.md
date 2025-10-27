# 📄 Componente SEO - Guia de Uso

## 🎯 Objetivo

O componente `SEO` facilita a configuração de títulos, meta tags e Open Graph em todas as páginas do sistema, automaticamente incluindo o nome da loja configurado no banco de dados.

## 🚀 Como Usar

### Importação

```typescript
import SEO from '@/components/SEO'
```

### Uso Básico

```tsx
<SEO title="Título da Página" />
```

Resultado: `"Título da Página - Nome da Loja"` na aba do navegador

### Somente Nome da Loja

```tsx
<SEO />
```

Resultado: `"Nome da Loja"` na aba do navegador

## 📋 Props Disponíveis

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | `undefined` | Título da página (será concatenado com nome da loja) |
| `description` | `string` | Descrição da loja | Descrição da página para SEO |
| `image` | `string` | `undefined` | URL da imagem para Open Graph/Twitter |
| `url` | `string` | URL atual | URL canônica da página |
| `type` | `'website' \| 'product' \| 'article'` | `'website'` | Tipo de conteúdo para Open Graph |
| `noIndex` | `boolean` | `false` | Se true, adiciona `noindex, nofollow` |

## 📝 Exemplos de Uso

### 1. Página de Produto

```tsx
'use client'

import SEO from '@/components/SEO'

export default function ProductPage({ product }) {
  return (
    <div>
      <SEO
        title={product.name}
        description={product.description}
        image={product.images[0]}
        type="product"
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

**Resultado:**
- Título: `"Chinelo Havaianas - Hub Multimarcas"`
- Description: Descrição do produto
- Open Graph: Imagem e dados do produto

### 2. Página de Categoria

```tsx
'use client'

import SEO from '@/components/SEO'

export default function CategoryPage({ category }) {
  return (
    <div>
      <SEO
        title={category.name}
        description={`Confira todos os produtos da categoria ${category.name}`}
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

**Resultado:**
- Título: `"Chinelos - Hub Multimarcas"`

### 3. Catálogo Geral

```tsx
'use client'

import SEO from '@/components/SEO'

export default function CatalogPage() {
  return (
    <div>
      <SEO
        title="Catálogo de Produtos"
        description="Explore nosso catálogo completo com as melhores marcas"
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

### 4. Home Page

```tsx
'use client'

import SEO from '@/components/SEO'

export default function HomePage() {
  return (
    <div>
      <SEO
        description="Sua plataforma B2B de produtos atacadistas"
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

**Resultado:**
- Título: `"Hub Multimarcas"` (sem título adicional)

### 5. Página de Admin (Sem Indexação)

```tsx
'use client'

import SEO from '@/components/SEO'

export default function AdminPage() {
  return (
    <div>
      <SEO
        title="Painel Administrativo"
        noIndex={true}
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

**Resultado:**
- Título: `"Painel Administrativo - Hub Multimarcas"`
- Meta robots: `noindex, nofollow` (não aparece no Google)

### 6. Blog/Artigo

```tsx
'use client'

import SEO from '@/components/SEO'

export default function BlogPost({ post }) {
  return (
    <div>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

## 🔍 Meta Tags Geradas

O componente automaticamente gera:

### Meta Tags Básicas
- `<title>` - Título da página
- `<meta name="description">` - Descrição
- `<meta name="robots">` - Indexação (index/noindex)

### Open Graph (Facebook, WhatsApp, etc)
- `og:title` - Título
- `og:description` - Descrição
- `og:type` - Tipo de conteúdo
- `og:url` - URL da página
- `og:image` - Imagem de preview

### Twitter Cards
- `twitter:card` - Tipo de card
- `twitter:title` - Título
- `twitter:description` - Descrição
- `twitter:image` - Imagem

## ⚡ Recursos

✅ **Cache Inteligente**: Busca o nome da loja uma vez e cacheia
✅ **Atualização Automática**: Responde ao evento `storeSettingsUpdated`
✅ **Fallback Seguro**: Usa "B2B Tropical" se API falhar
✅ **Zero UI**: Componente invisível, apenas gerencia meta tags
✅ **TypeScript**: Totalmente tipado

## 🎨 Boas Práticas

1. **Sempre adicione o SEO no topo do componente da página**:
```tsx
return (
  <div>
    <SEO title="..." />
    <Header />
    {/* resto */}
  </div>
)
```

2. **Use títulos descritivos**:
   - ✅ `"Chinelo Havaianas Slim"`
   - ❌ `"Produto"`

3. **Adicione descrições únicas**:
   - ✅ Descrição específica do produto/página
   - ❌ Mesma descrição em todas as páginas

4. **Sempre use `noIndex` em páginas administrativas**:
```tsx
<SEO title="Admin" noIndex={true} />
```

5. **Adicione imagens em páginas de produto**:
```tsx
<SEO title="..." image={product.image} type="product" />
```

## 🔄 Migração

### Antes (DynamicTitle)
```tsx
import DynamicTitle from '@/components/DynamicTitle'

<DynamicTitle />
```

### Depois (SEO)
```tsx
import SEO from '@/components/SEO'

<SEO title="Nome da Página" />
```

## 📊 Resultado no Google

Com o componente SEO configurado corretamente:

```
Hub Multimarcas › Chinelo Havaianas Slim
Chinelo Havaianas Slim na cor azul, tamanhos 35-42.
Preço especial atacado. Marca: Havaianas...
```

---

**✨ Agora todas as páginas têm SEO profissional automaticamente!**


