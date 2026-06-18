import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Pagination, ConfirmDialog, Badge, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { salesOrderApi } from '@/api'
import { DEFAULT_PAGINATION } from '@/constants/modules'
import toast from 'react-hot-toast'

interface SalesOrder {
  _id: string; orderNo: string
  customer?: { _id: string; name: string }
  warehouse?: { _id: string; name: string }
  voucherType?: { _id: string; name: string }
  saleType: string; grandTotal: number; status: string
  items: any[]; createdAt: string
}

export default function SalesOrderPage() {
  const [data, setData]         = useState<SalesOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await salesOrderApi.getAll({ page, limit: DEFAULT_PAGINATION.limit })
      setData(res.data.data || [])
      setMeta({ total: res.data.total ?? 0, totalPages: res.data.pages ?? 1 })
    } catch {
      toast.error('Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await salesOrderApi.delete(deleteId)
      toast.success('Sales order deleted')
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<SalesOrder>[] = [
    { label: 'Order #',    render: row => <span className="font-mono font-bold text-primary-600 text-xs">{row.orderNo}</span> },
    { label: 'Customer',   render: row => <span className="text-xs text-slate-500">{row.customer?.name || 'Walk-in'}</span> },
    { label: 'Warehouse',  render: row => <span className="text-xs text-slate-500">{row.warehouse?.name || '—'}</span> },
    { label: 'Type',       render: row => <span className="text-xs capitalize text-slate-500">{row.saleType}</span> },
    { label: 'Voucher',    render: row => <span className="text-xs text-slate-400">{row.voucherType?.name || '—'}</span> },
    { label: 'Items',      render: row => <span className="badge-blue">{row.items.length}</span> },
    { label: 'Total',      render: row => <span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label: 'Status',     render: row => <Badge status={row.status} /> },
    { label: 'Date',       render: row => <span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label: 'Actions',    render: row => (
      <div className="flex gap-1">
        <button onClick={() => window.open(`/sales/orders/${row._id}/print`, '_blank')}
          className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Sales Order">
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
        <div><h1 className="page-title">Sales Orders</h1><p className="page-subtitle">{meta.total} orders</p></div>
        <Link to="/sales/orders/create"><Button><HiOutlinePlus className="w-4 h-4" />New Sales Order</Button></Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search orders…" />
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No sales orders found" />
        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={DEFAULT_PAGINATION.limit} onChange={setPage} />
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Sales Order" message="Delete this sales order?" loading={deleting} />
    </div>
  )
}
