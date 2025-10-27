export interface Category {
  id: number
  name: string
  slug: string
  isActive: boolean
}

export interface Color {
  id: number
  name: string
  hexCode?: string
  isActive: boolean
}

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  products: Array<{
    categoryName?: string
    brandName?: string
    colorName?: string
    colorHex?: string
  }>
  onBrandFilter?: (brandId: number | null) => void
  onCategoryFilter?: (categoryId: number | null) => void
  onColorFilter?: (colorId: number | null) => void
  selectedBrandId?: number | null
  selectedCategoryId?: number | null
  selectedColorId?: number | null
}
