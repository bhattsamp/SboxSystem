import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Modal, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { purchaseReturnApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface ReturnItem { product:string; name:string; sku:string; quantity:number; unitCost:number; total:number }
interface PurchaseReturn {
  _id:string; referenceNo:string
  purchase?:{_id:string;referenceNo:string}; supplier?:{_id:string;name:string}; warehouse?:{_id:string;name:string}
  items:ReturnItem[]; totalAmount:number; reason:string; note:string
  createdBy?:{name:string}; createdAt:string
}

export default function PurchaseReturnsPage() {
  const [data, setData]         = useState<PurchaseReturn[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [viewing, setViewing]   = useState<PurchaseReturn|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await purchaseReturnApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load purchase returns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await purchaseReturnApi.delete(deleteId)
      toast.success('Purchase return deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<PurchaseReturn>[] = [
    { label:'Reference #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.referenceNo}</span> },
    { label:'Supplier',    render:row=><span className="text-xs text-slate-500">{row.supplier?.name||'—'}</span> },
    { label:'Warehouse',   render:row=><span className="text-xs text-slate-500">{row.warehouse?.name||'—'}</span> },
    { label:'Items',       render:row=><span className="badge-blue">{row.items.length}</span> },
    { label:'Total',       render:row=><span className="font-bold text-sm">{formatCurrency(row.totalAmount)}</span> },
    { label:'Reason',      render:row=><span className="text-xs text-slate-500">{row.reason||'—'}</span> },
    { label:'Created By',  render:row=><span className="text-xs text-slate-400">{row.createdBy?.name||'—'}</span> },
    { label:'Date',        render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',     render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>setViewing(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>window.open(`/purchase-return/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Debit Note"><HiOutlinePrinter className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Purchase Returns</h1><p className="page-subtitle">{meta.total} purchase returns</p></div>
        <Link to="/purchase-return/create"><Button><HiOutlinePlus className="w-4 h-4"/>New Purchase Return</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={(v)=>{setSearch(v);setPage(1)}} placeholder="Search by reference…"/>
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No purchase returns found"/>
        <Pagination page={page} totalPages={Math.max(1,meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage}/>
      </div>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={`Purchase Return ${viewing?.referenceNo||''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Supplier: </span><span className="font-semibold">{viewing.supplier?.name||'—'}</span></div>
              <div><span className="text-slate-400">Warehouse: </span><span className="font-semibold">{viewing.warehouse?.name||'—'}</span></div>
              {viewing.purchase && <div><span className="text-slate-400">Original Purchase: </span><span className="font-mono font-semibold text-primary-600">{viewing.purchase.referenceNo}</span></div>}
              <div><span className="text-slate-400">Reason: </span><span className="font-semibold">{viewing.reason||'—'}</span></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Total</th></tr></thead>
              <tbody>
                {viewing.items.map((it,i)=>(
                  <tr key={i}>
                    <td><p className="font-semibold text-xs">{it.name}</p><p className="text-[10px] font-mono text-slate-400">{it.sku}</p></td>
                    <td className="font-bold">{it.quantity}</td>
                    <td>{formatCurrency(it.unitCost)}</td>
                    <td className="font-bold text-primary-600">{formatCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {viewing.note && <p className="text-xs text-slate-500">Note: {viewing.note}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Purchase Return" message="Delete this purchase return? Stock changes will be reversed." loading={deleting}/>
    </div>
  )
}
