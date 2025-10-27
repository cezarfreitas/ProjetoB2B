'use client'

import { Seller } from '@/types/seller'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { DialogFooter } from '@/components/ui/dialog'
import { User, DollarSign, Tag } from 'lucide-react'

export interface Brand {
  id: number
  name: string
  isActive: boolean
}

export interface SellerFormProps {
  formData: Partial<Seller>
  setFormData: (data: Partial<Seller>) => void
  onSubmit: () => void
  isLoading?: boolean
  brands: Brand[]
  loadingBrands: boolean
}

export default function SellerForm({
  formData,
  setFormData,
  onSubmit,
  isLoading = false,
  brands,
  loadingBrands
}: SellerFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleBrandToggle = (brandId: number) => {
    const currentBrands = formData.brandIds || []
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId]
    setFormData({ ...formData, brandIds: newBrands })
  }

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return numbers
  }

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-2 gap-5">
        {/* Coluna Esquerda */}
        <div className="space-y-3">
          {/* Informações Pessoais */}
        <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
              <User className="h-4 w-4" />
              Informações Pessoais
            </h3>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="João Silva"
            required
                  className="h-9"
          />
        </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">
                  E-mail <span className="text-destructive">*</span>
                </Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao.silva@empresa.com"
            required
                  className="h-9"
          />
      </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">
                  Senha {!formData.id && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={formData.id ? "Deixe em branco para não alterar" : "Digite a senha"}
                  required={!formData.id}
                  className="h-9"
                />
                {formData.id && (
                  <p className="text-[10px] text-muted-foreground">
                    Deixe em branco para manter a senha atual
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Comissões e Atuação */}
        <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
              <DollarSign className="h-4 w-4" />
              Comissões e Atuação
            </h3>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="region" className="text-xs">Região de Atuação</Label>
          <Input
            id="region"
            value={formData.region || ''}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="São Paulo"
                  className="h-9"
          />
        </div>

              <div className="space-y-1">
                <Label htmlFor="commissionRate" className="text-xs">Comissão (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commissionRate || 0}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                  placeholder="5.00"
                  className="h-9"
                />
              </div>
            </div>
      </div>

          <Separator className="my-2" />

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border p-2.5 bg-muted/20">
            <div className="space-y-0">
              <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
                Vendedor ativo
              </Label>
              <p className="text-[10px] text-muted-foreground">
                {formData.isActive ? 'Ativo no sistema' : 'Inativo no sistema'}
              </p>
            </div>
        <Switch
          id="isActive"
          checked={formData.isActive ?? true}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
          </div>
        </div>

        {/* Coluna Direita - Marcas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
              <Tag className="h-4 w-4" />
              Marcas Relacionadas
            </h3>
            {formData.brandIds && formData.brandIds.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                {formData.brandIds.length} selecionada(s)
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Selecione as marcas que este vendedor pode comercializar
          </p>
          
          <div className="rounded-lg border bg-muted/30 min-h-[300px] max-h-[400px] overflow-y-auto">
            {loadingBrands ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                  <span className="text-xs text-muted-foreground">Carregando marcas...</span>
                </div>
              </div>
            ) : brands.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center text-muted-foreground p-4">
                  <Tag className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm font-medium">Nenhuma marca ativa</p>
                  <p className="text-[10px] mt-1">Cadastre marcas em Características → Marcas</p>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className={`flex items-center space-x-2 p-2 rounded-md border transition-all cursor-pointer ${
                      formData.brandIds?.includes(brand.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                    onClick={() => handleBrandToggle(brand.id)}
                  >
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={formData.brandIds?.includes(brand.id) || false}
                      onCheckedChange={() => handleBrandToggle(brand.id)}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="flex-1 cursor-pointer text-xs font-medium"
                    >
                      {brand.name}
        </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-4 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full sm:w-auto h-9"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-2"></div>
              Salvando...
            </>
          ) : (
            'Salvar Vendedor'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

