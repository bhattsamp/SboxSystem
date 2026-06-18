import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/common'
import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    toast.success('Reset link sent!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card-lg p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineMail className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-xl font-black text-slate-800">Forgot Password?</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive a password reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
              <HiOutlineCheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-700 font-medium">
                Reset link sent to <strong>{email}</strong>. Please check your inbox.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary w-full justify-center py-3 block text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<HiOutlineMail className="w-4 h-4" />}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" loading={loading} className="w-full justify-center py-3">
              Send Reset Link
            </Button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  )
}
