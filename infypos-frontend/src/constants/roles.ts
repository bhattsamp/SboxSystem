export const ROLES = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const

export const ROLE_LABELS: Record<string, string> = {
  admin:   'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
}

export const ROLE_COLORS: Record<string, string> = {
  admin:   'badge-purple',
  manager: 'badge-blue',
  cashier: 'badge-gray',
}
