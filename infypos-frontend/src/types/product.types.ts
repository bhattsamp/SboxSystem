export type BarcodeSymbology = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA' | 'UPCE' | 'ITF14'

export interface Category {
  _id: string
  name: string
  slug?: string
  description?: string
  image?: string
  parentCategory?: Category | string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryTree extends Category {
  subcategories: Category[]
}

export interface Brand {
  _id: string
  name: string
  logo?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Unit {
  _id: string
  name: string
  shortName: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TaxRate {
  _id: string
  name: string
  rate: number
  isActive: boolean
  createdAt: string
}

export interface Product {
  _id: string
  name: string
  slug?: string
  sku: string
  barcode?: string
  barcodeSymbology: BarcodeSymbology
  description?: string
  category: Category | string
  brand?: Brand | string
  unit: Unit | string
  tax?: TaxRate | string
  purchasePrice: number
  salePrice: number
  mrp?: number
  taxRate?: number
  image?: string
  gallery?: string[]
  alertQuantity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StockItem {
  _id: string
  product: Product | string
  warehouse: string
  quantity: number
  updatedAt: string
}
