import React, { useEffect, useState } from 'react'
import { Button, Table, SearchBox, Modal, Input, Textarea, ConfirmDialog, Pagination, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/date'
import { DEFAULT_PAGINATION } from '@/constants/modules'

export interface CRUDField {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'tags' | 'select'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface CRUDApi {
  getAll: (params?: any) => Promise<any>
  create: (data: object) => Promise<any>
  update: (id: string, data: object) => Promise<any>
  delete: (id: string) => Promise<any>
}

interface Row {
  _id: string
  name: string
  isActive?: boolean
  createdAt?: string
  [key: string]: any
}

export default function MasterCrudPage({ title, api, fields }: { title: string; api: CRUDApi; fields: CRUDField[] }) {
  const [data, setData]         = useState<Row[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Row|null>(null)
  const [form, setForm]         = useState<Record<string,string>>({})
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const singular = title.endsWith('s') ? title.slice(0,-1) : title

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      const docs = res.data.data || []
      setData(docs)
      setMeta({ total: res.data.meta?.total ?? docs.length, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const openCreate = () => { setEditing(null); setForm({}); setOpen(true) }
  const openEdit = (row: Row) => {
    setEditing(row)
    const f: Record<string,string> = {}
    fields.forEach(field => {
      const val = row[field.key]
      f[field.key] = field.type === 'tags' ? (Array.isArray(val) ? val.join(', ') : '') : (val ?? '')
    })
    setForm(f); setOpen(true)
  }

  const handleSave = async () => {
    const nameField = fields.find(f => f.key === 'name')
    if (nameField?.required !== false && !form.name?.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      fields.forEach(field => {
        if (field.type === 'tags') {
          payload[field.key] = (form[field.key]||'').split(',').map(s=>s.trim()).filter(Boolean)
        } else {
          payload[field.key] = form[field.key] || ''
        }
      })
      if (editing) {
        await api.update(editing._id, payload)
        toast.success(`${singular} updated!`)
      } else {
        await api.create(payload)
        toast.success(`${singular} created!`)
      }
      setOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(deleteId)
      toast.success('Deleted successfully')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Row>[] = [
    { label:'#', render:(_:Row,i?:number)=><span className="text-slate-400 text-xs font-mono">{(page-1)*DEFAULT_PAGINATION.limit+(i??0)+1}</span> },
    { label:'Name', render:row=><span className="font-semibold text-slate-800 text-sm">{row.name}</span> },
    ...fields.filter(f=>f.key!=='name').map(field => ({
      label: field.label,
      render: (row: Row) => field.type === 'tags'
        ? <div className="flex flex-wrap gap-1">{(row[field.key]||[]).map((v:string)=><span key={v} className="badge-blue text-[10px]">{v}</span>)}</div>
        : <span className="text-slate-400 text-xs">{row[field.key]||'—'}</span>
    } as TableColumn<Row>)),
    { label:'Status',  render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Created', render:row=><span className="text-slate-400 text-xs">{row.createdAt?formatDate(row.createdAt):'—'}</span> },
    { label:'Actions', render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>openEdit(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{meta.total} {title.toLowerCase()}</p>
        </div>
        <Button onClick={openCreate}><HiOutlinePlus className="w-4 h-4"/>Add {singular}</Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={(v)=>{setSearch(v);setPage(1)}} placeholder={`Search ${title.toLowerCase()}…`}/>
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg={`No ${title.toLowerCase()} found`}/>
        <Pagination page={page} totalPages={Math.max(1,meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage}/>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={editing?`Edit ${singular}`:`Add ${singular}`}
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          {fields.map(f=>(
            f.type==='textarea'?(
              <Textarea key={f.key} label={`${f.label}${f.required?' *':''}`} rows={3} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
            ):f.type==='tags'?(
              <Input key={f.key} label={`${f.label}${f.required?' *':''}`} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder||'Comma-separated values'} hint="Separate multiple values with commas"/>
            ):f.type==='select'?(
              <div key={f.key} className="form-group">
                <label className="label">{f.label}{f.required?' *':''}</label>
                <select className="input" value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}>
                  <option value="">{f.placeholder||`Select ${f.label}`}</option>
                  {f.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ):(
              <Input key={f.key} label={`${f.label}${f.required?' *':''}`} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})} required={f.required} placeholder={f.placeholder}/>
            )
          ))}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title={`Delete ${singular}`} message={`Delete this ${singular.toLowerCase()}? This cannot be undone.`} loading={deleting}/>
    </div>
  )
}
