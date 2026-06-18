import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input, type TableColumn } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineReceiptRefund } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { saleReturnApi, salesApi } from '@/api'
import toast from 'react-hot-toast'

interface SaleOpt { _id:string; invoiceNo:string; customer?:{_id:string;name:string} }
interface SaleItem { product:string; name:string; sku:string; quantity:number; unitPrice:number }
interface SaleDetail { _id:string; invoiceNo:string; customer?:{_id:string;name:string}; warehouse:{_id:string;name:string}; items:SaleItem[] }
type ReturnItem = SaleItem & { maxQty:number; returnQty:number }

export default function AddSaleReturnPage() {
  const navigate = useNavigate()
  const [sales, setSales]   = useState<SaleOpt[]>([])
  const [saleId, setSaleId] = useState('')
  const [sale, setSale]     = useState<SaleDetail|null>(null)
  const [items, setItems]   = useState<ReturnItem[]>([])
  const [reason, setReason] = useState('')
  const [note, setNote]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [loadingSale, setLoadingSale] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await salesApi.getAll({ limit: 100 })
        setSales(res.data.data || [])
      } catch {
        toast.error('Failed to load sales')
      }
    })()
  }, [])

  const handleSelectSale = async (id: string) => {
    setSaleId(id)
    setSale(null)
    setItems([])
    if (!id) return
    setLoadingSale(true)
    try {
      const res = await salesApi.getById(id)
      const s: SaleDetail = res.data.data
      setSale(s)
      setItems(s.items.map(i => ({ ...i, maxQty: i.quantity, returnQty: 0 })))
    } catch {
      toast.error('Failed to load sale details')
    } finally {
      setLoadingSale(false)
    }
  }

  const updateQty = (sku: string, value: number) => setItems(prev => prev.map(i =>
    i.sku === sku ? { ...i, returnQty: Math.max(0, Math.min(i.maxQty, value)) } : i
  ))

  const selected = items.filter(i => i.returnQty > 0)
  const totalAmount = selected.reduce((s, i) => s + i.returnQty * i.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sale) { toast.error('Select a sale invoice'); return }
    if (!selected.length) { toast.error('Set a return quantity for at least one item'); return }
    setLoading(true)
    try {
      await saleReturnApi.create({
        sale: sale._id,
        customer: sale.customer?._id || null,
        warehouse: sale.warehouse._id,
        reason, note,
        items: selected.map(i => ({ product: i.product, name: i.name, sku: i.sku, quantity: i.returnQty, unitPrice: i.unitPrice, total: i.returnQty * i.unitPrice })),
      })
      toast.success('Sale return created!')
      navigate('/sale-return')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sale return')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>navigate('/sale-return')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div><h1 className="page-title">New Sale Return</h1><p className="page-subtitle">Return items from a sale invoice back into stock</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4"/>Save Return</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Select Sale Invoice</h3>
            <Select value={saleId} onChange={e=>handleSelectSale(e.target.value)}
              options={sales.map(s=>({value:s._id,label:`${s.invoiceNo} — ${s.customer?.name||'Walk-in Customer'}`}))}
              placeholder="-- Select a sale invoice --"/>
          </div>

          {loadingSale && <div className="card text-center text-sm text-slate-400 py-6">Loading sale items…</div>}

          {sale && (
            <div className="card space-y-4">
              <h3 className="section-title border-b border-slate-100 pb-3">Items</h3>
              <table className="tbl">
                <thead><tr><th>Product</th><th>SKU</th><th>Sold Qty</th><th>Unit Price</th><th>Return Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.sku}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td className="font-mono text-xs text-slate-400">{item.sku}</td>
                      <td className="text-xs">{item.maxQty}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td><input type="number" min="0" max={item.maxQty} value={item.returnQty} onChange={e=>updateQty(item.sku,Number(e.target.value)||0)} className="input input-sm w-20 text-center font-bold"/></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(item.returnQty*item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-sm">Total Return Amount:</td>
                    <td className="px-4 py-3 font-black text-primary-600">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {!sale && !loadingSale && (
            <div className="card flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200">
              <HiOutlineReceiptRefund className="w-8 h-8 text-slate-300 mb-2"/>
              <p className="text-sm text-slate-400">Select a sale invoice above to view its items</p>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Return Details</h3>
            <Input label="Reason" value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Customer changed mind"/>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea rows={2} className="input resize-none" value={note} onChange={e=>setNote(e.target.value)}/>
            </div>
            {sale && (
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-semibold">{sale.customer?.name||'Walk-in'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Warehouse</span><span className="font-semibold">{sale.warehouse?.name||'—'}</span></div>
              </div>
            )}
          </div>
          {selected.length>0&&(
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{selected.length}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2"><span>Total Amount</span><span className="text-primary-600">{formatCurrency(totalAmount)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
