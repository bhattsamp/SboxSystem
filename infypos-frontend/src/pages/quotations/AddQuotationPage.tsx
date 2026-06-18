import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input, type TableColumn } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { quotationApi, warehouseApi, productApi, customerApi } from '@/api'
import toast from 'react-hot-toast'

interface ProductOpt { _id:string; name:string; sku:string; salePrice:number; taxRate?:number }
type Item = { id:string; productId:string; name:string; sku:string; quantity:number; unitPrice:number; discount:number; discountType:'fixed'|'percent'; taxRate:number }

const calcLine = (i: Item) => {
  const gross = i.quantity * i.unitPrice
  const discAmt = i.discountType === 'percent' ? (gross * i.discount) / 100 : i.discount
  const subtotal = Math.max(0, gross - discAmt)
  const taxAmount = (subtotal * i.taxRate) / 100
  return { subtotal, taxAmount, total: subtotal + taxAmount }
}

export default function AddQuotationPage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<{_id:string;name:string}[]>([])
  const [customers, setCustomers]   = useState<{_id:string;name:string}[]>([])
  const [products, setProducts]     = useState<ProductOpt[]>([])
  const [form, setForm]   = useState({ warehouse:'', customer:'', validUntil:'', shippingCost:0, discountAmount:0, note:'', terms:'' })
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [whRes, custRes, prodRes] = await Promise.all([
          warehouseApi.getAll({ limit: 100 }),
          customerApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 1000 }),
        ])
        const whs = whRes.data.data || []
        setWarehouses(whs)
        setCustomers(custRes.data.data || [])
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
      return [...prev, { id: Date.now().toString(), productId, name: prod.name, sku: prod.sku, quantity: 1, unitPrice: prod.salePrice || 0, discount: 0, discountType: 'fixed', taxRate: prod.taxRate || 0 }]
    })
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem  = (id: string, field: string, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const lines = items.map(i => ({ item: i, ...calcLine(i) }))
  const subtotal  = lines.reduce((s, l) => s + l.subtotal, 0)
  const taxAmount = lines.reduce((s, l) => s + l.taxAmount, 0)
  const grandTotal = subtotal + taxAmount + (Number(form.shippingCost) || 0) - (Number(form.discountAmount) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.warehouse) { toast.error('Select a warehouse'); return }
    if (!items.length)   { toast.error('Add at least one product'); return }
    setLoading(true)
    try {
      await quotationApi.create({
        warehouse: form.warehouse,
        customer: form.customer || null,
        validUntil: form.validUntil || null,
        shippingCost: Number(form.shippingCost) || 0,
        discountAmount: Number(form.discountAmount) || 0,
        note: form.note,
        terms: form.terms,
        items: lines.map(({ item, subtotal, taxAmount, total }) => ({
          product: item.productId, name: item.name, sku: item.sku,
          quantity: item.quantity, unitPrice: item.unitPrice,
          discount: item.discount, discountType: item.discountType,
          taxRate: item.taxRate, taxAmount, subtotal, total,
        })),
      })
      toast.success('Quotation created!')
      navigate('/quotations')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create quotation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>navigate('/quotations')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div><h1 className="page-title">New Quotation</h1><p className="page-subtitle">Create a price quote for a customer</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4"/>Save Quotation</Button>
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
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Type</th><th>Tax %</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {lines.map(({item,total})=>(
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td><input type="number" min="1" value={item.quantity} onChange={e=>updateItem(item.id,'quantity',Number(e.target.value)||1)} className="input input-sm w-16 text-center font-bold"/></td>
                      <td><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e=>updateItem(item.id,'unitPrice',Number(e.target.value)||0)} className="input input-sm pl-5 w-24 font-bold"/></div></td>
                      <td><input type="number" min="0" step="0.01" value={item.discount} onChange={e=>updateItem(item.id,'discount',Number(e.target.value)||0)} className="input input-sm w-20 font-bold"/></td>
                      <td>
                        <select className="input input-sm" value={item.discountType} onChange={e=>updateItem(item.id,'discountType',e.target.value)}>
                          <option value="fixed">Fixed</option>
                          <option value="percent">%</option>
                        </select>
                      </td>
                      <td><input type="number" min="0" step="0.01" value={item.taxRate} onChange={e=>updateItem(item.id,'taxRate',Number(e.target.value)||0)} className="input input-sm w-16 font-bold"/></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(total)}</td>
                      <td><button type="button" onClick={()=>removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5"/></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="px-4 py-3 text-right font-bold text-sm">Grand Total:</td>
                    <td className="px-4 py-3 font-black text-primary-600">{formatCurrency(grandTotal)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            ):(
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineDocumentText className="w-8 h-8 text-slate-300 mb-2"/>
                <p className="text-sm text-slate-400">Select products above to quote</p>
              </div>
            )}
          </div>
          {items.length>0&&(
            <div className="card grid grid-cols-2 gap-4">
              <Input label="Shipping Cost" type="number" min="0" step="0.01" value={form.shippingCost} onChange={e=>setForm({...form,shippingCost:Number(e.target.value)||0})}/>
              <Input label="Overall Discount" type="number" min="0" step="0.01" value={form.discountAmount} onChange={e=>setForm({...form,discountAmount:Number(e.target.value)||0})}/>
              <div className="form-group col-span-2">
                <label className="label">Notes</label>
                <textarea rows={2} className="input resize-none" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
              </div>
              <div className="form-group col-span-2">
                <label className="label">Terms &amp; Conditions</label>
                <textarea rows={2} className="input resize-none" value={form.terms} onChange={e=>setForm({...form,terms:e.target.value})}/>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Quotation Details</h3>
            <Select label="Warehouse *" value={form.warehouse} onChange={e=>setForm({...form,warehouse:e.target.value})} options={warehouses.map(w=>({value:w._id,label:w.name}))} placeholder="Select warehouse"/>
            <Select label="Customer" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} options={customers.map(c=>({value:c._id,label:c.name}))} placeholder="Walk-in customer"/>
            <Input label="Valid Until" type="date" value={form.validUntil} onChange={e=>setForm({...form,validUntil:e.target.value})}/>
          </div>
          {items.length>0&&(
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{items.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Tax</span><span className="font-bold">{formatCurrency(taxAmount)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Shipping</span><span className="font-bold">{formatCurrency(Number(form.shippingCost)||0)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Discount</span><span className="font-bold">-{formatCurrency(Number(form.discountAmount)||0)}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2"><span>Grand Total</span><span className="text-primary-600">{formatCurrency(grandTotal)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
