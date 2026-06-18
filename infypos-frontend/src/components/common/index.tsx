import React, { forwardRef } from 'react'
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineX, HiOutlineExclamationCircle } from 'react-icons/hi'
import { statusBadgeClass, cn } from '@/utils/formatter'

// ──────────────────────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const variantMap: Record<string, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
  warning:   'btn-warning',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  white:     'btn-white',
}
const sizeMap: Record<string, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg', icon: 'btn-icon' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(variantMap[variant], sizeMap[size], className)}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ──────────────────────────────────────────────────────────────
// Input
// ──────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {leftIcon  && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{leftIcon}</span>}
        <input
          ref={ref}
          className={cn('input', leftIcon && 'pl-10', rightIcon && 'pr-10', error && 'input-error', className)}
          {...props}
        />
        {rightIcon && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</span>}
      </div>
      {error && <p className="error-msg"><HiOutlineExclamationCircle className="w-3.5 h-3.5" />{error}</p>}
      {hint  && !error && <p className="hint-msg">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ──────────────────────────────────────────────────────────────
// Select
// ──────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; hint?: string
  options: { label: string; value: string | number }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, ...props }, ref) => (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select ref={ref} className={cn('input', error && 'input-error', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="error-msg"><HiOutlineExclamationCircle className="w-3.5 h-3.5" />{error}</p>}
      {hint  && !error && <p className="hint-msg">{hint}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ──────────────────────────────────────────────────────────────
// Textarea
// ──────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea ref={ref} rows={3} className={cn('input resize-none', error && 'input-error', className)} {...props} />
      {error && <p className="error-msg"><HiOutlineExclamationCircle className="w-3.5 h-3.5" />{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ──────────────────────────────────────────────────────────────
// Badge
// ──────────────────────────────────────────────────────────────
export function Badge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <span className={cn(statusBadgeClass(status), className)}>
      {label ?? status}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────
// Modal
// ──────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean; onClose: () => void; title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}
const sizeCls = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-7xl' }

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-xl shadow-modal w-full animate-scaleIn overflow-hidden', sizeCls[size])}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600 -mr-1">
            <HiOutlineX className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[72vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// ConfirmDialog
// ──────────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; message: string; loading?: boolean
  confirmLabel?: string; variant?: 'danger' | 'warning'
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel = 'Delete', variant = 'danger' }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>}>
      <div className="flex gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', variant === 'danger' ? 'bg-red-100' : 'bg-amber-100')}>
          <HiOutlineExclamationCircle className={cn('w-5 h-5', variant === 'danger' ? 'text-red-500' : 'text-amber-500')} />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────────────────────────
// Table
// ──────────────────────────────────────────────────────────────
export interface TableColumn<T = any> {
  key?: keyof T; label: string
  render?: (row: T, index?: number) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]; data: T[]
  loading?: boolean; emptyMsg?: string
  onRowClick?: (row: T) => void
  keyExtractor?: (row: T, i: number) => string
}

export function Table<T extends Record<string, any>>({ columns, data, loading, emptyMsg = 'No records found.', onRowClick, keyExtractor }: TableProps<T>) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.className}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j}><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{emptyMsg}</p>
                    </div>
                  </td>
                </tr>
              )
            : data.map((row, i) => (
                <tr
                  key={keyExtractor ? keyExtractor(row, i) : row._id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col, j) => (
                    <td key={j} className={col.className}>
                      {col.render
                        ? col.render(row, i)
                        : col.key
                        ? (row[col.key] as React.ReactNode) ?? '—'
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number; totalPages: number; total: number; limit: number
  onChange: (p: number) => void
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  const start = Math.min((page - 1) * limit + 1, total)
  const end   = Math.min(page * limit, total)

  const pages = () => {
    const range: number[] = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i)
    return range
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        Showing <span className="font-bold text-slate-600">{start}–{end}</span> of{' '}
        <span className="font-bold text-slate-600">{total}</span> records
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(1)} disabled={page <= 1}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-2">«</button>
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed">
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>
        {pages().map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={cn('w-8 h-8 rounded-lg text-xs font-bold transition-colors',
              p === page ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100')}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed">
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onChange(totalPages)} disabled={page >= totalPages}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-2">»</button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string; value: string | number
  icon: React.ElementType
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal'
  change?: number; prefix?: string; suffix?: string
}

const iconBg: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red:    'bg-red-50 text-red-600',
  teal:   'bg-teal-50 text-teal-600',
}

export function StatCard({ title, value, icon: Icon, color = 'blue', change, prefix = '', suffix = '' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{title}</p>
        <p className="text-xl font-black text-slate-800 mt-1 truncate">{prefix}{value}{suffix}</p>
        {change !== undefined && (
          <p className={cn('text-xs font-semibold mt-1 flex items-center gap-1', change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs last month
          </p>
        )}
      </div>
      <div className={cn('stat-icon', iconBg[color])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// EmptyState
// ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ElementType; title: string; description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-300" />
      </div>
      <h3 className="text-sm font-bold text-slate-600 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 mb-5 max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Spinner + PageLoader
// ──────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' }[size]
  return <div className={cn(s, 'border-primary-600 border-t-transparent rounded-full animate-spin', className)} />
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3">
      <Spinner size="lg" />
      <p className="text-xs text-slate-400 font-medium">Loading...</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// SearchBox
// ──────────────────────────────────────────────────────────────
export function SearchBox({ value, onChange, placeholder = 'Search...', className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className="input pl-10 w-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────────────────────
export function Card({ children, className, title, action }: {
  children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode
}) {
  return (
    <div className={cn('card', className)}>
      {(title || action) && (
        <div className="section-header">
          {title && <h3 className="section-title">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
