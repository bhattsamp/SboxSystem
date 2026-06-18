import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'

const parse = (d: string | Date): Date =>
  typeof d === 'string' ? parseISO(d) : d

export const formatDate = (d: string | Date): string => {
  const date = parse(d)
  return isValid(date) ? format(date, 'MMM dd, yyyy') : '—'
}

export const formatDateTime = (d: string | Date): string => {
  const date = parse(d)
  return isValid(date) ? format(date, 'MMM dd, yyyy hh:mm a') : '—'
}

export const formatDateInput = (d: string | Date): string => {
  const date = parse(d)
  return isValid(date) ? format(date, 'yyyy-MM-dd') : ''
}

export const formatRelative = (d: string | Date): string => {
  const date = parse(d)
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—'
}

export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd')
export const monthStartISO = (): string => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
