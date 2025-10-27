# Componentes de Produto

Esta pasta contém os componentes refatorados para a página de edição de produtos.

## Componentes

### BasicProductInfo
Componente responsável pelas informações básicas do produto:
- Identificação (nome, SKU, código agrupador)
- Configuração de estoque (formato de venda, tipo de controle)
- Classificação (categoria, marca, gênero, coleção, cor)
- Descrição do produto

### ProductPricing
Componente para informações financeiras e de estoque:
- Preços (custo, atacado, venda)
- Estoque mínimo
- Peso e dimensões

### VariantConfiguration
Componente para configuração de variantes:
- Seleção de características (tamanhos, cores, grades)
- Informações sobre o sistema de variantes
- Botão para criar variantes

### VariantDisplay
Componente para exibir as variantes criadas:
- Variantes por tamanho e cor
- Variantes por grade
- Campos de estoque para cada variante
- Resumo das variantes criadas

## Hook

### useProductData
Hook personalizado que gerencia:
- Carregamento de dados iniciais
- Estado do formulário
- Seleções de características
- Funções de manipulação de dados

## Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada componente tem uma responsabilidade específica
2. **Reutilização**: Componentes podem ser reutilizados em outras páginas
3. **Manutenibilidade**: Código mais fácil de manter e debugar
4. **Testabilidade**: Componentes menores são mais fáceis de testar
5. **Legibilidade**: Código mais limpo e organizado
6. **Performance**: Componentes menores podem ser otimizados individualmente

## Estrutura de Arquivos

```
src/components/product/
├── BasicProductInfo.tsx
├── ProductPricing.tsx
├── VariantConfiguration.tsx
├── VariantDisplay.tsx
└── README.md

src/hooks/
└── useProductData.ts
```
