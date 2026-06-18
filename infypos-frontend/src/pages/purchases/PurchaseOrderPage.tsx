import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { purchaseApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface PurchaseOrder {
  _id: string; referenceNo: string
  supplier?: { _id: string; name: string }
  warehouse?: { _id: string; name: string }
  items: any[]; grandTotal: number; status: string
  paymentStatus: string; createdAt: string
}

export default function PurchaseOrderPage() {
  const [data, setData]         = useState<PurchaseOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await purchaseApi.getAll({ page, limit: DEFAULT_PAGINATION.limit, documentType: 'purchase_order' } as any)
      setData(res.data.data || [])
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch {
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await purchaseApi.delete(deleteId)
      toast.success('Purchase order deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<PurchaseOrder>[] = [
    { label: 'Reference #',  render: row => <span className="font-mono font-bold text-primary-600 text-xs">{row.referenceNo}</span> },
    { label: 'Supplier',     render: row => <span className="text-xs text-slate-500">{row.supplier?.name || '—'}</span> },
    { label: 'Warehouse',    render: row => <span className="text-xs text-slate-500">{row.warehouse?.name || '—'}</span> },
    { label: 'Items',        render: row => <span className="badge-blue">{row.items.length}</span> },
    { label: 'Total',        render: row => <span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label: 'Status',       render: row => <Badge status={row.status} /> },
    { label: 'Payment',      render: row => <Badge status={row.paymentStatus} /> },
    { label: 'Date',         render: row => <span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label: 'Actions',      render: row => (
      <div className="flex gap-1">
        <button onClick={() => window.open(`/purchases/orders/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Purchase Order">
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
        <div><h1 className="page-title">Purchase Orders</h1><p className="page-subtitle">{meta.total} orders</p></div>
        <Link to="/purchases/orders/create"><Button><HiOutlinePlus className="w-4 h-4" />New Purchase Order</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search purchase orders…" />
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No purchase orders found" />
        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage} />
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Purchase Order" message="Delete this purchase order?" loading={deleting} />
    </div>
  )
}
