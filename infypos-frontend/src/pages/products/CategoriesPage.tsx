import React, { useState, useEffect, useCallback } from 'react'
import { Button, Modal, ConfirmDialog, Badge } from '@/components/common'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiChevronDown, HiChevronRight } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/date'
import { categoryApi } from '@/api/category.api'
import type { CategoryTree, Category } from '@/types/product.types'

type FormState = { name: string; description: string; parentCategory: string }

const EMPTY_FORM: FormState = { name: '', description: '', parentCategory: '' }

export default function CategoriesPage() {
  const [tree, setTree]           = useState<CategoryTree[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<Category | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true)
      const res = await categoryApi.getTree()
      setTree(res.data.data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTree() }, [fetchTree])

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const openCreate = (parentId = '') => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, parentCategory: parentId })
    setOpen(true)
  }

  const openEdit = (row: Category) => {
    setEditing(row)
    const parent = typeof row.parentCategory === 'object' && row.parentCategory
      ? row.parentCategory._id
      : (row.parentCategory as string) || ''
    setForm({ name: row.name, description: row.description || '', parentCategory: parent })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        parentCategory: form.parentCategory || null,
      }
      if (editing) {
        await categoryApi.update(editing._id, payload)
        toast.success('Category updated')
      } else {
        await categoryApi.create(payload)
        toast.success('Category created')
      }
      setOpen(false)
      await fetchTree()
      // Auto-expand parent so user sees the new subcategory
      if (form.parentCategory) setExpanded(prev => new Set(prev).add(form.parentCategory))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await categoryApi.delete(deleteTarget.id)
      toast.success('Category deleted')
      setDeleteTarget(null)
      await fetchTree()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const totalSubs = tree.reduce((acc, c) => acc + c.subcategories.length, 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{tree.length} categories · {totalSubs} subcategories</p>
        </div>
        <Button onClick={() => openCreate()}>
          <HiOutlinePlus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Name</span>
          <span>Description</span>
          <span>Status</span>
          <span>Created</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : tree.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No categories yet.{' '}
            <button onClick={() => openCreate()} className="text-blue-500 underline underline-offset-2">Add one</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tree.map(cat => {
              const isExpanded = expanded.has(cat._id)
              const hasSubs = cat.subcategories.length > 0
              return (
                <React.Fragment key={cat._id}>
                  {/* Root category row */}
                  <div className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => hasSubs && toggle(cat._id)}
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-400 transition-colors ${hasSubs ? 'hover:bg-slate-200 cursor-pointer' : 'cursor-default opacity-0'}`}
                      >
                        {isExpanded ? <HiChevronDown className="w-3.5 h-3.5" /> : <HiChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      <span className="font-semibold text-slate-800 text-sm truncate">{cat.name}</span>
                      {hasSubs && (
                        <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-600 font-medium px-1.5 py-0.5 rounded-full">
                          {cat.subcategories.length}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-xs truncate">{cat.description || '—'}</span>
                    <span><Badge status={cat.isActive ? 'active' : 'inactive'} /></span>
                    <span className="text-slate-400 text-xs">{formatDate(cat.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCreate(cat._id)}
                        title="Add subcategory"
                        className="btn-icon text-green-500 hover:bg-green-50"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(cat)} className="btn-icon text-blue-500 hover:bg-blue-50">
                        <HiOutlinePencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: cat._id, name: cat.name })} className="btn-icon text-red-400 hover:bg-red-50">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategory rows */}
                  {isExpanded && cat.subcategories.map(sub => (
                    <div key={sub._id} className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] gap-4 px-5 py-3 items-center bg-slate-50/60 hover:bg-slate-100/60 transition-colors border-t border-slate-100/80">
                      <div className="flex items-center gap-2 min-w-0 pl-7">
                        <span className="flex-shrink-0 w-4 h-px bg-slate-300" />
                        <span className="font-medium text-slate-700 text-sm truncate">{sub.name}</span>
                      </div>
                      <span className="text-slate-400 text-xs truncate">{sub.description || '—'}</span>
                      <span><Badge status={sub.isActive ? 'active' : 'inactive'} /></span>
                      <span className="text-slate-400 text-xs">{formatDate(sub.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(sub)} className="btn-icon text-blue-500 hover:bg-blue-50">
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: sub._id, name: sub.name })} className="btn-icon text-red-400 hover:bg-red-50">
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Category' : (form.parentCategory ? 'Add Subcategory' : 'Add Category')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Parent Category</label>
            <select
              className="input"
              value={form.parentCategory}
              onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}
            >
              <option value="">— None (Top-level category) —</option>
              {tree.map(cat => (
                <option key={cat._id} value={cat._id} disabled={editing?._id === cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Name *</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={form.parentCategory ? 'e.g. Mobile, Watch, AC…' : 'e.g. Electronics, Clothing…'}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. Subcategories must be deleted first.`}
        loading={deleting}
      />
    </div>
  )
}

// BrandsPage and UnitsPage remain in their own files
