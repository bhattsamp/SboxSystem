export const MODULES = {
  DASHBOARD:   'dashboard',
  PRODUCTS:    'products',
  CATEGORIES:  'categories',
  BRANDS:      'brands',
  UNITS:       'units',
  SALES:       'sales',
  PURCHASES:   'purchases',
  CUSTOMERS:   'customers',
  SUPPLIERS:   'suppliers',
  BARCODE:     'barcode',
  REPORTS:     'reports',
  EXPENSES:    'expenses',
  STOCK:       'stock',
  SETTINGS:    'settings',
  USERS:       'users',
  ADJUSTMENTS:      'adjustments',
  TRANSFERS:        'transfers',
  QUOTATIONS:       'quotations',
  PURCHASE_RETURNS: 'purchase-returns',
  SALE_RETURNS:     'sale-returns',
  HOLDS:            'holds',
  VARIATIONS:       'variations',
  BASE_UNITS:       'base-units',
  EXPENSE_CATEGORIES: 'expense-categories',
  PAYMENT_METHODS: 'payment-methods',
} as const

export const PAYMENT_METHODS = [
  { value: 'cash',   label: 'Cash' },
  { value: 'card',   label: 'Card / POS' },
  { value: 'bank',   label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mixed',  label: 'Mixed' },
] as const

export const PAYMENT_STATUSES = [
  { value: 'paid',    label: 'Paid',    color: 'badge-green' },
  { value: 'unpaid',  label: 'Unpaid',  color: 'badge-red' },
  { value: 'partial', label: 'Partial', color: 'badge-yellow' },
] as const

export const SALE_STATUSES = [
  { value: 'completed', label: 'Completed', color: 'badge-green' },
  { value: 'pending',   label: 'Pending',   color: 'badge-yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-red' },
  { value: 'returned',  label: 'Returned',  color: 'badge-orange' },
] as const

export const PURCHASE_STATUSES = [
  { value: 'ordered',  label: 'Ordered',  color: 'badge-blue' },
  { value: 'received', label: 'Received', color: 'badge-green' },
  { value: 'partial',  label: 'Partial',  color: 'badge-yellow' },
  { value: 'cancelled',label: 'Cancelled',color: 'badge-red' },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)',      symbol: '$' },
  { value: 'EUR', label: 'Euro (€)',           symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)',  symbol: '£' },
  { value: 'INR', label: 'Indian Rupee (₹)',   symbol: '₹' },
  { value: 'AED', label: 'UAE Dirham (AED)',   symbol: 'AED' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)',  symbol: 'SAR' },
] as const

export const DEFAULT_PAGINATION = { page: 1, limit: 15 }
