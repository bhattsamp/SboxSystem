import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks'
import {
  HiOutlineHome, HiOutlineShoppingCart, HiOutlineCube,
  HiOutlineShoppingBag, HiOutlineReceiptRefund, HiOutlineChartBar,
  HiOutlineCog, HiOutlineQrcode, HiOutlineLogout, HiOutlineChevronDown,
  HiOutlineUsers, HiOutlineTag, HiOutlineCollection, HiOutlineOfficeBuilding,
  HiOutlineTruck, HiOutlineUserGroup, HiOutlineDocumentReport,
  HiOutlineCurrencyDollar, HiOutlineLibrary, HiOutlineColorSwatch,
  HiOutlineAdjustments, HiOutlineDocumentText, HiOutlineScale,
  HiOutlinePause, HiOutlineSwitchHorizontal, HiOutlineTranslate,
  HiOutlineClipboardList,
} from 'react-icons/hi'
import { cn } from '@/utils/formatter'

// ── Collapsible nav group ─────────────────────────────────────
interface NavGroupProps {
  label: string; icon: React.ElementType
  children: React.ReactNode; defaultOpen?: boolean
}

function NavGroup({ label, icon: Icon, children, defaultOpen = false }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="sidebar-link w-full">
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <HiOutlineChevronDown className={cn('w-3 h-3 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-0.5 ml-2.5 pl-2.5 border-l border-slate-700/60 space-y-0.5 pb-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Single nav link ───────────────────────────────────────────
function SLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

// ── Collapsed icon link ───────────────────────────────────────
function IconLink({ to, icon: Icon, title }: { to: string; icon: React.ElementType; title: string }) {
  return (
    <NavLink to={to} title={title}
      className={({ isActive }) => cn(
        'flex items-center justify-center w-8 h-8 rounded-lg mx-auto transition-all duration-150',
        isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
      )}>
      <Icon className="w-4 h-4" />
    </NavLink>
  )
}

// ── Sidebar ───────────────────────────────────────────────────
interface SidebarProps { collapsed: boolean }

export default function Sidebar({ collapsed }: SidebarProps) {
  const dispatch    = useAppDispatch()
  const navigate    = useNavigate()
  const { user }   = useAuth()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar z-30 flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[56px]' : 'w-52'
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center border-b border-sidebar-border flex-shrink-0 h-12',
        collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
      )}>
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-black text-xs leading-none">IP</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-none">InfyPOS</p>
            <p className="text-slate-500 text-[9px] mt-0.5">Point of Sale</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5">
        {collapsed ? (
          // Icon-only mode
          <div className="flex flex-col gap-0.5 items-center px-1.5">
            {[
              { to: '/dashboard',          icon: HiOutlineHome },
              { to: '/pos',                icon: HiOutlineShoppingCart },
              { to: '/products',           icon: HiOutlineCube },
              { to: '/purchases',          icon: HiOutlineShoppingBag },
              { to: '/sales',              icon: HiOutlineReceiptRefund },
              { to: '/barcode',            icon: HiOutlineQrcode },
              { to: '/expenses',           icon: HiOutlineCurrencyDollar },
              { to: '/reports/sales',      icon: HiOutlineChartBar },
              { to: '/settings',           icon: HiOutlineCog },
            ].map(({ to, icon }) => (
              <IconLink key={to} to={to} icon={icon} title={to.slice(1)} />
            ))}
          </div>
        ) : (
          // Full navigation
          <div className="px-3 space-y-0.5">
            <SLink to="/dashboard" icon={HiOutlineHome} label="Dashboard" />
            <SLink to="/pos" icon={HiOutlineShoppingCart} label="POS Screen" />

            <p className="sidebar-group-label">Inventory</p>

            <NavGroup label="Products" icon={HiOutlineCube} defaultOpen>
              <SLink to="/products"                   icon={HiOutlineCube}        label="Product Master" />
              <SLink to="/products/distribution"      icon={HiOutlineOfficeBuilding} label="Distribution" />
              <SLink to="/products/parent-categories" icon={HiOutlineCollection}  label="Parent Categories" />
              <SLink to="/products/categories"        icon={HiOutlineTag}         label="Sub Categories" />
              <SLink to="/products/brands"            icon={HiOutlineColorSwatch} label="Brands" />
              <SLink to="/products/units"             icon={HiOutlineLibrary}     label="Units" />
              <SLink to="/products/variations"        icon={HiOutlineTag}         label="Variations" />
              <SLink to="/products/base-units"        icon={HiOutlineScale}       label="Base Units" />
            </NavGroup>

            <SLink to="/adjustments" icon={HiOutlineAdjustments} label="Adjustments" />
            <SLink to="/transfers"   icon={HiOutlineSwitchHorizontal} label="Transfers" />
            <SLink to="/quotations"  icon={HiOutlineDocumentText} label="Quotations" />

            <NavGroup label="Purchases" icon={HiOutlineShoppingBag}>
              <SLink to="/purchases"              icon={HiOutlineShoppingBag}   label="All Purchases" />
              <SLink to="/purchases/orders"       icon={HiOutlineDocumentText}  label="Purchase Order" />
              <SLink to="/purchases/grn"          icon={HiOutlineClipboardList} label="GRN" />
              <SLink to="/purchases/suppliers"    icon={HiOutlineTruck}         label="Suppliers" />
              <SLink to="/purchase-return"        icon={HiOutlineReceiptRefund} label="Purchase Returns" />
            </NavGroup>

            <NavGroup label="Sales" icon={HiOutlineReceiptRefund}>
              <SLink to="/sales"                   icon={HiOutlineReceiptRefund} label="All Sales" />
              <SLink to="/sales/orders"             icon={HiOutlineDocumentText}  label="Sales Order" />
              <SLink to="/sales/delivery-notes"     icon={HiOutlineTruck}         label="Delivery Note" />
              <SLink to="/sales/customers"          icon={HiOutlineUserGroup}     label="Customers" />
              <SLink to="/sale-return"              icon={HiOutlineReceiptRefund} label="Sales Returns" />
              <SLink to="/holds"                    icon={HiOutlinePause}         label="Hold" />
            </NavGroup>

            <SLink to="/barcode" icon={HiOutlineQrcode} label="Print Barcode" />

            <p className="sidebar-group-label">Finance</p>
            <NavGroup label="Expenses" icon={HiOutlineCurrencyDollar}>
              <SLink to="/expenses"            icon={HiOutlineCurrencyDollar} label="All Expenses" />
              <SLink to="/expenses/categories" icon={HiOutlineCollection}     label="Expense Categories" />
            </NavGroup>

            <p className="sidebar-group-label">Analytics</p>

            <NavGroup label="Reports" icon={HiOutlineDocumentReport}>
              <SLink to="/reports/sales"      icon={HiOutlineChartBar} label="Sales Report" />
              <SLink to="/reports/purchases"  icon={HiOutlineChartBar} label="Purchase Report" />
              <SLink to="/reports/stock"      icon={HiOutlineChartBar} label="Stock Report" />
            </NavGroup>

            <SLink to="/languages" icon={HiOutlineTranslate} label="Languages" />

            <p className="sidebar-group-label">Administration</p>

            <NavGroup label="Settings" icon={HiOutlineCog}>
              <SLink to="/settings"                 icon={HiOutlineCog}            label="App Settings" />
              <SLink to="/settings/branches"        icon={HiOutlineLibrary}        label="Branches" />
              <SLink to="/settings/warehouses"      icon={HiOutlineOfficeBuilding} label="Warehouses" />
              <SLink to="/settings/users"           icon={HiOutlineUsers}          label="Users" />
              <SLink to="/settings/payment-methods" icon={HiOutlineCurrencyDollar} label="Payment Methods" />
              <SLink to="/settings/voucher-types"   icon={HiOutlineDocumentText}   label="Voucher Types" />
            </NavGroup>
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className={cn(
        'flex-shrink-0 border-t border-sidebar-border',
        collapsed ? 'py-2 px-1.5' : 'p-2'
      )}>
        {collapsed ? (
          <button onClick={handleLogout} title="Logout"
            className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-all">
            <HiOutlineLogout className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors group">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-[10px] font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold truncate leading-none">{user?.name ?? 'Admin User'}</p>
              <p className="text-slate-500 text-[9px] capitalize mt-0.5 truncate">{user?.role ?? 'administrator'}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
              <HiOutlineLogout className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
