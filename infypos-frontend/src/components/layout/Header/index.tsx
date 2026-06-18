import React, { useState, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch, HiOutlineSun, HiOutlineMoon, HiOutlineChevronRight } from 'react-icons/hi'
import { useAuth, useTheme, useClickOutside } from '@/hooks'
import { cn } from '@/utils/formatter'

const routeMeta: Record<string, { title: string; breadcrumb?: string[] }> = {
  '/dashboard':              { title: 'Dashboard' },
  '/pos':                    { title: 'POS Screen', breadcrumb: ['Sales'] },
  '/products':               { title: 'Products', breadcrumb: ['Inventory'] },
  '/products/create':        { title: 'Add Product', breadcrumb: ['Inventory', 'Products'] },
  '/products/categories':    { title: 'Categories', breadcrumb: ['Inventory', 'Products'] },
  '/products/brands':        { title: 'Brands', breadcrumb: ['Inventory', 'Products'] },
  '/products/units':         { title: 'Units', breadcrumb: ['Inventory', 'Products'] },
  '/purchases':              { title: 'Purchases', breadcrumb: ['Inventory'] },
  '/purchases/create':       { title: 'New Purchase', breadcrumb: ['Inventory', 'Purchases'] },
  '/purchases/suppliers':    { title: 'Suppliers', breadcrumb: ['Inventory', 'Purchases'] },
  '/sales':                  { title: 'Sales', breadcrumb: ['Transactions'] },
  '/sales/customers':        { title: 'Customers', breadcrumb: ['Transactions', 'Sales'] },
  '/barcode':                { title: 'Print Barcode', breadcrumb: ['Tools'] },
  '/expenses':               { title: 'Expenses', breadcrumb: ['Finance'] },
  '/reports/sales':          { title: 'Sales Report', breadcrumb: ['Analytics', 'Reports'] },
  '/reports/purchases':      { title: 'Purchase Report', breadcrumb: ['Analytics', 'Reports'] },
  '/reports/stock':          { title: 'Stock Report', breadcrumb: ['Analytics', 'Reports'] },
  '/settings':               { title: 'App Settings', breadcrumb: ['Administration'] },
  '/settings/warehouses':    { title: 'Warehouses', breadcrumb: ['Administration', 'Settings'] },
  '/settings/users':         { title: 'Users', breadcrumb: ['Administration', 'Settings'] },
}

const mockNotifications = [
  { id: '1', title: 'Low Stock Alert', message: 'iPhone 15 Pro has only 2 units left', time: '5m ago', read: false },
  { id: '2', title: 'New Sale', message: 'Sale #INV-1024 completed — $285.00', time: '1h ago', read: false },
  { id: '3', title: 'Purchase Received', message: 'PO-00087 has been received', time: '3h ago', read: true },
]

export default function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const location        = useLocation()
  const { user }        = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef        = useClickOutside<HTMLDivElement>(() => setNotifOpen(false))

  const meta     = routeMeta[location.pathname]
  const title    = meta?.title ?? 'SBox System'
  const crumbs   = meta?.breadcrumb ?? []
  const unread   = mockNotifications.filter((n) => !n.read).length
  const today    = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'A'

  return (
    <header className="bg-white border-b border-slate-100 px-4 flex items-center justify-between h-12 sticky top-0 z-20 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuToggle} className="btn-icon flex-shrink-0" title="Toggle sidebar">
          <HiOutlineMenu className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>InfyPOS</span>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <HiOutlineChevronRight className="w-2.5 h-2.5" />
                <span>{c}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-xs font-bold text-slate-800 leading-none truncate">{title}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="relative hidden lg:block mr-1">
          <HiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-44 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="Quick search…"
          />
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
          {theme === 'dark'
            ? <HiOutlineSun className="w-3.5 h-3.5" />
            : <HiOutlineMoon className="w-3.5 h-3.5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="btn-icon relative">
            <HiOutlineBell className="w-3.5 h-3.5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-9 w-72 bg-white rounded-xl shadow-modal border border-slate-100 overflow-hidden animate-scaleIn z-50">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Notifications</span>
                {unread > 0 && <span className="badge-blue">{unread} new</span>}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={cn('px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors', !n.read && 'bg-blue-50/40')}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-3.5 py-2.5 border-t border-slate-100 text-center">
                <Link to="/notifications" className="text-xs text-primary-600 hover:text-primary-700 font-semibold" onClick={() => setNotifOpen(false)}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200 ml-0.5">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-[10px] font-bold">{initials}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] font-bold text-slate-700 leading-none">{user?.name ?? 'Admin User'}</p>
            <p className="text-[9px] text-slate-400 capitalize mt-0.5">{user?.role ?? 'administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
