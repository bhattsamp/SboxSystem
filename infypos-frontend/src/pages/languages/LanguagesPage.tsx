import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, ConfirmDialog, Pagination, SearchBox } from '@/components/common'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTranslate } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/date'
import { languageApi } from '@/api'

type Language = { _id: string; name: string; isoCode: string; isActive: boolean; createdAt: string }
type FormState = { name: string; isoCode: string }

export default function LanguagesPage() {
  const navigate = useNavigate()
  const [data, setData]           = useState<Language[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1 })
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<Language | null>(null)
  const [form, setForm]           = useState<FormState>({ name: '', isoCode: '' })
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Language | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [toggling, setToggling]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await languageApi.getAll({ page, limit: 15, search })
      setData(res.data.data)
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch { toast.error('Failed to load languages') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setEditing(null); setForm({ name: '', isoCode: '' }); setOpen(true) }
  const openEdit   = (row: Language) => { setEditing(row); setForm({ name: row.name, isoCode: row.isoCode }); setOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim())    { toast.error('Name is required'); return }
    if (!form.isoCode.trim()) { toast.error('ISO code is required'); return }
    setSaving(true)
    try {
      if (editing) {
        await languageApi.update(editing._id, form)
        toast.success('Language updated')
      } else {
        await languageApi.create(form)
        toast.success('Language created')
      }
      setOpen(false); fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await languageApi.delete(deleteTarget._id)
      toast.success('Language deleted')
      setDeleteTarget(null); fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally { setDeleting(false) }
  }

  const handleToggle = async (row: Language) => {
    setToggling(row._id)
    try {
      await languageApi.toggle(row._id)
      setData(prev => prev.map(l => l._id === row._id ? { ...l, isActive: !l.isActive } : l))
    } catch { toast.error('Failed to update status') }
    finally { setToggling(null) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Languages</h1>
          <p className="page-subtitle">{meta.total} languages</p>
        </div>
        <Button onClick={openCreate}><HiOutlinePlus className="w-4 h-4" />Create Language</Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search languages…" />
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['#', 'Name', 'ISO Code', 'Status', 'Translation', 'Action'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No languages found</td></tr>
            ) : data.map((row, i) => (
              <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{(page - 1) * 15 + i + 1}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800 text-sm">{row.name}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-slate-100 text-slate-600 font-mono text-xs px-2 py-0.5 rounded">{row.isoCode}</span>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => handleToggle(row)}
                    disabled={toggling === row._id}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${row.isActive ? 'bg-primary-600' : 'bg-slate-300'} ${toggling === row._id ? 'opacity-50' : ''}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${row.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => navigate(`/languages/${row._id}/translations`)}
                    className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                  >
                    <HiOutlineTranslate className="w-4 h-4" />
                    Edit Translation
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(row)} className="btn-icon text-blue-500 hover:bg-blue-50">
                      <HiOutlinePencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-icon text-red-400 hover:bg-red-50">
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={15} onChange={setPage} />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Language' : 'Create Language'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Language Name *</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. English, Spanish, French" autoFocus />
          </div>
          <div className="form-group">
            <label className="label">ISO Code *</label>
            <input type="text" className="input" value={form.isoCode} onChange={e => setForm(f => ({ ...f, isoCode: e.target.value.toLowerCase() }))} placeholder="e.g. en, es, fr, ar" maxLength={10} />
            <p className="text-xs text-slate-400 mt-1">Short code used to identify the language (lowercase)</p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Language"
        message={`Delete "${deleteTarget?.name}" and all its translations? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
