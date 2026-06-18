import type { BarcodeSymbology } from './product.types'

export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Thermal58' | 'Thermal80'

export interface BarcodeConfig {
  warehouseId: string
  productId: string
  quantity: number
  paperSize: PaperSize
  symbology: BarcodeSymbology
  showProductName: boolean
  showPrice: boolean
  showSKU: boolean
  columns: number
  fontSize?: number
  barcodeHeight?: number
}

export interface BarcodeItem {
  productId: string
  name: string
  sku: string
  price: number
  barcode: string
  symbology: BarcodeSymbology
  quantity: number
}

export interface PaperLayout {
  cols: number
  labelWidthMm: number
  labelHeightMm: number
  label: string
}
