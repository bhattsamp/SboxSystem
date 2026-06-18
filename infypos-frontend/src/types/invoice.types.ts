import type { Sale } from './sales.types'
import type { AppSettings } from './global.types'

export interface InvoiceData {
  sale: Sale
  settings: AppSettings
}

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal' | 'thermal'
