import { REGEX } from '@/constants/regex'

export const isValidEmail  = (v: string) => REGEX.EMAIL.test(v)
export const isValidPhone  = (v: string) => REGEX.PHONE.test(v)
export const isValidSKU    = (v: string) => REGEX.SKU.test(v)
export const isValidEAN13  = (v: string) => REGEX.BARCODE_EAN13.test(v)
export const isPositive    = (v: number) => v > 0
export const isNonNegative = (v: number) => v >= 0

export const required = (v: any) => (v !== undefined && v !== null && v !== '') || 'This field is required'
export const minLength = (n: number) => (v: string) => v.length >= n || `Minimum ${n} characters`
export const maxLength = (n: number) => (v: string) => v.length <= n || `Maximum ${n} characters`
export const min = (n: number) => (v: number) => v >= n || `Must be at least ${n}`
export const max = (n: number) => (v: number) => v <= n || `Must be at most ${n}`
