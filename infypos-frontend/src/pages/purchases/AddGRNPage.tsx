import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineClipboardList } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { grnApi, warehouseApi, productApi, purchaseApi } from '@/api'
import { supplierApi } from '@/api'
import toast from 'react-hot-toast'

type GRNItem = { id: string; productId: string; name: string; sku: string; orderedQty: number; receivedQty: number; unitCost: number }

export default function AddGRNPage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses]   = useState<{ _id: string; name: string }[]>([])
  const [suppliers, setSuppliers]     = useState<{ _id: string; name: string }[]>([])
  const [products, setProducts]       = useState<{ _id: string; name: string; sku?: string; purchasePrice?: number }[]>([])
  const [purchases, setPurchases]     = useState<{ _id: string; referenceNo: string }[]>([])
  const [form, setForm] = useState({ warehouse: '', supplier: '', purchase: '', receivedDate: '', note: '' })
  const [items, setItems]   = useState<GRNItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [whRes, supRes, prodRes, purRes] = await Promise.all([
          warehouseApi.getAll({ limit: 100 }),
          supplierApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 1000 }),
          purchaseApi.getAll({ limit: 100 }),
        ])
        const whs = whRes.data.data || []
        setWarehouses(whs)
        setSuppliers(supRes.data.data || [])
        setProducts(prodRes.data.data || [])
        setPurchases(purRes.data.data || [])
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
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku || '', orderedQty: 0, receivedQty: 1, unitCost: prod.purchasePrice || 0 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const grandTotal = items.reduce((s, i) => s + (i.receivedQty * i.unitCost), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.warehouse) { toast.error('Select a warehouse'); return }
    if (!items.length)   { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await grnApi.create({
        warehouse: form.warehouse,
        supplier: form.supplier || null,
        purchase: form.purchase || null,
        receivedDate: form.receivedDate || new Date().toISOString(),
        note: form.note,
        grandTotal,
        items: items.map(i => ({ product: i.productId, name: i.name, sku: i.sku, orderedQty: i.orderedQty, receivedQty: i.receivedQty, unitCost: i.unitCost, total: i.receivedQty * i.unitCost })),
      })
      toast.success('GRN created!')
      navigate('/purchases/grn')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create GRN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/purchases/grn')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="page-title">New Goods Receipt Note</h1><p className="page-subtitle">Record goods received from supplier</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4" />Save GRN</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Received Items</h3>
            <select className="input" onChange={e => { if (e.target.value) addItem(e.target.value); e.target.value = '' }}>
              <option value="">-- Select product received --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>)}
            </select>
            {items.length > 0 ? (
              <table className="tbl">
                <thead><tr><th>Product</th><th>Ordered Qty</th><th>Received Qty</th><th>Unit Cost</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}<span className="font-mono text-[10px] text-slate-400 ml-1">{item.sku}</span></td>
                      <td><input type="number" min="0" value={item.orderedQty} onChange={e => updateItem(item.id, 'orderedQty', Number(e.target.value) || 0)} className="input input-sm w-20 text-center" /></td>
                      <td><input type="number" min="1" value={item.receivedQty} onChange={e => updateItem(item.id, 'receivedQty', Number(e.target.value) || 1)} className="input input-sm w-20 text-center font-bold" /></td>
                      <td><input type="number" min="0" step="0.01" value={item.unitCost} onChange={e => updateItem(item.id, 'unitCost', Number(e.target.value) || 0)} className="input input-sm w-24 font-bold" /></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(item.receivedQty * item.unitCost)}</td>
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
                <HiOutlineClipboardList className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Select received products above</p>
              </div>
            )}
          </div>
          <div className="card">
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea rows={2} className="input resize-none" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Receipt Details</h3>
            <Select label="Warehouse *" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} options={warehouses.map(w => ({ value: w._id, label: w.name }))} placeholder="Select warehouse" />
            <Select label="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} options={suppliers.map(s => ({ value: s._id, label: s.name }))} placeholder="Select supplier" />
            <Select label="Purchase Ref" value={form.purchase} onChange={e => setForm({ ...form, purchase: e.target.value })} options={purchases.map(p => ({ value: p._id, label: p.referenceNo }))} placeholder="Link to purchase (optional)" />
            <Input label="Received Date" type="date" value={form.receivedDate} onChange={e => setForm({ ...form, receivedDate: e.target.value })} />
          </div>
        </div>
      </div>
    </form>
  )
}
