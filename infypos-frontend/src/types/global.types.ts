import type { User } from './auth.types'

export interface Warehouse {
  _id: string
  name: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxNumber?: string
  company?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Expense {
  _id: string
  title: string
  category: string
  amount: number
  date: string
  note?: string
  createdBy: User | string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  link?: string
  createdAt: string
}

export interface AppSettings {
  _id: string
  companyName: string
  companyLogo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  timezone: string
  taxEnabled: boolean
  defaultTaxRate: number
  invoicePrefix: string
  invoiceFooter?: string
  invoiceTerms?: string
  lowStockAlert: number
  allowNegativeStock: boolean
  updatedAt: string
}

export interface DashboardStats {
  totalSales: number
  totalPurchases: number
  totalProducts: number
  totalOrders: number
  todaySales: number
  monthSales: number
  lowStockCount: number
  salesGrowth: number
  purchaseGrowth: number
  recentSales: any[]
  topProducts: any[]
  salesChart: { month: string; sales: number; purchases: number }[]
  categoryChart: { name: string; value: number }[]
}
