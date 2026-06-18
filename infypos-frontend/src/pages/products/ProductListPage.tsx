import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi'
import { Table, Button, SearchBox, Badge, Pagination, ConfirmDialog, type TableColumn } from '@/components/common'
import { formatCurrency } from '@/utils/currency'
import toast from 'react-hot-toast'

const MOCK = [
  { _id:'1', name:'Apple iPhone 15 Pro',  sku:'APL-00123', category:{name:'Electronics'}, brand:{name:'Apple'},   purchasePrice:750,  salePrice:999,   alertQuantity:5,  isActive:true,  createdAt:'2024-01-15' },
  { _id:'2', name:'Samsung Galaxy S24',    sku:'SAM-00456', category:{name:'Electronics'}, brand:{name:'Samsung'}, purchasePrice:600,  salePrice:799,   alertQuantity:5,  isActive:true,  createdAt:'2024-01-16' },
  { _id:'3', name:'Sony WH-1000XM5',       sku:'SNY-00789', category:{name:'Electronics'}, brand:{name:'Sony'},    purchasePrice:250,  salePrice:349,   alertQuantity:3,  isActive:true,  createdAt:'2024-01-17' },
  { _id:'4', name:'Nike Air Max 270',       sku:'NK-00321',  category:{name:'Clothing'},    brand:{name:'Nike'},    purchasePrice:70,   salePrice:129,   alertQuantity:10, isActive:true,  createdAt:'2024-01-18' },
  { _id:'5', name:'The Alchemist',          sku:'BK-00654',  category:{name:'Books'},        brand:null,            purchasePrice:8,    salePrice:14.99, alertQuantity:5,  isActive:true,  createdAt:'2024-01-19' },
  { _id:'6', name:'Wireless Mouse Pro',     sku:'WM-00987',  category:{name:'Electronics'}, brand:null,            purchasePrice:30,   salePrice:59,    alertQuantity:10, isActive:false, createdAt:'2024-01-20' },
  { _id:'7', name:'Yoga Mat Premium',       sku:'YM-00111',  category:{name:'Others'},       brand:null,            purchasePrice:20,   salePrice:39,    alertQuantity:5,  isActive:true,  createdAt:'2024-01-21' },
  { _id:'8', name:'Dell XPS 15',            sku:'DEL-00222', category:{name:'Electronics'}, brand:{name:'Dell'},   purchasePrice:1200, salePrice:1499,  alertQuantity:2,  isActive:true,  createdAt:'2024-01-22' },
]

export default function ProductListPage() {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = MOCK.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    setDeleting(true)
    await new Promise(r=>setTimeout(r,700))
    toast.success('Product deleted')
    setDeleteId(null); setDeleting(false)
  }

  const columns: TableColumn<typeof MOCK[0]>[] = [
    { label:'#', render:(_,i)=><span className="text-slate-400 font-mono text-xs">{(i??0)+1}</span> } as any,
    { label:'Product', render:row=>(
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <HiOutlinePhotograph className="w-4 h-4 text-slate-400"/>
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-xs">{row.name}</p>
          <p className="text-[10px] font-mono text-slate-400">{row.sku}</p>
        </div>
      </div>
    )},
    { label:'Category', render:row=><span className="badge-blue text-xs">{row.category?.name}</span> },
    { label:'Brand',    render:row=><span className="text-xs text-slate-500">{row.brand?.name||'—'}</span> },
    { label:'Cost',     render:row=><span className="font-semibold text-xs">{formatCurrency(row.purchasePrice)}</span> },
    { label:'Price',    render:row=><span className="font-black text-xs text-primary-600">{formatCurrency(row.salePrice)}</span> },
    { label:'Alert',    render:row=><span className="font-mono text-xs">{row.alertQuantity}</span> },
    { label:'Status',   render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Actions',  render:row=>(
      <div className="flex items-center gap-1">
        <Link to={`/products/edit/${row._id}`} className="btn-icon text-blue-500 hover:bg-blue-50">
          <HiOutlinePencil className="w-3.5 h-3.5"/>
        </Link>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50">
          <HiOutlineTrash className="w-3.5 h-3.5"/>
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{MOCK.length} total products</p>
        </div>
        <Link to="/products/create"><Button><HiOutlinePlus className="w-4 h-4"/>Add Product</Button></Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={setSearch} placeholder="Search products…"/>
          <div className="flex gap-2">
            <select className="input py-2 w-40 text-sm"><option>All Categories</option><option>Electronics</option><option>Clothing</option><option>Books</option></select>
            <select className="input py-2 w-32 text-sm"><option>All Status</option><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <Table columns={columns} data={filtered} emptyMsg="No products found"/>
        <Pagination page={page} totalPages={Math.max(1,Math.ceil(filtered.length/15))} total={filtered.length} limit={15} onChange={setPage}/>
      </div>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Product" message="Are you sure you want to delete this product? This cannot be undone and will affect stock." loading={deleting}/>
    </div>
  )
}
