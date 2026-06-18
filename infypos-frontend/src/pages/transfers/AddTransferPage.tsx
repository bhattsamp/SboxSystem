import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, type TableColumn } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { transferApi, warehouseApi, productApi } from '@/api'
import toast from 'react-hot-toast'

interface ProductOpt { _id:string; name:string; sku:string }
type Item = { id:string; productId:string; name:string; sku:string; quantity:number }

export default function AddTransferPage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<{_id:string;name:string}[]>([])
  const [products, setProducts]     = useState<ProductOpt[]>([])
  const [form, setForm]   = useState({ fromWarehouse:'', toWarehouse:'', note:'' })
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
        if (whs.length > 1) setForm(f => ({ ...f, fromWarehouse: whs[0]._id, toWarehouse: whs[1]._id }))
        else if (whs.length) setForm(f => ({ ...f, fromWarehouse: whs[0]._id }))
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
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku, quantity: 1 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem  = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fromWarehouse || !form.toWarehouse) { toast.error('Select both warehouses'); return }
    if (form.fromWarehouse === form.toWarehouse) { toast.error('From and To warehouses must be different'); return }
    if (!items.length) { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await transferApi.create({
        fromWarehouse: form.fromWarehouse,
        toWarehouse: form.toWarehouse,
        note: form.note,
        items: items.map(i => ({ product: i.productId, name: i.name, sku: i.sku, quantity: i.quantity })),
      })
      toast.success('Transfer created!')
      navigate('/transfers')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create transfer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>navigate('/transfers')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div><h1 className="page-title">New Stock Transfer</h1><p className="page-subtitle">Move stock between warehouses</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4"/>Save Transfer</Button>
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
                <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th></th></tr></thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td className="font-mono text-xs text-slate-400">{item.sku}</td>
                      <td><input type="number" min="1" value={item.quantity} onChange={e=>updateItem(item.id,'quantity',Number(e.target.value)||1)} className="input input-sm w-20 text-center font-bold"/></td>
                      <td><button type="button" onClick={()=>removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ):(
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineSwitchHorizontal className="w-8 h-8 text-slate-300 mb-2"/>
                <p className="text-sm text-slate-400">Select products above to transfer</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Transfer Details</h3>
            <Select label="From Warehouse *" value={form.fromWarehouse} onChange={e=>setForm({...form,fromWarehouse:e.target.value})} options={warehouses.map(w=>({value:w._id,label:w.name}))} placeholder="Select warehouse"/>
            <Select label="To Warehouse *" value={form.toWarehouse} onChange={e=>setForm({...form,toWarehouse:e.target.value})} options={warehouses.map(w=>({value:w._id,label:w.name}))} placeholder="Select warehouse"/>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea rows={2} className="input resize-none" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
            </div>
          </div>
          {items.length>0&&(
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{items.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Total Qty</span><span className="font-bold">{items.reduce((s,i)=>s+i.quantity,0)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
