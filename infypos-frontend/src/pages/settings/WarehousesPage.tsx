import React, { useEffect, useState } from 'react'
import { Button, Table, SearchBox, Modal, Input, Pagination, ConfirmDialog, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding } from 'react-icons/hi'
import { formatDate } from '@/utils/date'
import { warehouseApi, branchApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface Branch   { _id: string; name: string; code?: string }
interface Warehouse { _id: string; name: string; branch?: Branch; phone?: string; email?: string; address?: string; isActive: boolean; createdAt: string }

const initForm = { name: '', branch: '', phone: '', email: '', address: '' }

export default function WarehousesPage() {
  const [data, setData]         = useState<Warehouse[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [branches, setBranches] = useState<{ value: string; label: string }[]>([])
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Warehouse | null>(null)
  const [form, setForm]         = useState(initForm)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await warehouseApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    branchApi.getAll({ limit: 100 }).then(res =>
      setBranches([
        { value: '', label: 'No Branch' },
        ...(res.data.data || []).map((b: Branch) => ({ value: b._id, label: b.name + (b.code ? ` (${b.code})` : '') })),
      ])
    ).catch(() => {})
  }, [])

  useEffect(() => { fetchData() }, [page, search])

  const openCreate = () => { setEditing(null); setForm(initForm); setOpen(true) }
  const openEdit = (row: Warehouse) => {
    setEditing(row)
    setForm({
      name:    row.name || '',
      branch:  row.branch?._id || '',
      phone:   row.phone || '',
      email:   row.email || '',
      address: row.address || '',
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Warehouse name is required'); return }
    setSaving(true)
    try {
      const payload = { name: form.name, branch: form.branch || null, phone: form.phone, email: form.email, address: form.address }
      if (editing) {
        await warehouseApi.update(editing._id, payload)
        toast.success('Warehouse updated!')
      } else {
        await warehouseApi.create(payload)
        toast.success('Warehouse created!')
      }
      setOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await warehouseApi.delete(deleteId)
      toast.success('Warehouse deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Warehouse>[] = [
    { label: '#',        render: (_, i) => <span className="text-slate-400 text-xs font-mono">{(page - 1) * DEFAULT_PAGINATION.limit + (i ?? 0) + 1}</span> },
    { label: 'Warehouse', render: row => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <HiOutlineOfficeBuilding className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-xs text-slate-800">{row.name}</p>
          {row.phone && <p className="text-[10px] text-slate-400">{row.phone}</p>}
        </div>
      </div>
    )},
    { label: 'Branch', render: row => row.branch
      ? <span className="badge-blue text-[10px]">{row.branch.name}{row.branch.code ? ` · ${row.branch.code}` : ''}</span>
      : <span className="text-slate-300 text-xs">—</span>
    },
    { label: 'Email',   render: row => <span className="text-xs text-slate-500">{row.email || '—'}</span> },
    { label: 'Address', render: row => <span className="text-xs text-slate-500 truncate max-w-[160px] block">{row.address || '—'}</span> },
    { label: 'Status',  render: row => <Badge status={row.isActive ? 'active' : 'inactive'} /> },
    { label: 'Created', render: row => <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span> },
    { label: 'Actions', render: row => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouses</h1>
          <p className="page-subtitle">{meta.total} warehouses across all branches</p>
        </div>
        <Button onClick={openCreate}><HiOutlinePlus className="w-4 h-4" />Add Warehouse</Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search warehouses…" />
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No warehouses found" />
        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Warehouse' : 'Add Warehouse'}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Warehouse Name *" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Main Warehouse" />
          <div className="form-group">
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={e => set('branch', e.target.value)}>
              {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <p className="hint-msg">Assign this warehouse to a branch. Create branches under Settings → Branches.</p>
          </div>
          <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9999 000000" />
          <Input label="Email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="warehouse@company.com" />
          <div className="form-group">
            <label className="label">Address</label>
            <textarea rows={2} className="input resize-none" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Warehouse" message="Delete this warehouse? This will affect stock records." loading={deleting} />
    </div>
  )
}
