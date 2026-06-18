import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Select } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { productDistributionApi } from '@/api'
import { productApi } from '@/api/product.api'
import { warehouseApi, taxApi, unitApi } from '@/api'
import { BARCODE_SYMBOLOGIES } from '@/constants/barcode'
import { generateSKU } from '@/utils/calculation'

const init = {
  product: '', warehouse: '',
  sku: '', barcode: '', barcodeSymbology: 'CODE128',
  purchasePrice: '', salePrice: '', mrp: '', taxRate: '0', tax: '',
  openingStock: '0',
  alternateUnit: '', alternateUnitFactor: '1',
  isActive: true,
}

export default function AddDistributionPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = !!id

  const [form, setForm]       = useState(init)
  const [loading, setLoading] = useState(false)
  const [products,   setProducts]   = useState<{ value: string; label: string }[]>([])
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([])
  const [taxes,      setTaxes]      = useState<{ value: string; label: string }[]>([])
  const [units,      setUnits]      = useState<{ value: string; label: string }[]>([])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    Promise.all([
      productApi.getAll({ limit: 500, isActive: true }),
      warehouseApi.getAll({ limit: 100 }),
      taxApi.getAll(),
      unitApi.getAll({ limit: 200 }),
    ]).then(([prods, whs, txs, us]) => {
      setProducts(prods.data.data.map((p: any) => ({ value: p._id, label: p.name })))
      setWarehouses(whs.data.data.map((w: any) => ({ value: w._id, label: w.name + (w.branch?.name ? ` — ${w.branch.name}` : '') })))
      setTaxes([{ value: '', label: 'No Tax' }, ...txs.data.data.map((t: any) => ({ value: t._id, label: `${t.name} (${t.rate}%)` }))])
      setUnits([{ value: '', label: 'None' }, ...(us.data.data || []).map((u: any) => ({ value: u._id, label: `${u.name} (${u.shortName})` }))])
    }).catch(() => toast.error('Failed to load options'))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    productDistributionApi.getById(id!).then(res => {
      const d = res.data.data
      setForm({
        product:          d.product?._id     || d.product || '',
        warehouse:        d.warehouse?._id   || d.warehouse || '',
        sku:              d.sku || '',
        barcode:          d.barcode || '',
        barcodeSymbology: d.barcodeSymbology || 'CODE128',
        purchasePrice:    String(d.purchasePrice ?? ''),
        salePrice:        String(d.salePrice ?? ''),
        mrp:              String(d.mrp ?? ''),
        taxRate:          String(d.taxRate ?? '0'),
        tax:              d.tax?._id || d.tax || '',
        openingStock:           String(d.openingStock ?? '0'),
        alternateUnit:          d.alternateUnit?._id || d.alternateUnit || '',
        alternateUnitFactor:    String(d.alternateUnitFactor ?? '1'),
        isActive:               d.isActive ?? true,
      })
    }).catch(() => toast.error('Failed to load distribution'))
  }, [id, isEdit])

  const autoSKU = () => {
    const product = products.find(p => p.value === form.product)
    set('sku', generateSKU(product?.label || 'PRD'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product)       { toast.error('Product is required'); return }
    if (!form.warehouse)     { toast.error('Warehouse is required'); return }
    if (!form.sku)           { toast.error('SKU is required'); return }
    if (!form.purchasePrice) { toast.error('Purchase price is required'); return }
    if (!form.salePrice)     { toast.error('Sale price is required'); return }

    setLoading(true)
    try {
      const payload = {
        ...form,
        purchasePrice:       parseFloat(form.purchasePrice),
        salePrice:           parseFloat(form.salePrice),
        mrp:                 parseFloat(form.mrp || '0'),
        taxRate:             parseFloat(form.taxRate || '0'),
        openingStock:        parseInt(form.openingStock || '0'),
        tax:                 form.tax || null,
        alternateUnit:       form.alternateUnit || null,
        alternateUnitFactor: parseFloat(form.alternateUnitFactor || '1'),
      }
      if (isEdit) {
        await productDistributionApi.update(id!, payload)
        toast.success('Distribution updated!')
      } else {
        await productDistributionApi.create(payload)
        toast.success('Distribution created!')
      }
      navigate('/products/distribution')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const PriceField = ({ label, field, required = false }: { label: string; field: string; required?: boolean }) => (
    <div className="form-group">
      <label className="label">{label}{required && ' *'}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm pointer-events-none">$</span>
        <input type="number" step="0.01" min="0" required={required} className="input pl-8"
          value={(form as any)[field]} onChange={e => set(field, e.target.value)} placeholder="0.00" />
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/products/distribution')} className="btn-icon">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Distribution' : 'Add Distribution'}</h1>
            <p className="page-subtitle">Assign SKU, pricing and warehouse to a product</p>
          </div>
        </div>
        <Button type="submit" loading={loading}>
          <HiOutlineSave className="w-4 h-4" />{isEdit ? 'Update' : 'Save'} Distribution
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Product & Warehouse */}
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Product & Warehouse</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Product *" value={form.product} onChange={e => set('product', e.target.value)}
                options={products} placeholder="Select product" required disabled={isEdit} />
              <Select label="Warehouse *" value={form.warehouse} onChange={e => set('warehouse', e.target.value)}
                options={warehouses} placeholder="Select warehouse" required disabled={isEdit} />
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">SKU & Barcode</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">SKU Code *</label>
                <div className="flex gap-2">
                  <input className="input flex-1 font-mono" value={form.sku}
                    onChange={e => set('sku', e.target.value)} required placeholder="PRD-00001" />
                  <button type="button" onClick={autoSKU}
                    className="btn btn-secondary btn-sm flex-shrink-0" title="Auto-generate">
                    <HiOutlineRefresh className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Barcode</label>
                <input className="input font-mono" value={form.barcode}
                  onChange={e => set('barcode', e.target.value)} placeholder="Leave blank to auto-generate" />
              </div>
            </div>
            <div className="max-w-xs">
              <Select label="Barcode Symbology" value={form.barcodeSymbology}
                onChange={e => set('barcodeSymbology', e.target.value)}
                options={BARCODE_SYMBOLOGIES.map(s => ({ value: s.value, label: s.label }))} />
            </div>
          </div>

          {/* Pricing */}
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Pricing & Tax</h3>
            <div className="grid grid-cols-3 gap-4">
              <PriceField label="Purchase Price *" field="purchasePrice" required />
              <PriceField label="Sale Price *"     field="salePrice"     required />
              <PriceField label="MRP"              field="mrp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Tax Rate (%)</label>
                <input type="number" step="0.1" min="0" max="100" className="input"
                  value={form.taxRate} onChange={e => set('taxRate', e.target.value)} />
              </div>
              <Select label="Tax Group" value={form.tax} onChange={e => set('tax', e.target.value)} options={taxes} />
            </div>
          </div>

          {/* Alternate Unit */}
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Alternate Unit of Measure</h3>
            <p className="text-xs text-slate-400 -mt-2">Optional secondary unit. Example: 1 Box = 2 Pieces, 1 Roll = 100 Meters.</p>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Alternate Unit" value={form.alternateUnit} onChange={e => set('alternateUnit', e.target.value)}
                options={units} placeholder="Select alternate unit" />
              <div className="form-group">
                <label className="label">Conversion Factor</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">1 Alt Unit =</span>
                  <input type="number" step="0.0001" min="0.0001" className="input"
                    value={form.alternateUnitFactor} onChange={e => set('alternateUnitFactor', e.target.value)}
                    disabled={!form.alternateUnit} />
                  <span className="text-xs text-slate-500 whitespace-nowrap">Primary Units</span>
                </div>
                <p className="hint-msg">
                  {form.alternateUnit && form.alternateUnitFactor
                    ? `1 ${units.find(u => u.value === form.alternateUnit)?.label || 'Alt Unit'} = ${form.alternateUnitFactor} primary units`
                    : 'Select an alternate unit first'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Initial Stock — only on create */}
          {!isEdit && (
            <div className="card space-y-4">
              <h3 className="section-title border-b border-slate-100 pb-3">Initial Stock</h3>
              <div className="form-group">
                <label className="label">Opening Stock Quantity</label>
                <input type="number" min="0" className="input max-w-[160px]"
                  value={form.openingStock} onChange={e => set('openingStock', e.target.value)} />
                <p className="hint-msg">Stock will be added to the selected warehouse. Leave 0 to add stock later.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Status */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-title">Status</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.isActive ? 'Active — available for sale' : 'Inactive — not available'}
                </p>
              </div>
              <button type="button" onClick={() => set('isActive', !form.isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.isActive ? 'bg-primary-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
