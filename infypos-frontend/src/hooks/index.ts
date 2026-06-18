import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppSelector } from '@/store'

// ── useAuth ───────────────────────────────────────────────────
export function useAuth() {
  return useAppSelector((s) => s.auth)
}

// ── useDebounce ───────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── usePagination ─────────────────────────────────────────────
export function usePagination(initialLimit = 15) {
  const [page, setPage]   = useState(1)
  const [limit]           = useState(initialLimit)
  const [total, setTotal] = useState(0)
  const totalPages        = Math.max(1, Math.ceil(total / limit))
  const reset             = useCallback(() => setPage(1), [])
  return { page, limit, total, totalPages, setPage, setTotal, reset }
}

// ── useModal ──────────────────────────────────────────────────
export function useModal(initial = false) {
  const [open, setOpen] = useState(initial)
  const show   = useCallback(() => setOpen(true),  [])
  const hide   = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])
  return { open, show, hide, toggle }
}

// ── useLocalStorage ───────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch { return initialValue }
  })
  const set = useCallback((v: T) => {
    setValue(v)
    localStorage.setItem(key, JSON.stringify(v))
  }, [key])
  return [value, set] as const
}

// ── useTheme ──────────────────────────────────────────────────
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('sbox_theme', 'light')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  const toggle = useCallback(() => setTheme(theme === 'light' ? 'dark' : 'light'), [theme, setTheme])
  return { theme, toggle, isDark: theme === 'dark' }
}

// ── usePrint ──────────────────────────────────────────────────
export function usePrint() {
  const print = useCallback(() => window.print(), [])
  return { print }
}

// ── useConfirm ────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean; title: string; message: string; onConfirm: () => void | Promise<void>
  }>({ open: false, title: '', message: '', onConfirm: () => {} })

  const confirm = useCallback((title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setState({ open: true, title, message, onConfirm })
  }, [])
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  return { ...state, confirm, close }
}

// ── useClickOutside ───────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(cb: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cb])
  return ref
}

// ── usePermissions ────────────────────────────────────────────
export function usePermissions() {
  const { user } = useAuth()
  const can = useCallback((permission: string): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.permissions?.includes(permission) ?? false
  }, [user])
  const isAdmin   = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isCashier = user?.role === 'cashier'
  return { can, isAdmin, isManager, isCashier, role: user?.role }
}

// ── useBarcode ────────────────────────────────────────────────
export function useBarcode(ref: React.RefObject<SVGSVGElement>, value: string, format = 'CODE128') {
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!ref.current || !value) return
    import('@/utils/barcode').then(({ renderBarcode }) => {
      const ok = renderBarcode(ref.current!, value, { format })
      setError(!ok)
    })
  }, [ref, value, format])
  return { error }
}

// ── useSocket ─────────────────────────────────────────────────
export function useSocket() {
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (!isAuthenticated) return
    import('@/lib/socket').then(({ connectSocket, disconnectSocket }) => {
      connectSocket()
      return () => disconnectSocket()
    })
  }, [isAuthenticated])
}
