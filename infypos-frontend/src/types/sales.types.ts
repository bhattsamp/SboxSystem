import type { Product } from './product.types'
import type { User } from './auth.types'

export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type SaleStatus = 'completed' | 'pending' | 'cancelled' | 'returned'
export type PaymentMethod = 'cash' | 'card' | 'bank' | 'cheque' | 'mixed'

export interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxNumber?: string
  totalPurchased: number
  outstanding: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  _id?: string
  product: Product | string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  discountType: 'fixed' | 'percent'
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
}

export interface Payment {
  _id: string
  amount: number
  method: PaymentMethod
  reference?: string
  date: string
  note?: string
}

export interface Sale {
  _id: string
  invoiceNo: string
  customer?: Customer | string
  warehouse: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  shippingCost: number
  grandTotal: number
  paidAmount: number
  dueAmount: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  payments: Payment[]
  status: SaleStatus
  note?: string
  terms?: string
  createdBy: User | string
  createdAt: string
  updatedAt: string
}

// POS-specific cart types
export interface CartItem {
  productId: string
  name: string
  sku: string
  salePrice: number
  quantity: number
  discount: number
  taxRate: number
  image?: string
}

export interface CartState {
  items: CartItem[]
  customer: Customer | null
  discount: number
  discountType: 'fixed' | 'percent'
  paymentMethod: PaymentMethod
  note: string
  warehouse: string
}
