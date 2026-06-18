import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input, type TableColumn } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineArchive } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { adjustmentApi, warehouseApi, productApi } from '@/api'
import toast from 'react-hot-toast'

interface ProductOpt { _id:string; name:string; sku:string; purchasePrice:number }
type Item = { id:string; productId:string; name:string; sku:string; type:'addition'|'subtraction'; quantity:number; unitCost:number }

export default function AddAdjustmentPage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<{_id:string;name:string}[]>([])
  const [products, setProducts]     = useState<ProductOpt[]>([])
  const [form, setForm]   = useState({ warehouse:'', reason:'', note:'' })
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [whRes, prodRes] = await Promise.all([
          warehouseApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 1000 }),
        ])
        const whs = whRes.data.data || []
        setWarehouses(whs)
        setProducts(prodRes.data.data || [])
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
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku, type: 'addition', quantity: 1, unitCost: prod.purchasePrice || 0 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem  = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.warehouse) { toast.error('Select a warehouse'); return }
    if (!items.length)   { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await adjustmentApi.create({
        warehouse: form.warehouse,
        reason: form.reason,
        note: form.note,
        items: items.map(i => ({ product: i.productId, name: i.name, sku: i.sku, type: i.type, quantity: i.quantity, unitCost: i.unitCost })),
      })
      toast.success('Adjustment created!')
      navigate('/adjustments')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create adjustment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>navigate('/adjustments')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div><h1 className="page-title">New Stock Adjustment</h1><p className="page-subtitle">Add or remove stock quantities</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4"/>Save Adjustment</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Add Products</h3>
            <select className="input" onChange={e=>{if(e.target.value)addItem(e.target.value);e.target.value=''}}>
              <option value="">-- Select product to add --</option>
              {products.map(p=><option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
            {items.length>0?(
              <table className="tbl">
                <thead><tr><th>Product</th><th>SKU</th><th>Type</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td className="font-mono text-xs text-slate-400">{item.sku}</td>
                      <td>
                        <select className="input input-sm" value={item.type} onChange={e=>updateItem(item.id,'type',e.target.value)}>
                          <option value="addition">Addition (+)</option>
                          <option value="subtraction">Subtraction (-)</option>
                        </select>
                      </td>
                      <td><input type="number" min="1" value={item.quantity} onChange={e=>updateItem(item.id,'quantity',Number(e.target.value)||1)} className="input input-sm w-16 text-center font-bold"/></td>
                      <td><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span><input type="number" min="0" step="0.01" value={item.unitCost} onChange={e=>updateItem(item.id,'unitCost',Number(e.target.value)||0)} className="input input-sm pl-5 w-24 font-bold"/></div></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(item.quantity*item.unitCost)}</td>
                      <td><button type="button" onClick={()=>removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5"/></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-sm">Total Amount:</td>
                    <td className="px-4 py-3 font-black text-primary-600">{formatCurrency(totalAmount)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            ):(
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineArchive className="w-8 h-8 text-slate-300 mb-2"/>
                <p className="text-sm text-slate-400">Select products above to adjust stock</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Adjustment Details</h3>
            <Select label="Warehouse *" value={form.warehouse} onChange={e=>setForm({...form,warehouse:e.target.value})} options={warehouses.map(w=>({value:w._id,label:w.name}))} placeholder="Select warehouse"/>
            <Input label="Reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="e.g. Stock count correction"/>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea rows={2} className="input resize-none" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
            </div>
          </div>
          {items.length>0&&(
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{items.length}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2"><span>Total Amount</span><span className="text-primary-600">{formatCurrency(totalAmount)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
