import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineTruck } from 'react-icons/hi'
import { deliveryNoteApi, warehouseApi, productApi, customerApi, salesOrderApi } from '@/api'
import toast from 'react-hot-toast'

type DNItem = { id: string; productId: string; name: string; sku: string; orderedQty: number; deliveredQty: number }

export default function AddDeliveryNotePage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses]   = useState<{ _id: string; name: string }[]>([])
  const [customers, setCustomers]     = useState<{ _id: string; name: string }[]>([])
  const [products, setProducts]       = useState<{ _id: string; name: string; sku?: string }[]>([])
  const [salesOrders, setSalesOrders] = useState<{ _id: string; orderNo: string }[]>([])
  const [form, setForm] = useState({ warehouse: '', customer: '', salesOrder: '', deliveryDate: '', deliveryAddress: '', note: '' })
  const [items, setItems]   = useState<DNItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [whRes, custRes, prodRes, soRes] = await Promise.all([
          warehouseApi.getAll({ limit: 100 }),
          customerApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 1000 }),
          salesOrderApi.getAll({ limit: 100, status: 'confirmed' }),
        ])
        const whs = whRes.data.data || []
        setWarehouses(whs)
        setCustomers(custRes.data.data || [])
        setProducts(prodRes.data.data || [])
        setSalesOrders(soRes.data.data || [])
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
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku || '', orderedQty: 0, deliveredQty: 1 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.warehouse) { toast.error('Select a warehouse'); return }
    if (!items.length)   { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await deliveryNoteApi.create({
        warehouse: form.warehouse,
        customer: form.customer || null,
        salesOrder: form.salesOrder || null,
        deliveryDate: form.deliveryDate || new Date().toISOString(),
        deliveryAddress: form.deliveryAddress,
        note: form.note,
        items: items.map(i => ({ product: i.productId, name: i.name, sku: i.sku, orderedQty: i.orderedQty, deliveredQty: i.deliveredQty })),
      })
      toast.success('Delivery note created!')
      navigate('/sales/delivery-notes')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create delivery note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/sales/delivery-notes')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="page-title">New Delivery Note</h1><p className="page-subtitle">Record delivery of goods to customer</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4" />Save Delivery Note</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Items to Deliver</h3>
            <select className="input" onChange={e => { if (e.target.value) addItem(e.target.value); e.target.value = '' }}>
              <option value="">-- Select product to deliver --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>)}
            </select>
            {items.length > 0 ? (
              <table className="tbl">
                <thead><tr><th>Product</th><th>Ordered Qty</th><th>Delivered Qty</th><th></th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}<span className="font-mono text-[10px] text-slate-400 ml-1">{item.sku}</span></td>
                      <td><input type="number" min="0" value={item.orderedQty} onChange={e => updateItem(item.id, 'orderedQty', Number(e.target.value) || 0)} className="input input-sm w-20 text-center" /></td>
                      <td><input type="number" min="1" value={item.deliveredQty} onChange={e => updateItem(item.id, 'deliveredQty', Number(e.target.value) || 1)} className="input input-sm w-20 text-center font-bold" /></td>
                      <td><button type="button" onClick={() => removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineTruck className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Select products to deliver</p>
              </div>
            )}
          </div>
          <div className="card space-y-4">
            <Input label="Delivery Address" value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="Full delivery address" />
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea rows={2} className="input resize-none" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Delivery Details</h3>
            <Select label="Warehouse *" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} options={warehouses.map(w => ({ value: w._id, label: w.name }))} placeholder="Select warehouse" />
            <Select label="Customer" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} options={customers.map(c => ({ value: c._id, label: c.name }))} placeholder="Select customer" />
            <Select label="Sales Order" value={form.salesOrder} onChange={e => setForm({ ...form, salesOrder: e.target.value })} options={salesOrders.map(s => ({ value: s._id, label: s.orderNo }))} placeholder="Link to order (optional)" />
            <Input label="Delivery Date" type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} />
          </div>
        </div>
      </div>
    </form>
  )
}
