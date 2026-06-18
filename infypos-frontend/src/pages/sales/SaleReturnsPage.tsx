import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Modal, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { saleReturnApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface ReturnItem { product:string; name:string; sku:string; quantity:number; unitPrice:number; total:number }
interface SaleReturn {
  _id:string; referenceNo:string
  sale?:{_id:string;invoiceNo:string}; customer?:{_id:string;name:string}; warehouse?:{_id:string;name:string}
  items:ReturnItem[]; totalAmount:number; reason:string; note:string
  createdBy?:{name:string}; createdAt:string
}

export default function SaleReturnsPage() {
  const [data, setData]         = useState<SaleReturn[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [viewing, setViewing]   = useState<SaleReturn|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await saleReturnApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load sale returns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await saleReturnApi.delete(deleteId)
      toast.success('Sale return deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<SaleReturn>[] = [
    { label:'Reference #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.referenceNo}</span> },
    { label:'Customer',    render:row=><span className="text-xs text-slate-500">{row.customer?.name||'Walk-in'}</span> },
    { label:'Warehouse',   render:row=><span className="text-xs text-slate-500">{row.warehouse?.name||'—'}</span> },
    { label:'Items',       render:row=><span className="badge-blue">{row.items.length}</span> },
    { label:'Total',       render:row=><span className="font-bold text-sm">{formatCurrency(row.totalAmount)}</span> },
    { label:'Reason',      render:row=><span className="text-xs text-slate-500">{row.reason||'—'}</span> },
    { label:'Created By',  render:row=><span className="text-xs text-slate-400">{row.createdBy?.name||'—'}</span> },
    { label:'Date',        render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',     render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>setViewing(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>window.open(`/sale-return/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Credit Note"><HiOutlinePrinter className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Sale Returns</h1><p className="page-subtitle">{meta.total} sale returns</p></div>
        <Link to="/sale-return/create"><Button><HiOutlinePlus className="w-4 h-4"/>New Sale Return</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={(v)=>{setSearch(v);setPage(1)}} placeholder="Search by reference…"/>
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No sale returns found"/>
        <Pagination page={page} totalPages={Math.max(1,meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage}/>
      </div>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={`Sale Return ${viewing?.referenceNo||''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Customer: </span><span className="font-semibold">{viewing.customer?.name||'Walk-in'}</span></div>
              <div><span className="text-slate-400">Warehouse: </span><span className="font-semibold">{viewing.warehouse?.name||'—'}</span></div>
              {viewing.sale && <div><span className="text-slate-400">Original Sale: </span><span className="font-mono font-semibold text-primary-600">{viewing.sale.invoiceNo}</span></div>}
              <div><span className="text-slate-400">Reason: </span><span className="font-semibold">{viewing.reason||'—'}</span></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {viewing.items.map((it,i)=>(
                  <tr key={i}>
                    <td><p className="font-semibold text-xs">{it.name}</p><p className="text-[10px] font-mono text-slate-400">{it.sku}</p></td>
                    <td className="font-bold">{it.quantity}</td>
                    <td>{formatCurrency(it.unitPrice)}</td>
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
        title="Delete Sale Return" message="Delete this sale return? Stock changes will be reversed." loading={deleting}/>
    </div>
  )
}
