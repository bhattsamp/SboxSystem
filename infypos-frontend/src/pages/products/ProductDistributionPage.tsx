import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, SearchBox, Badge, Pagination, ConfirmDialog, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { productDistributionApi } from '@/api'

type Dist = {
  _id: string
  sku: string
  barcode: string
  barcodeSymbology: string
  purchasePrice: number
  salePrice: number
  mrp: number
  taxRate: number
  openingStock: number
  alternateUnit?: { _id: string; name: string; shortName: string }
  alternateUnitFactor?: number
  isActive: boolean
  createdAt: string
  product: { _id: string; name: string; image?: string; category?: { name: string }; brand?: { name: string }; unit?: { name: string; shortName: string } }
  warehouse: { _id: string; name: string }
  tax?: { name: string; rate: number }
}

export default function ProductDistributionPage() {
  const [data, setData]         = useState<Dist[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 })
  const [deleteTarget, setDeleteTarget] = useState<Dist | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productDistributionApi.getAll({ page, limit: 15, search })
      setData(res.data.data)
      setMeta({ total: res.data.meta?.total ?? 0, totalPages: res.data.meta?.totalPages ?? 1 })
    } catch { toast.error('Failed to load distributions') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productDistributionApi.delete(deleteTarget._id)
      toast.success('Distribution deleted')
      setDeleteTarget(null); fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally { setDeleting(false) }
  }

  const columns: TableColumn<Dist>[] = [
    { label: '#', render: (_row: Dist, i?: number) => <span className="text-slate-400 font-mono text-xs">{(page - 1) * 15 + (i ?? 0) + 1}</span> },
    { label: 'Product', render: row => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {row.product?.image
            ? <img src={`http://localhost:5000${row.product.image}`} alt="" className="w-full h-full object-cover" />
            : <HiOutlinePhotograph className="w-4 h-4 text-slate-400" />}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-xs">{row.product?.name}</p>
          <p className="text-[10px] font-mono text-slate-400">{row.sku}</p>
        </div>
      </div>
    )},
    { label: 'Warehouse', render: row => <span className="badge-blue text-xs">{row.warehouse?.name}</span> },
    { label: 'Barcode',   render: row => <span className="font-mono text-xs text-slate-500">{row.barcode || '—'}</span> },
    { label: 'Symbology', render: row => <span className="text-xs text-slate-500">{row.barcodeSymbology}</span> },
    { label: 'Cost',      render: row => <span className="font-semibold text-xs">{formatCurrency(row.purchasePrice)}</span> },
    { label: 'Price',     render: row => <span className="font-black text-xs text-primary-600">{formatCurrency(row.salePrice)}</span> },
    { label: 'Alt. Unit',  render: row => row.alternateUnit
      ? <div className="text-xs leading-tight">
          <span className="font-semibold text-indigo-600">{row.alternateUnit.shortName}</span>
          <span className="text-slate-400 ml-1">= {row.alternateUnitFactor} {row.product?.unit?.shortName || 'pcs'}</span>
        </div>
      : <span className="text-slate-300 text-xs">—</span>
    },
    { label: 'Tax',       render: row => <span className="text-xs text-slate-500">{row.taxRate ? `${row.taxRate}%` : '—'}</span> },
    { label: 'Status',    render: row => <Badge status={row.isActive ? 'active' : 'inactive'} /> },
    { label: 'Actions',   render: row => (
      <div className="flex items-center gap-1">
        <Link to={`/products/distribution/edit/${row._id}`} className="btn-icon text-blue-500 hover:bg-blue-50">
          <HiOutlinePencil className="w-3.5 h-3.5" />
        </Link>
        <button onClick={() => setDeleteTarget(row)} className="btn-icon text-red-400 hover:bg-red-50">
          <HiOutlineTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Distribution</h1>
          <p className="page-subtitle">{meta.total} distribution records</p>
        </div>
        <Link to="/products/distribution/create">
          <Button><HiOutlinePlus className="w-4 h-4" />Add Distribution</Button>
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by SKU…" />
        </div>
        <Table columns={columns} data={data} loading={loading} emptyMsg="No distribution records found" />
        <Pagination page={page} totalPages={Math.max(1, meta.totalPages)} total={meta.total} limit={15} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Distribution"
        message={`Delete distribution for "${deleteTarget?.product?.name}" at "${deleteTarget?.warehouse?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
