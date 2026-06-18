import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Table, SearchBox, Badge, Pagination, ConfirmDialog, StatCard, Modal, Input, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlinePrinter, HiOutlineCurrencyDollar,
  HiOutlineReceiptRefund, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineUserGroup } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/date'
import toast from 'react-hot-toast'

const SALES = [
  { _id:'1', invoiceNo:'INV-001024', customer:'John Doe',        warehouse:'Main Warehouse', grandTotal:285,   paidAmount:285,   dueAmount:0,    paymentStatus:'paid',    status:'completed', paymentMethod:'cash', items:3, createdAt:'2024-01-20T10:30:00Z' },
  { _id:'2', invoiceNo:'INV-001023', customer:'Jane Smith',       warehouse:'Main Warehouse', grandTotal:142.5, paidAmount:142.5, dueAmount:0,    paymentStatus:'paid',    status:'completed', paymentMethod:'card', items:2, createdAt:'2024-01-19T14:15:00Z' },
  { _id:'3', invoiceNo:'INV-001022', customer:'Walk-in Customer', warehouse:'Main Warehouse', grandTotal:67,    paidAmount:67,    dueAmount:0,    paymentStatus:'paid',    status:'completed', paymentMethod:'cash', items:1, createdAt:'2024-01-19T09:45:00Z' },
  { _id:'4', invoiceNo:'INV-001021', customer:'Robert Johnson',   warehouse:'Secondary Warehouse', grandTotal:412, paidAmount:200, dueAmount:212, paymentStatus:'partial', status:'completed', paymentMethod:'mixed', items:5, createdAt:'2024-01-18T16:00:00Z' },
  { _id:'5', invoiceNo:'INV-001020', customer:'Emily Davis',      warehouse:'Main Warehouse', grandTotal:99.99, paidAmount:0,     dueAmount:99.99,paymentStatus:'unpaid',  status:'pending',   paymentMethod:'cash', items:2, createdAt:'2024-01-18T11:20:00Z' },
  { _id:'6', invoiceNo:'INV-001019', customer:'Michael Chen',     warehouse:'Main Warehouse', grandTotal:550,   paidAmount:550,   dueAmount:0,    paymentStatus:'paid',    status:'completed', paymentMethod:'card', items:4, createdAt:'2024-01-17T08:10:00Z' },
]

// ── Sales List ─────────────────────────────────────────────────
export default function SalesListPage() {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const filtered = SALES.filter(s =>
    s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    s.customer.toLowerCase().includes(search.toLowerCase())
  )

  const totalSales    = SALES.reduce((s,r)=>s+r.grandTotal,0)
  const totalReceived = SALES.reduce((s,r)=>s+r.paidAmount,0)
  const totalDue      = SALES.reduce((s,r)=>s+r.dueAmount,0)

  const columns: TableColumn<typeof SALES[0]>[] = [
    { label:'Invoice #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.invoiceNo}</span> },
    { label:'Customer',  key:'customer' },
    { label:'Warehouse', key:'warehouse', render:row=><span className="text-xs text-slate-500">{row.warehouse}</span> },
    { label:'Items',     render:row=><span className="badge-blue">{row.items}</span> },
    { label:'Total',     render:row=><span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label:'Paid',      render:row=><span className="text-emerald-600 font-semibold text-xs">{formatCurrency(row.paidAmount)}</span> },
    { label:'Due',       render:row=><span className={`font-semibold text-xs ${row.dueAmount>0?'text-red-500':'text-slate-400'}`}>{formatCurrency(row.dueAmount)}</span> },
    { label:'Payment',   render:row=><Badge status={row.paymentStatus}/> },
    { label:'Date',      render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',   render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>navigate(`/sales/${row._id}`)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>window.open(`/sales/${row._id}/print`, '_blank')} className="btn-icon text-slate-400 hover:bg-slate-50" title="Print Sales Invoice"><HiOutlinePrinter className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Sales</h1><p className="page-subtitle">{SALES.length} total sales</p></div>
        <Link to="/pos"><Button><HiOutlinePlus className="w-4 h-4"/>New Sale (POS)</Button></Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Sales"    value={formatCurrency(totalSales)}    icon={HiOutlineCurrencyDollar} color="blue"/>
        <StatCard title="Total Received" value={formatCurrency(totalReceived)} icon={HiOutlineReceiptRefund}  color="green"/>
        <StatCard title="Total Due"      value={formatCurrency(totalDue)}      icon={HiOutlineCurrencyDollar} color="red"/>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={setSearch} placeholder="Search invoice or customer…"/>
          <div className="flex gap-2">
            <select className="input py-2 w-36 text-sm"><option>All Status</option><option>Paid</option><option>Unpaid</option><option>Partial</option></select>
            <input type="date" className="input py-2 w-36 text-sm"/>
            <input type="date" className="input py-2 w-36 text-sm"/>
          </div>
        </div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={page} totalPages={Math.max(1,Math.ceil(filtered.length/15))} total={filtered.length} limit={15} onChange={setPage}/>
      </div>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)}
        onConfirm={async()=>{setDeleting(true);await new Promise(r=>setTimeout(r,600));toast.success('Sale deleted');setDeleteId(null);setDeleting(false)}}
        title="Delete Sale" message="Delete this sale? This will affect inventory stock levels." loading={deleting}/>
    </div>
  )
}

