import type { CartItem } from '@/types/sales.types'

export const calcItemTotal = (item: CartItem): number => {
  const base = item.salePrice * item.quantity
  const discountAmt = item.discount || 0
  const afterDiscount = base - discountAmt
  const taxAmt = (afterDiscount * (item.taxRate || 0)) / 100
  return parseFloat((afterDiscount + taxAmt).toFixed(2))
}

export const calcCartSubtotal = (items: CartItem[]): number =>
  parseFloat(items.reduce((s, i) => s + i.salePrice * i.quantity, 0).toFixed(2))

export const calcCartDiscount = (subtotal: number, discount: number, type: 'fixed' | 'percent'): number =>
  type === 'percent'
    ? parseFloat(((subtotal * discount) / 100).toFixed(2))
    : parseFloat(discount.toFixed(2))

export const calcCartTax = (items: CartItem[]): number =>
  parseFloat(items.reduce((s, i) => {
    const lineTotal = i.salePrice * i.quantity
    return s + (lineTotal * (i.taxRate || 0)) / 100
  }, 0).toFixed(2))

export const calcGrandTotal = (subtotal: number, discount: number, tax: number, shipping = 0): number =>
  parseFloat((subtotal - discount + tax + shipping).toFixed(2))

export const generateSKU = (name: string): string => {
  const prefix = name.trim().slice(0, 3).toUpperCase().replace(/\s/g, 'X')
  const suffix = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${suffix}`
}

export const generateInvoiceNo = (prefix = 'INV'): string => {
  const ts = Date.now().toString().slice(-7)
  return `${prefix}-${ts}`
}
