import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Modal, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi'
import { formatDate } from '@/utils/date'
import { transferApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface TransferItem { product:string; name:string; sku:string; quantity:number }
interface Transfer {
  _id:string; referenceNo:string
  fromWarehouse?:{_id:string;name:string}; toWarehouse?:{_id:string;name:string}
  items:TransferItem[]; status:string; note:string
  createdBy?:{name:string}; createdAt:string
}

export default function TransfersPage() {
  const [data, setData]         = useState<Transfer[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [viewing, setViewing]   = useState<Transfer|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await transferApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, search })
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await transferApi.delete(deleteId)
      toast.success('Transfer deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Transfer>[] = [
    { label:'Reference #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.referenceNo}</span> },
    { label:'From',        render:row=><span className="text-xs text-slate-500">{row.fromWarehouse?.name||'—'}</span> },
    { label:'To',          render:row=><span className="text-xs text-slate-500">{row.toWarehouse?.name||'—'}</span> },
    { label:'Items',       render:row=><span className="badge-blue">{row.items.length}</span> },
    { label:'Status',      render:row=><Badge status={row.status}/> },
    { label:'Created By',  render:row=><span className="text-xs text-slate-400">{row.createdBy?.name||'—'}</span> },
    { label:'Date',        render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',     render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>setViewing(row)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Stock Transfers</h1><p className="page-subtitle">{meta.total} transfers</p></div>
        <Link to="/transfers/create"><Button><HiOutlinePlus className="w-4 h-4"/>New Transfer</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={(v)=>{setSearch(v);setPage(1)}} placeholder="Search by reference…"/>
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No transfers found"/>
        <Pagination page={page} totalPages={Math.max(1,meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage}/>
      </div>

      <Modal open={!!viewing} onClose={()=>setViewing(null)} title={`Transfer ${viewing?.referenceNo||''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">From: </span><span className="font-semibold">{viewing.fromWarehouse?.name||'—'}</span></div>
              <div><span className="text-slate-400">To: </span><span className="font-semibold">{viewing.toWarehouse?.name||'—'}</span></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th></tr></thead>
              <tbody>
                {viewing.items.map((it,i)=>(
                  <tr key={i}>
                    <td><p className="font-semibold text-xs">{it.name}</p><p className="text-[10px] font-mono text-slate-400">{it.sku}</p></td>
                    <td className="font-bold">{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {viewing.note && <p className="text-xs text-slate-500">Note: {viewing.note}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Transfer" message="Delete this transfer? Stock movement will be reversed." loading={deleting}/>
    </div>
  )
}
