import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, ConfirmDialog, Modal, type TableColumn } from '@/components/common'
import { HiOutlinePlay, HiOutlineTrash, HiOutlineEye, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import { holdApi } from '@/api'
import toast from 'react-hot-toast'

interface HoldItem { product?:string; name:string; sku:string; quantity:number; unitPrice:number; taxRate:number }
interface Hold {
  _id:string; holdNo:string
  warehouse?:{_id:string;name:string}; customer?:{_id:string;name:string}
  items:HoldItem[]; discount:number; discountType:'fixed'|'percent'; note:string
  createdAt:string
}

const holdTotal = (hold: Hold) => {
  const subtotal = hold.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0)
  const discAmt = hold.discountType==='percent' ? (subtotal*hold.discount)/100 : hold.discount
  return Math.max(0, subtotal-discAmt)
}

export default function HoldsPage() {
  const navigate = useNavigate()
  const [data, setData]         = useState<Hold[]>([])
  const [loading, setLoading]   = useState(true)
  const [viewing, setViewing]   = useState<Hold|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await holdApi.getAll()
      setData(res.data.data || [])
    } catch {
      toast.error('Failed to load held sales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await holdApi.delete(deleteId)
      toast.success('Held sale removed')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Hold>[] = [
    { label:'Hold #',      render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.holdNo}</span> },
    { label:'Warehouse',   render:row=><span className="text-xs text-slate-500">{row.warehouse?.name||'—'}</span> },
    { label:'Customer',    render:row=><span className="text-xs text-slate-500">{row.customer?.name||'Walk-in'}</span> },
    { label:'Items',       render:row=><span className="badge-blue">{row.items.length}</span> },
    { label:'Total',       render:row=><span className="font-bold text-sm">{formatCurrency(holdTotal(row))}</span> },
    { label:'Held At',     render:row=><span className="text-slate-400 text-xs">{formatDateTime(row.createdAt)}</span> },
    { label:'Actions',     render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>setViewing(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>navigate('/pos', { state: { resumeHold: row } })} className="btn-icon text-emerald-500 hover:bg-emerald-50" title="Resume Sale">
          <HiOutlinePlay className="w-3.5 h-3.5"/>
        </button>
        <button onClick={()=>window.open(`/holds/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Hold Receipt"><HiOutlinePrinter className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Held Sales</h1><p className="page-subtitle">{data.length} carts on hold</p></div>
        <Button onClick={()=>navigate('/pos')}><HiOutlinePlay className="w-4 h-4"/>Go to POS</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <Table columns={columns} data={data} loading={loading} emptyMsg="No held sales"/>
      </div>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={`Held Sale ${viewing?.holdNo||''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Warehouse: </span><span className="font-semibold">{viewing.warehouse?.name||'—'}</span></div>
              <div><span className="text-slate-400">Customer: </span><span className="font-semibold">{viewing.customer?.name||'Walk-in'}</span></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {viewing.items.map((it,i)=>(
                  <tr key={i}>
                    <td><p className="font-semibold text-xs">{it.name}</p><p className="text-[10px] font-mono text-slate-400">{it.sku}</p></td>
                    <td className="font-bold">{it.quantity}</td>
                    <td>{formatCurrency(it.unitPrice)}</td>
                    <td className="font-bold text-primary-600">{formatCurrency(it.quantity*it.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2">
              <span>Total</span><span className="text-primary-600">{formatCurrency(holdTotal(viewing))}</span>
            </div>
            {viewing.note && <p className="text-xs text-slate-500">Note: {viewing.note}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Held Sale" message="Remove this held sale? It cannot be recovered." loading={deleting}/>
    </div>
  )
}
