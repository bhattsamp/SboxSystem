import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Modal, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { quotationApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface QuotationItem { product:string; name:string; sku:string; quantity:number; unitPrice:number; discount:number; discountType:string; taxRate:number; taxAmount:number; subtotal:number; total:number }
interface Quotation {
  _id:string; quotationNo:string
  customer?:{_id:string;name:string}; warehouse?:{_id:string;name:string}
  items:QuotationItem[]; subtotal:number; discountAmount:number; taxAmount:number; shippingCost:number; grandTotal:number
  status:string; validUntil?:string; note:string; terms:string
  createdBy?:{name:string}; createdAt:string
}

export default function QuotationsPage() {
  const [data, setData]         = useState<Quotation[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [viewing, setViewing]   = useState<Quotation|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const [convertingId, setConvertingId] = useState<string|null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await quotationApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load quotations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await quotationApi.delete(deleteId)
      toast.success('Quotation deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleConvert = async (id: string) => {
    setConvertingId(id)
    try {
      await quotationApi.convert(id)
      toast.success('Quotation converted to sale!')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to convert')
    } finally {
      setConvertingId(null)
    }
  }

  const columns: TableColumn<Quotation>[] = [
    { label:'Quotation #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.quotationNo}</span> },
    { label:'Customer',    render:row=><span className="text-xs text-slate-500">{row.customer?.name||'Walk-in'}</span> },
    { label:'Warehouse',   render:row=><span className="text-xs text-slate-500">{row.warehouse?.name||'—'}</span> },
    { label:'Items',       render:row=><span className="badge-blue">{row.items.length}</span> },
    { label:'Total',       render:row=><span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label:'Status',      render:row=><Badge status={row.status}/> },
    { label:'Valid Until', render:row=><span className="text-xs text-slate-400">{row.validUntil?formatDate(row.validUntil):'—'}</span> },
    { label:'Date',        render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',     render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>setViewing(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        {row.status!=='converted' && (
          <button onClick={()=>handleConvert(row._id)} disabled={convertingId===row._id}
            className="btn-icon text-emerald-500 hover:bg-emerald-50" title="Convert to Sale">
            <HiOutlineSwitchHorizontal className="w-3.5 h-3.5"/>
          </button>
        )}
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Quotations</h1><p className="page-subtitle">{meta.total} quotations</p></div>
        <Link to="/quotations/create"><Button><HiOutlinePlus className="w-4 h-4"/>New Quotation</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={(v)=>{setSearch(v);setPage(1)}} placeholder="Search by quotation number…"/>
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No quotations found"/>
        <Pagination page={page} totalPages={Math.max(1,meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage}/>
      </div>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={`Quotation ${viewing?.quotationNo||''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Customer: </span><span className="font-semibold">{viewing.customer?.name||'Walk-in'}</span></div>
              <div><span className="text-slate-400">Warehouse: </span><span className="font-semibold">{viewing.warehouse?.name||'—'}</span></div>
              <div><span className="text-slate-400">Status: </span><Badge status={viewing.status}/></div>
              <div><span className="text-slate-400">Valid Until: </span><span className="font-semibold">{viewing.validUntil?formatDate(viewing.validUntil):'—'}</span></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead>
              <tbody>
                {viewing.items.map((it,i)=>(
                  <tr key={i}>
                    <td><p className="font-semibold text-xs">{it.name}</p><p className="text-[10px] font-mono text-slate-400">{it.sku}</p></td>
                    <td className="font-bold">{it.quantity}</td>
                    <td>{formatCurrency(it.unitPrice)}</td>
                    <td className="text-slate-400">{it.discountType==='percent'?`${it.discount}%`:formatCurrency(it.discount)}</td>
                    <td className="text-slate-400">{formatCurrency(it.taxAmount)}</td>
                    <td className="font-bold text-primary-600">{formatCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col items-end gap-1 text-xs">
              <div className="flex justify-between w-48"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{formatCurrency(viewing.subtotal)}</span></div>
              <div className="flex justify-between w-48"><span className="text-slate-500">Discount</span><span className="font-semibold">{formatCurrency(viewing.discountAmount)}</span></div>
              <div className="flex justify-between w-48"><span className="text-slate-500">Tax</span><span className="font-semibold">{formatCurrency(viewing.taxAmount)}</span></div>
              <div className="flex justify-between w-48"><span className="text-slate-500">Shipping</span><span className="font-semibold">{formatCurrency(viewing.shippingCost)}</span></div>
              <div className="flex justify-between w-48 text-sm font-black border-t border-slate-100 pt-1"><span>Grand Total</span><span className="text-primary-600">{formatCurrency(viewing.grandTotal)}</span></div>
            </div>
            {viewing.note && <p className="text-xs text-slate-500">Note: {viewing.note}</p>}
            {viewing.terms && <p className="text-xs text-slate-500">Terms: {viewing.terms}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Quotation" message="Delete this quotation?" loading={deleting}/>
    </div>
  )
}
