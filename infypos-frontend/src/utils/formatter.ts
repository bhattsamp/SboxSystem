import clsx from 'clsx'

export const truncate = (str: string, n = 30): string =>
  str?.length > n ? str.slice(0, n) + '…' : (str ?? '—')

export const capitalize = (str: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

export const titleCase = (str: string): string =>
  str ? str.split(' ').map(capitalize).join(' ') : ''

export const slugify = (str: string): string =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

export const statusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    paid: 'badge-green', completed: 'badge-green', received: 'badge-green',
    active: 'badge-green', ordered: 'badge-blue', info: 'badge-blue',
    unpaid: 'badge-red', cancelled: 'badge-red', inactive: 'badge-red',
    'out-of-stock': 'badge-red', danger: 'badge-red',
    partial: 'badge-yellow', pending: 'badge-yellow', low: 'badge-yellow',
    warning: 'badge-yellow', returned: 'badge-orange',
    draft: 'badge-gray', admin: 'badge-purple', manager: 'badge-blue', cashier: 'badge-gray',
    sent: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red',
    expired: 'badge-orange', converted: 'badge-purple',
  }
  return map[status?.toLowerCase()] ?? 'badge-gray'
}

export const cn = (...inputs: Parameters<typeof clsx>) => clsx(...inputs)
