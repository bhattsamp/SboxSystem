export const INVOICE_TEMPLATES = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern',  label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'thermal', label: 'Thermal Receipt' },
] as const

export const DEFAULT_INVOICE_FOOTER = 'Thank you for your business! Returns accepted within 7 days with receipt.'
export const DEFAULT_INVOICE_TERMS  = 'Payment is due within 30 days of invoice date.'
