# 🔐 Sistema de Visibilidade da Loja

## Configuração Implementada

A funcionalidade de controle de visibilidade da loja está **100% funcional** e integrada com a tabela `store_settings`.

## 📋 Modos de Acesso

### 1. **CLOSED** (Fechado)
- ❌ **Produtos NÃO são exibidos** na home
- ✅ Apenas o slider de banners é visível
- 🎯 Ideal para loja em manutenção ou modo privado

### 2. **PARTIAL** (Parcial)
- ✅ **Produtos são exibidos** na home
- ❌ **Preços são ocultos**
- 🔒 Mostra mensagem "Faça login para ver os preços"
- 🎯 Ideal para despertar interesse sem revelar preços

### 3. **OPEN** (Aberto)
- ✅ **Produtos são exibidos** na home
- ✅ **Preços são visíveis**
- 🛒 Botão de adicionar ao carrinho disponível
- 🎯 Ideal para loja totalmente aberta ao público

## 🎨 Componentes Afetados

### Automaticamente Controlados:
- ✅ `ProductShelf` - Exibe/oculta produtos na home
- ✅ `ProductCard` - Exibe/oculta preços nos cards
- ✅ `Catalog` - Controla exibição no catálogo
- ✅ Todas as páginas de produtos

### Sempre Visível (mesmo em CLOSED):
- ✅ `HeroSlider` - Banners promocionais
- ✅ `Header` e `Footer`

## 🔄 Como Funciona

### Para Usuários NÃO Logados:
O sistema respeita a configuração de `publicAccessMode` da tabela `store_settings`.

### Para Usuários Logados:
Sempre veem **tudo** independente da configuração (modo OPEN forçado).

## ⚙️ Como Configurar

### 1. Via Painel Admin:
```
http://localhost:3000/admin/settings/store
```
1. Acesse a página de configurações
2. Localize "Modo de Acesso Público"
3. Selecione o modo desejado
4. Clique em "Salvar Configurações"

### 2. Via Banco de Dados:
```sql
UPDATE store_settings 
SET publicAccessMode = 'OPEN' -- ou 'PARTIAL' ou 'CLOSED'
WHERE id = 1;
```

## 🧪 Como Testar

1. **Configure o modo desejado** no painel admin
2. **Faça logout** da conta (se estiver logado)
3. **Acesse a home** `http://localhost:3000/`
4. **Verifique o comportamento**:
   - `CLOSED`: Sem produtos na home
   - `PARTIAL`: Produtos sem preços
   - `OPEN`: Produtos com preços

## 📡 API Endpoint

```typescript
GET /api/settings/store
Response: {
  storeName: string
  logoUrl: string
  description: string
  seoText: string
  contactPhone: string
  address: string
  publicAccessMode: 'CLOSED' | 'PARTIAL' | 'OPEN' // UPPERCASE
}
```

## 🔧 Hook Personalizado

```typescript
import { usePublicAccess } from '@/hooks/usePublicAccess'

function Component() {
  const { mode, showProducts, showPrices, isLoading } = usePublicAccess()
  
  // showProducts: true/false - se deve mostrar produtos
  // showPrices: true/false - se deve mostrar preços
  // mode: 'CLOSED' | 'PARTIAL' | 'OPEN'
  
  return (
    <>
      {showProducts && <ProductList />}
      {showPrices && <PriceTag />}
    </>
  )
}
```

### 🎯 Otimização de Performance

O sistema usa um **contexto global** (`PublicAccessContext`) para evitar múltiplas requisições à API. 

**Antes:** Cada componente fazia sua própria requisição → muitas chamadas
**Agora:** Uma única requisição no contexto → cache global

O contexto está configurado no `layout.tsx` principal:
```typescript
<AuthProvider>
  <PublicAccessProvider>  {/* ← Fornece acesso global */}
    <CartProvider>
      {children}
    </CartProvider>
  </PublicAccessProvider>
</AuthProvider>
```

### ⚡ Atualização Automática (Sem F5!)

Quando você altera o **Modo de Acesso Público** no painel admin:

1. ✅ **Salva no banco de dados**
2. ✅ **Atualiza o cache** do localStorage
3. ✅ **Dispara evento customizado** `publicAccessModeUpdated`
4. ✅ **Todos os componentes** escutam e atualizam automaticamente
5. ✅ **Zero necessidade de F5!** 

#### Como funciona:

```typescript
// No admin, ao salvar:
window.dispatchEvent(new CustomEvent('publicAccessModeUpdated', {
  detail: { mode: 'PARTIAL' }
}))

// No contexto, escutando:
window.addEventListener('publicAccessModeUpdated', () => {
  fetchAccessMode() // Recarrega as configurações
})
```

**Resultado:** Mude de OPEN → PARTIAL → CLOSED no admin e veja a home atualizar em tempo real! 🔥

## ✅ Status

- ✅ Banco de dados configurado
- ✅ Tabela `store_settings` com coluna `publicAccessMode`
- ✅ API funcionando corretamente
- ✅ Hook `usePublicAccess` implementado
- ✅ Componentes integrados
- ✅ Painel de configuração funcional
- ✅ Conversão automática entre UPPERCASE (banco) e lowercase (formulário)

## 🎯 Valor Atual

O sistema está configurado como **OPEN** (totalmente aberto).

---

## 🔧 Troubleshooting

### Erro: "Cannot find module '.prisma/client/default'"

Se você encontrar esse erro, significa que o Prisma Client precisa ser gerado:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="mysql://b2btropical:facbe3b2f9dfa94ddb49@server.idenegociosdigitais.com.br:3394/b2btropical"
npx prisma generate
```

**Depois limpe o cache do Next.js:**
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

**Desenvolvido para B2B Tropical** 🌴

