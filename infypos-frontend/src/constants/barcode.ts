import type { PaperLayout } from '@/types/barcode.types'

export const BARCODE_SYMBOLOGIES = [
  { value: 'CODE128', label: 'CODE 128 (Universal)' },
  { value: 'CODE39',  label: 'CODE 39' },
  { value: 'EAN13',   label: 'EAN-13 (13 digits)' },
  { value: 'EAN8',    label: 'EAN-8 (8 digits)' },
  { value: 'UPCA',    label: 'UPC-A (12 digits)' },
  { value: 'UPCE',    label: 'UPC-E (6 digits)' },
  { value: 'ITF14',   label: 'ITF-14' },
] as const

export const PAPER_SIZES = [
  { value: 'A4',         label: 'A4 (210 × 297 mm)' },
  { value: 'A5',         label: 'A5 (148 × 210 mm)' },
  { value: 'Letter',     label: 'Letter (8.5 × 11 in)' },
  { value: 'Thermal58',  label: 'Thermal 58mm' },
  { value: 'Thermal80',  label: 'Thermal 80mm' },
] as const

export const PAPER_LAYOUTS: Record<string, PaperLayout> = {
  A4:        { cols: 4, labelWidthMm: 48, labelHeightMm: 25, label: 'A4' },
  A5:        { cols: 3, labelWidthMm: 62, labelHeightMm: 30, label: 'A5' },
  Letter:    { cols: 4, labelWidthMm: 50, labelHeightMm: 25, label: 'Letter' },
  Thermal58: { cols: 1, labelWidthMm: 50, labelHeightMm: 28, label: 'Thermal 58mm' },
  Thermal80: { cols: 2, labelWidthMm: 72, labelHeightMm: 35, label: 'Thermal 80mm' },
}
