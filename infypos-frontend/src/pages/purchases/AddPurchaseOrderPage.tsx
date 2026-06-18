import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineShoppingCart } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { purchaseApi, warehouseApi, productApi, voucherTypeApi } from '@/api'
import { supplierApi } from '@/api'
import toast from 'react-hot-toast'

type POItem = { id: string; productId: string; name: string; sku: string; quantity: number; unitCost: number; taxRate: number }

const calcLine = (i: POItem) => {
  const subtotal = i.quantity * i.unitCost
  const taxAmount = (subtotal * i.taxRate) / 100
  return { subtotal, taxAmount, total: subtotal + taxAmount }
}

export default function AddPurchaseOrderPage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses]     = useState<{ _id: string; name: string }[]>([])
  const [suppliers, setSuppliers]       = useState<{ _id: string; name: string }[]>([])
  const [products, setProducts]         = useState<{ _id: string; name: string; sku?: string; purchasePrice?: number; taxRate?: number }[]>([])
  const [voucherTypes, setVoucherTypes] = useState<{ _id: string; name: string }[]>([])
  const [form, setForm] = useState({ warehouse: '', supplier: '', voucherType: '', purchaseType: 'regular', shippingCost: 0, note: '' })
  const [items, setItems]   = useState<POItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [whRes, supRes, prodRes, vtRes] = await Promise.all([
          warehouseApi.getAll({ limit: 100 }),
          supplierApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 1000 }),
          voucherTypeApi.getAll({ limit: 100, module: 'purchase' }),
        ])
        const whs = whRes.data.data || []
        setWarehouses(whs)
        setSuppliers(supRes.data.data || [])
        setProducts(prodRes.data.data || [])
        setVoucherTypes(vtRes.data.data || [])
        if (whs.length) setForm(f => ({ ...f, warehouse: whs[0]._id }))
      } catch {
        toast.error('Failed to load form data')
      }
    })()
  }, [])

  const addItem = (productId: string) => {
    const prod = products.find(p => p._id === productId)
    if (!prod) return
    setItems(prev => {
      if (prev.find(i => i.productId === productId)) return prev
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku || '', quantity: 1, unitCost: prod.purchasePrice || 0, taxRate: prod.taxRate || 0 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const lines = items.map(i => ({ item: i, ...calcLine(i) }))
  const subtotal  = lines.reduce((s, l) => s + l.subtotal, 0)
  const taxAmount = lines.reduce((s, l) => s + l.taxAmount, 0)
  const grandTotal = subtotal + taxAmount + (Number(form.shippingCost) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.warehouse) { toast.error('Select a warehouse'); return }
    if (!items.length)   { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await purchaseApi.create({
        warehouse: form.warehouse,
        supplier: form.supplier || null,
        voucherType: form.voucherType || null,
        documentType: 'purchase_order',
        purchaseType: form.purchaseType,
        shippingCost: Number(form.shippingCost) || 0,
        note: form.note,
        subtotal, taxAmount, grandTotal,
        items: lines.map(({ item, taxAmount, total }) => ({
          product: item.productId, name: item.name, sku: item.sku,
          quantity: item.quantity, unitCost: item.unitCost,
          taxRate: item.taxRate, taxAmount, total,
        })),
      })
      toast.success('Purchase order created!')
      navigate('/purchases/orders')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/purchases/orders')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="page-title">New Purchase Order</h1><p className="page-subtitle">Create a purchase order for a supplier</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4" />Save Purchase Order</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Order Items</h3>
            <select className="input" onChange={e => { if (e.target.value) addItem(e.target.value); e.target.value = '' }}>
              <option value="">-- Select product to add --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>)}
            </select>
            {items.length > 0 ? (
              <table className="tbl">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Tax %</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {lines.map(({ item, total }) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td><input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value) || 1)} className="input input-sm w-16 text-center font-bold" /></td>
                      <td><input type="number" min="0" step="0.01" value={item.unitCost} onChange={e => updateItem(item.id, 'unitCost', Number(e.target.value) || 0)} className="input input-sm w-24 font-bold" /></td>
                      <td><input type="number" min="0" step="0.01" value={item.taxRate} onChange={e => updateItem(item.id, 'taxRate', Number(e.target.value) || 0)} className="input input-sm w-16 font-bold" /></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(total)}</td>
                      <td><button type="button" onClick={() => removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-3 text-right font-bold text-sm">Grand Total:</td>
                    <td className="px-4 py-3 font-black text-primary-600">{formatCurrency(grandTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Select products above to add to order</p>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="card grid grid-cols-2 gap-4">
              <Input label="Shipping Cost" type="number" min="0" step="0.01" value={form.shippingCost} onChange={e => setForm({ ...form, shippingCost: Number(e.target.value) || 0 })} />
              <div />
              <div className="form-group col-span-2">
                <label className="label">Notes</label>
                <textarea rows={2} className="input resize-none" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Order Details</h3>
            <Select label="Warehouse *" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} options={warehouses.map(w => ({ value: w._id, label: w.name }))} placeholder="Select warehouse" />
            <Select label="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} options={suppliers.map(s => ({ value: s._id, label: s.name }))} placeholder="Select supplier" />
            <Select label="Purchase Type" value={form.purchaseType} onChange={e => setForm({ ...form, purchaseType: e.target.value })}
              options={[{ value: 'regular', label: 'Regular' }, { value: 'expense', label: 'Expense' }]} />
            <Select label="Voucher Type" value={form.voucherType} onChange={e => setForm({ ...form, voucherType: e.target.value })}
              options={voucherTypes.map(v => ({ value: v._id, label: v.name }))} placeholder="Default" />
          </div>
          {items.length > 0 && (
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{items.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Tax</span><span className="font-bold">{formatCurrency(taxAmount)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Shipping</span><span className="font-bold">{formatCurrency(Number(form.shippingCost) || 0)}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2"><span>Grand Total</span><span className="text-primary-600">{formatCurrency(grandTotal)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