// ── Sale Detail ────────────────────────────────────────────────
const SALE_ITEMS = [
  { name:'Apple iPhone 15 Pro', sku:'APL-001', qty:1, price:999,   discount:0, taxRate:0, total:999   },
  { name:'Samsung Galaxy S24',  sku:'SAM-001', qty:1, price:799,   discount:0, taxRate:0, total:799   },
  { name:'Wireless Earbuds Pro',sku:'WEP-001', qty:2, price:149,   discount:0, taxRate:0, total:298   },
]

export function SalesDetailsPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const sale     = SALES.find(s=>s._id===id)||SALES[0]
  const subtotal = SALE_ITEMS.reduce((s,i)=>s+i.total,0)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/sales')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div>
            <h1 className="page-title">Sale Invoice</h1>
            <p className="page-subtitle font-mono">{sale.invoiceNo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><HiOutlinePrinter className="w-4 h-4"/>Print Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="section-title text-base">Order Items</h3>
              <Badge status={sale.status}/>
            </div>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
              <tbody>
                {SALE_ITEMS.map((item,i)=>(
                  <tr key={i}>
                    <td><div><p className="font-semibold text-xs">{item.name}</p><p className="text-[10px] font-mono text-slate-400">{item.sku}</p></div></td>
                    <td className="font-semibold">{item.qty}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td className="text-slate-400">{formatCurrency(item.discount)}</td>
                    <td className="font-bold text-primary-600">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card space-y-3">
            <h3 className="section-title text-base">Sale Details</h3>
            {[
              { label:'Customer',      value:sale.customer },
              { label:'Warehouse',     value:sale.warehouse },
              { label:'Date',          value:formatDateTime(sale.createdAt) },
              { label:'Payment Method',value:sale.paymentMethod.toUpperCase() },
            ].map(({label,value})=>(
              <div key={label} className="flex justify-between text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <div className="card space-y-2.5">
            <h3 className="section-title text-base">Payment Summary</h3>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Discount</span><span className="text-slate-400">$0.00</span></div>
            <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2">
              <span>Grand Total</span><span className="text-primary-600">{formatCurrency(sale.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Paid</span><span className="text-emerald-600 font-bold">{formatCurrency(sale.paidAmount)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Due</span><span className={`font-bold ${sale.dueAmount>0?'text-red-500':'text-slate-400'}`}>{formatCurrency(sale.dueAmount)}</span></div>
            <div className="pt-1"><Badge status={sale.paymentStatus}/></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Customers ──────────────────────────────────────────────────
const CUSTOMERS = [
  { _id:'1', name:'John Doe',       email:'john@example.com',   phone:'+1 555-0100', address:'New York, USA',    totalPurchased:2850,  outstanding:0,    isActive:true,  createdAt:'2024-01-01' },
  { _id:'2', name:'Jane Smith',     email:'jane@example.com',   phone:'+1 555-0200', address:'Los Angeles, USA', totalPurchased:1425,  outstanding:142.5,isActive:true,  createdAt:'2024-01-02' },
  { _id:'3', name:'Robert Johnson', email:'robert@example.com', phone:'+1 555-0300', address:'Chicago, USA',     totalPurchased:4120,  outstanding:412,  isActive:true,  createdAt:'2024-01-03' },
  { _id:'4', name:'Emily Davis',    email:'emily@example.com',  phone:'+1 555-0400', address:'Houston, USA',     totalPurchased:990,   outstanding:99.99,isActive:true,  createdAt:'2024-01-04' },
  { _id:'5', name:'Michael Chen',   email:'michael@example.com',phone:'+1 555-0500', address:'Seattle, USA',     totalPurchased:5500,  outstanding:0,    isActive:false, createdAt:'2024-01-05' },
]

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({name:'',email:'',phone:'',address:''})
  const [saving, setSaving] = useState(false)

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns: TableColumn<typeof CUSTOMERS[0]>[] = [
    { label:'Customer', render:row=>(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-700 font-bold text-xs">{row.name[0]}</span>
        </div>
        <div><p className="font-semibold text-xs">{row.name}</p><p className="text-[10px] text-slate-400">{row.email}</p></div>
      </div>
    )},
    { key:'phone', label:'Phone', render:row=><span className="text-xs">{row.phone}</span> },
    { key:'address', label:'Address', render:row=><span className="text-xs text-slate-500">{row.address}</span> },
    { label:'Total Purchased', render:row=><span className="font-bold text-xs text-primary-600">{formatCurrency(row.totalPurchased)}</span> },
    { label:'Outstanding', render:row=><span className={`font-bold text-xs ${row.outstanding>0?'text-red-500':'text-slate-400'}`}>{formatCurrency(row.outstanding)}</span> },
    { label:'Status', render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Actions', render:()=>(
      <div className="flex gap-1">
        <button className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5"/></button>
        <button className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  const handleSave = async () => {
    if(!form.name){toast.error('Name is required');return}
    setSaving(true)
    await new Promise(r=>setTimeout(r,600))
    toast.success('Customer added!')
    setOpen(false); setSaving(false); setForm({name:'',email:'',phone:'',address:''})
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{CUSTOMERS.length} registered customers</p>
        </div>
        <Button onClick={()=>setOpen(true)}><HiOutlinePlus className="w-4 h-4"/>Add Customer</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100"><SearchBox value={search} onChange={setSearch} placeholder="Search customers…"/></div>
        <Table columns={columns} data={filtered} emptyMsg="No customers found"/>
        <Pagination page={1} totalPages={1} total={filtered.length} limit={15} onChange={()=>{}}/>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add Customer"
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save Customer</Button></>}>
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <Input label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        </div>
      </Modal>
    </div>
  )
}
