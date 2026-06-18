import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from '@/components/common'
import {
  HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineSave,
  HiOutlineCube, HiOutlineTag, HiOutlineColorSwatch,
  HiOutlineLibrary, HiOutlineExclamationCircle, HiOutlineBell,
  HiOutlineChevronRight, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineTrash, HiOutlineUpload,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { productApi }  from '@/api/product.api'
import { categoryApi } from '@/api/category.api'
import { brandApi }    from '@/api/brand.api'
import { unitApi }     from '@/api'

type Option = { value: string; label: string }

const init = {
  name: '', description: '', category: '', subCategory: '',
  brand: '', unit: '', alertQuantity: '5', isActive: true,
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <HiOutlineExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────
function Section({ icon: Icon, title, color = 'blue', children }: {
  icon: React.ElementType; title: string
  color?: 'blue' | 'violet' | 'emerald' | 'orange'
  children: React.ReactNode
}) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600',
    violet:  'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange:  'bg-orange-50 text-orange-600',
  }
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

export default function AddProductPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = !!id
  const fileRef  = useRef<HTMLInputElement>(null)

  const [form, setForm]             = useState(init)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImgPrev]  = useState<string | null>(null)
  const [dragOver, setDragOver]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [pageLoading, setPageLoading] = useState(isEdit)

  const [parentCats, setParentCats] = useState<Option[]>([])
  const [subCats, setSubCats]       = useState<Option[]>([])
  const [brands, setBrands]         = useState<Option[]>([])
  const [units, setUnits]           = useState<Option[]>([])

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  // Load dropdown options
  useEffect(() => {
    Promise.all([
      categoryApi.getAll({ limit: 200, parentCategory: 'null' }),
      brandApi.getAll({ limit: 200 }),
      unitApi.getAll({ limit: 200 }),
    ]).then(([cats, brds, unts]) => {
      setParentCats(cats.data.data.map((c: any) => ({ value: c._id, label: c.name })))
      setBrands(brds.data.data.map((b: any) => ({ value: b._id, label: b.name })))
      setUnits(unts.data.data.map((u: any) => ({
        value: u._id, label: `${u.name} (${u.shortName})`,
      })))
    }).catch(() => toast.error('Failed to load options'))
  }, [])

  // When parent category changes, load its subcategories
  useEffect(() => {
    setSubCats([])
    set('subCategory', '')
    if (!form.category) return
    categoryApi.getAll({ limit: 200, parentCategory: form.category })
      .then(res => setSubCats(res.data.data.map((c: any) => ({ value: c._id, label: c.name }))))
      .catch(() => {})
  }, [form.category])

  // Load existing product on edit
  useEffect(() => {
    if (!isEdit) return
    productApi.getById(id!).then(res => {
      const p = res.data.data
      const catId   = typeof p.category === 'object' ? p.category?._id : p.category
      const brandId = typeof p.brand    === 'object' ? p.brand?._id    : p.brand
      const unitId  = typeof p.unit     === 'object' ? p.unit?._id     : p.unit
      setForm({
        name: p.name || '', description: p.description || '',
        category: catId || '', subCategory: '',
        brand: brandId || '', unit: unitId || '',
        alertQuantity: String(p.alertQuantity ?? 5),
        isActive: p.isActive ?? true,
      })
      if (p.image) {
        setImgPrev(p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`)
      }
    }).catch(() => toast.error('Failed to load product'))
      .finally(() => setPageLoading(false))
  }, [id, isEdit])

  // Image handling
  const applyImage = (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return }
    setImageFile(file)
    setImgPrev(URL.createObjectURL(file))
  }
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) applyImage(file)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) applyImage(file)
  }
  const removeImage = () => { setImgPrev(null); setImageFile(null); if (fileRef.current) fileRef.current.value = '' }

  // Validation
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name     = 'Product name is required'
    if (!form.category)     e.category = 'Category is required'
    if (!form.unit)         e.unit     = 'Unit is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the errors below'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      // Use subcategory if selected, otherwise parent category
      const finalCategory = form.subCategory || form.category
      fd.append('name',          form.name.trim())
      fd.append('description',   form.description)
      fd.append('category',      finalCategory)
      fd.append('brand',         form.brand || '')
      fd.append('unit',          form.unit)
      fd.append('alertQuantity', form.alertQuantity || '5')
      fd.append('isActive',      String(form.isActive))
      if (imageFile) fd.append('image', imageFile)

      if (isEdit) {
        await productApi.update(id!, fd)
        toast.success('Product updated successfully!')
      } else {
        await productApi.create(fd)
        toast.success('Product created successfully!')
      }
      navigate('/products')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nameLen = form.name.length

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => navigate('/products')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all flex-shrink-0">
            <HiOutlineArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <Link to="/products" className="hover:text-primary-600 transition-colors">Product Master</Link>
              <HiOutlineChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-medium">{isEdit ? 'Edit Product' : 'Add New Product'}</span>
            </div>
            <h1 className="text-lg font-black text-slate-800 leading-tight truncate">
              {isEdit ? (form.name || 'Edit Product') : 'Add New Product'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => navigate('/products')}
            className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <Button type="submit" loading={loading} className="gap-2">
            <HiOutlineSave className="w-4 h-4" />
            {isEdit ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>

      {/* Required fields note */}
      <p className="text-[11px] text-slate-400 mb-5">
        Fields marked with <span className="text-red-500 font-bold">*</span> are required.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── Left column (2/3) ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Basic Information */}
          <Section icon={HiOutlineCube} title="Basic Information" color="blue">
            <Field label="Product Name" required error={errors.name}>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Apple iPhone 15 Pro Max"
                  maxLength={120}
                  className={`input pr-14 ${errors.name ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums ${nameLen > 100 ? 'text-amber-500' : 'text-slate-300'}`}>
                  {nameLen}/120
                </span>
              </div>
            </Field>

            <Field label="Description" hint="Briefly describe the product — optional but helps with search.">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Enter product description…"
                rows={4}
                className="input resize-none"
              />
            </Field>
          </Section>

          {/* Inventory Settings */}
          <Section icon={HiOutlineBell} title="Inventory Settings" color="orange">
            <div className="flex items-start gap-5">
              <Field
                label="Stock Alert Quantity"
                hint="You'll be notified when stock falls below this number."
              >
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" max="9999"
                    value={form.alertQuantity}
                    onChange={e => set('alertQuantity', e.target.value)}
                    className="input w-32 text-center font-mono font-bold"
                  />
                  <span className="text-xs text-slate-400">units</span>
                </div>
              </Field>
              <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3.5 mt-6">
                <p className="text-xs font-semibold text-orange-700 mb-1">When does this trigger?</p>
                <p className="text-[11px] text-orange-600 leading-relaxed">
                  A low-stock alert fires when stock quantity in any warehouse drops at or below this threshold. Set to <strong>0</strong> to disable alerts.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-5">

          {/* Product Image */}
          <Section icon={HiOutlinePhotograph} title="Product Image" color="violet">
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-square">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <button type="button" onClick={removeImage}
                      className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full btn btn-secondary btn-sm gap-2">
                  <HiOutlineUpload className="w-3.5 h-3.5" />Change Image
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${dragOver ? 'bg-primary-100' : 'bg-slate-100'}`}>
                  <HiOutlinePhotograph className={`w-6 h-6 ${dragOver ? 'text-primary-500' : 'text-slate-400'}`} />
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  {dragOver ? 'Drop to upload' : 'Click or drag image here'}
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP · Max 2 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageInput} />
          </Section>

          {/* Classification */}
          <Section icon={HiOutlineTag} title="Classification" color="blue">
            <Field label="Category" required error={errors.category}>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className={`input ${errors.category ? 'border-red-400 focus:ring-red-400/20' : ''}`}
              >
                <option value="">Select parent category</option>
                {parentCats.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            {/* Sub-category — only shown when parent has children */}
            {subCats.length > 0 && (
              <Field label="Sub Category" hint="Optional — assign to a more specific category.">
                <select
                  value={form.subCategory}
                  onChange={e => set('subCategory', e.target.value)}
                  className="input"
                >
                  <option value="">— Use parent category —</option>
                  {subCats.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            )}

            <Field label="Brand">
              <select value={form.brand} onChange={e => set('brand', e.target.value)} className="input">
                <option value="">— No brand —</option>
                {brands.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <Field label="Unit" required error={errors.unit}>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className={`input ${errors.unit ? 'border-red-400 focus:ring-red-400/20' : ''}`}
              >
                <option value="">Select unit</option>
                {units.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </Section>

          {/* Publish */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${form.isActive ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                {form.isActive
                  ? <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                  : <HiOutlineXCircle    className="w-4 h-4 text-slate-400" />}
              </div>
              <h3 className="text-sm font-bold text-slate-800">Publish</h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Status row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Visibility</p>
                  <p className={`text-[11px] mt-0.5 font-medium ${form.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {form.isActive ? 'Active — visible in POS & store' : 'Inactive — hidden from POS'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${form.isActive ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-300 focus:ring-slate-400'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Save button in publish card */}
              <Button type="submit" loading={loading} className="w-full justify-center">
                <HiOutlineSave className="w-4 h-4" />
                {isEdit ? 'Update Product' : 'Publish Product'}
              </Button>

              {isEdit && (
                <button type="button" onClick={() => navigate('/products')}
                  className="w-full btn btn-secondary btn-sm justify-center">
                  Discard Changes
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}
