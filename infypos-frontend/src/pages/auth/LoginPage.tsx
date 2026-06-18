import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import { loginThunk } from '@/store/slices/authSlice'
import { Button, Input } from '@/components/common'
import toast from 'react-hot-toast'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck } from 'react-icons/hi'

const features = [
  { icon: '📦', title: 'Multi-Warehouse', desc: 'Manage stock across multiple locations' },
  { icon: '🔖', title: 'Barcode Printing', desc: 'Generate & print labels in any format' },
  { icon: '📊', title: 'Real-time Reports', desc: 'Sales, purchases and profit analytics' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Admin, Manager & Cashier roles' },
]

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ email: 'admin@infypos.com', password: '123456' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await dispatch(loginThunk(form)).unwrap()
      toast.success('Welcome back! 👋')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      toast.error(err || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 left-8 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg leading-none">SB</span>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">SBox System</p>
            <p className="text-slate-500 text-xs mt-0.5">Point of Sale System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your complete<br />
            <span className="text-primary-400">store management</span><br />
            solution.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
            Advanced POS with barcode printing, multi-warehouse inventory,
            purchase tracking, sales analytics and role-based access control.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-xl">{f.icon}</span>
                <p className="text-white text-sm font-bold mt-2 leading-tight">{f.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">© {new Date().getFullYear()} SBox System. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">SB</span>
            </div>
            <span className="font-bold text-xl text-slate-800">SBox System</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800">Sign in to your account</h1>
            <p className="text-slate-400 text-sm mt-1.5">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@infypos.com"
              leftIcon={<HiOutlineMail className="w-4 h-4" />}
              required
            />

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass
                    ? <HiOutlineEyeOff className="w-4 h-4" />
                    : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-semibold">
                Forgot password?
              </a>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3 text-sm mt-2">
              {!loading && <HiOutlineShieldCheck className="w-4 h-4" />}
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <p className="text-[11px] font-bold text-primary-600 uppercase tracking-wider mb-2">
              🔑 Demo Credentials
            </p>
            <div className="space-y-0.5">
              <p className="text-xs text-primary-700 font-mono">Email: admin@infypos.com</p>
              <p className="text-xs text-primary-700 font-mono">Password: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
