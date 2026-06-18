import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header  from '@/components/layout/Header'
import { PageLoader } from '@/components/common'
import { useAuth } from '@/hooks'
import { cn } from '@/utils/formatter'

// ── Main (protected dashboard) layout ────────────────────────
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={collapsed} />
      <div className={cn(
        'flex flex-col flex-1 overflow-hidden min-w-0 transition-all duration-300 ease-in-out',
        collapsed ? 'ml-[56px]' : 'ml-52'
      )}>
        <Header onMenuToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 animate-fadeIn max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

// ── Auth layout (redirect if already logged in) ───────────────
export function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ── POS full-screen layout (no sidebar) ──────────────────────
export function POSLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      <Outlet />
    </div>
  )
}

// ── Print layout ──────────────────────────────────────────────
export function PrintLayout() {
  return (
    <div className="bg-white min-h-screen">
      <Outlet />
    </div>
  )
}

// ── Minimal layout (errors, onboarding, etc.) ─────────────────
export function MinimalLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Outlet />
    </div>
  )
}

// ── Private route guard ───────────────────────────────────────
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
