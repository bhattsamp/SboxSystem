import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheckCircle, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { grnApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface GRN {
  _id: string; grnNo: string
  supplier?: { _id: string; name: string }
  warehouse?: { _id: string; name: string }
  purchase?: { _id: string; referenceNo: string }
  items: any[]; grandTotal: number; status: string
  receivedDate: string; createdAt: string
}

export default function GRNPage() {
  const [data, setData]         = useState<GRN[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await grnApi.getAll({ page, limit: DEFAULT_PAGINATION.limit })
      setData(res.data.data || [])
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.pages ?? 1 })
    } catch {
      toast.error('Failed to load GRNs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await grnApi.delete(deleteId)
      toast.success('GRN deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleComplete = async (id: string) => {
    setCompletingId(id)
    try {
      await grnApi.complete(id)
      toast.success('GRN marked as complete — stock updated')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete GRN')
    } finally {
      setCompletingId(null)
    }
  }

  const columns: TableColumn<GRN>[] = [
    { label: 'GRN #',        render: row => <span className="font-mono font-bold text-primary-600 text-xs">{row.grnNo}</span> },
    { label: 'Supplier',     render: row => <span className="text-xs text-slate-500">{row.supplier?.name || '—'}</span> },
    { label: 'Warehouse',    render: row => <span className="text-xs text-slate-500">{row.warehouse?.name || '—'}</span> },
    { label: 'Purchase Ref', render: row => <span className="text-xs font-mono text-slate-400">{row.purchase?.referenceNo || '—'}</span> },
    { label: 'Items',        render: row => <span className="badge-blue">{row.items.length}</span> },
    { label: 'Total',        render: row => <span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label: 'Status',       render: row => <Badge status={row.status} /> },
    { label: 'Received',     render: row => <span className="text-xs text-slate-400">{formatDate(row.receivedDate)}</span> },
    { label: 'Actions',      render: row => (
      <div className="flex gap-1">
        {(row.status === 'draft' || row.status === 'partial') && (
          <button onClick={() => handleComplete(row._id)} disabled={completingId === row._id}
            className="btn-icon text-emerald-500 hover:bg-emerald-50" title="Mark Complete & Update Stock">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => window.open(`/purchases/grn/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print GRN">
          <HiOutlinePrinter className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50">
          <HiOutlineTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Goods Receipt Notes</h1><p className="page-subtitle">{meta.total} GRNs</p></div>
        <Link to="/purchases/grn/create"><Button><HiOutlinePlus className="w-4 h-4" />New GRN</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search GRNs…" />
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No goods receipt notes found" />
        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage} />
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete GRN" message="Delete this goods receipt note?" loading={deleting} />
    </div>
  )
}
