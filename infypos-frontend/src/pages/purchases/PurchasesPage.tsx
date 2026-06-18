import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Table, SearchBox, Badge, Pagination, ConfirmDialog, StatCard, Modal, Input, Select, Textarea, type TableColumn } from '@/components/common'
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlinePencil, HiOutlineCurrencyDollar,
  HiOutlineShoppingBag, HiOutlineArrowLeft, HiOutlineSave, HiOutlineX } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import toast from 'react-hot-toast'

const PURCHASES = [
  { _id:'1', referenceNo:'PO-00001', supplier:'TechWorld Suppliers', warehouse:'Main Warehouse', grandTotal:4250, paidAmount:4250, dueAmount:0,    paymentStatus:'paid',    status:'received', items:5, createdAt:'2024-01-15' },
  { _id:'2', referenceNo:'PO-00002', supplier:'Fashion Hub',          warehouse:'Main Warehouse', grandTotal:1800, paidAmount:1800, dueAmount:0,    paymentStatus:'paid',    status:'received', items:3, createdAt:'2024-01-16' },
  { _id:'3', referenceNo:'PO-00003', supplier:'Book World',           warehouse:'Main Warehouse', grandTotal:620,  paidAmount:300,  dueAmount:320,  paymentStatus:'partial', status:'received', items:8, createdAt:'2024-01-17' },
  { _id:'4', referenceNo:'PO-00004', supplier:'TechWorld Suppliers',  warehouse:'Secondary Warehouse', grandTotal:7200, paidAmount:0, dueAmount:7200, paymentStatus:'unpaid',  status:'ordered',  items:10,createdAt:'2024-01-18' },
]

// ── Purchases List ─────────────────────────────────────────────
export default function PurchasesPage() {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const filtered = PURCHASES.filter(p =>
    p.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase())
  )
  const totalPurchases = PURCHASES.reduce((s,r)=>s+r.grandTotal,0)
  const totalDue       = PURCHASES.reduce((s,r)=>s+r.dueAmount,0)

  const columns: TableColumn<typeof PURCHASES[0]>[] = [
    { label:'Ref #',     render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.referenceNo}</span> },
    { label:'Supplier',  key:'supplier' },
    { label:'Warehouse', key:'warehouse', render:row=><span className="text-xs text-slate-500">{row.warehouse}</span> },
    { label:'Items',     render:row=><span className="badge-blue">{row.items}</span> },
    { label:'Total',     render:row=><span className="font-bold text-sm">{formatCurrency(row.grandTotal)}</span> },
    { label:'Paid',      render:row=><span className="text-emerald-600 font-semibold text-xs">{formatCurrency(row.paidAmount)}</span> },
    { label:'Due',       render:row=><span className={`font-semibold text-xs ${row.dueAmount>0?'text-red-500':'text-slate-400'}`}>{formatCurrency(row.dueAmount)}</span> },
    { label:'Status',    render:row=><Badge status={row.status}/> },
    { label:'Date',      render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
    { label:'Actions',   render:row=>(
      <div className="flex gap-1">
        <button onClick={()=>navigate(`/purchases/${row._id}`)} className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlineEye className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Purchases</h1><p className="page-subtitle">{PURCHASES.length} total purchases</p></div>
        <Link to="/purchases/create"><Button><HiOutlinePlus className="w-4 h-4"/>New Purchase</Button></Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Purchases" value={formatCurrency(totalPurchases)} icon={HiOutlineShoppingBag}    color="blue"/>
        <StatCard title="Total Paid"      value={formatCurrency(totalPurchases-totalDue)} icon={HiOutlineCurrencyDollar} color="green"/>
        <StatCard title="Total Due"       value={formatCurrency(totalDue)}       icon={HiOutlineCurrencyDollar} color="red"/>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={setSearch} placeholder="Search by reference or supplier…"/>
          <select className="input py-2 w-36 text-sm"><option>All Status</option><option>Ordered</option><option>Received</option><option>Partial</option><option>Cancelled</option></select>
        </div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={page} totalPages={Math.max(1,Math.ceil(filtered.length/15))} total={filtered.length} limit={15} onChange={setPage}/>
      </div>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)}
        onConfirm={async()=>{setDeleting(true);await new Promise(r=>setTimeout(r,600));toast.success('Purchase deleted');setDeleteId(null);setDeleting(false)}}
        title="Delete Purchase" message="Delete this purchase record?" loading={deleting}/>
    </div>
  )
}

// ── Add Purchase ───────────────────────────────────────────────
const SUPPLIERS_OPTS = [{value:'1',label:'TechWorld Suppliers'},{value:'2',label:'Fashion Hub'},{value:'3',label:'Book World'}]
const PRODUCTS_OPTS  = [
  {value:'1',label:'Apple iPhone 15 Pro', sku:'APL-001',cost:750},
  {value:'2',label:'Samsung Galaxy S24',  sku:'SAM-001',cost:600},
  {value:'3',label:'Sony WH-1000XM5',     sku:'SNY-001',cost:250},
]
type PurchaseItem = {id:string;productId:string;name:string;sku:string;qty:number;cost:number}

export function AddPurchasePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({supplier:'',warehouse:'1',status:'ordered',note:''})
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(false)

  const addItem = (productId:string) => {
    const prod = PRODUCTS_OPTS.find(p=>p.value===productId)
    if(!prod) return
    setItems(prev=>{
      if(prev.find(i=>i.productId===productId)) return prev
      return [...prev,{id:Date.now().toString(),productId,name:prod.label,sku:prod.sku,qty:1,cost:prod.cost}]
    })
  }
  const removeItem = (id:string) => setItems(prev=>prev.filter(i=>i.id!==id))
  const updateItem = (id:string,field:string,value:any) => setItems(prev=>prev.map(i=>i.id===id?{...i,[field]:value}:i))
  const grandTotal = items.reduce((s,i)=>s+i.qty*i.cost,0)

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    if(!form.supplier){toast.error('Please select a supplier');return}
    if(!items.length){toast.error('Add at least one product');return}
    setLoading(true)
    await new Promise(r=>setTimeout(r,900))
    toast.success('Purchase order created!')
    navigate('/purchases')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={()=>navigate('/purchases')} className="btn-icon"><HiOutlineArrowLeft className="w-5 h-5"/></button>
          <div><h1 className="page-title">New Purchase Order</h1><p className="page-subtitle">Fill in purchase details below</p></div>
        </div>
        <Button type="submit" loading={loading}><HiOutlineSave className="w-4 h-4"/>Save Purchase</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Add products */}
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Add Products</h3>
            <div className="flex gap-3">
              <select className="input flex-1" onChange={e=>{if(e.target.value)addItem(e.target.value);e.target.value=''}}>
                <option value="">-- Select product to add --</option>
                {PRODUCTS_OPTS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {items.length>0?(
              <table className="tbl">
                <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.id}>
                      <td className="font-semibold text-xs">{item.name}</td>
                      <td className="font-mono text-xs text-slate-400">{item.sku}</td>
                      <td><input type="number" min="1" value={item.qty} onChange={e=>updateItem(item.id,'qty',Number(e.target.value)||1)} className="input input-sm w-16 text-center font-bold"/></td>
                      <td><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span><input type="number" min="0" step="0.01" value={item.cost} onChange={e=>updateItem(item.id,'cost',Number(e.target.value)||0)} className="input input-sm pl-5 w-24 font-bold"/></div></td>
                      <td className="font-bold text-xs text-primary-600">{formatCurrency(item.qty*item.cost)}</td>
                      <td><button type="button" onClick={()=>removeItem(item.id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineX className="w-3.5 h-3.5"/></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-3 text-right font-bold text-sm">Grand Total:</td>
                    <td className="px-4 py-3 font-black text-primary-600">{formatCurrency(grandTotal)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            ):(
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <HiOutlineShoppingBag className="w-8 h-8 text-slate-300 mb-2"/>
                <p className="text-sm text-slate-400">Select products above to add to this purchase</p>
              </div>
            )}
          </div>
          {items.length>0&&(
            <div className="card"><label className="label">Notes</label><textarea rows={2} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} className="input resize-none" placeholder="Optional notes for this purchase order…"/></div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Purchase Details</h3>
            <Select label="Supplier *" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} options={SUPPLIERS_OPTS} placeholder="Select supplier"/>
            <Select label="Warehouse *" value={form.warehouse} onChange={e=>setForm({...form,warehouse:e.target.value})} options={[{value:'1',label:'Main Warehouse'},{value:'2',label:'Secondary Warehouse'}]}/>
            <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} options={[{value:'ordered',label:'Ordered'},{value:'received',label:'Received'},{value:'partial',label:'Partially Received'}]}/>
          </div>
          {items.length>0&&(
            <div className="card space-y-2.5">
              <h3 className="section-title">Summary</h3>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{items.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Total Qty</span><span className="font-bold">{items.reduce((s,i)=>s+i.qty,0)}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-100 pt-2"><span>Grand Total</span><span className="text-primary-600">{formatCurrency(grandTotal)}</span></div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

// ── Suppliers ──────────────────────────────────────────────────
const SUPPLIERS_DATA = [
  { _id:'1', name:'TechWorld Suppliers', email:'tech@example.com',    phone:'+1 555-1000', address:'Silicon Valley, CA',  isActive:true,  createdAt:'2024-01-01' },
  { _id:'2', name:'Fashion Hub',          email:'fashion@example.com', phone:'+1 555-2000', address:'New York, NY',        isActive:true,  createdAt:'2024-01-02' },
  { _id:'3', name:'Book World',           email:'books@example.com',   phone:'+1 555-3000', address:'Boston, MA',          isActive:true,  createdAt:'2024-01-03' },
  { _id:'4', name:'Sports Direct',        email:'sports@example.com',  phone:'+1 555-4000', address:'Chicago, IL',         isActive:false, createdAt:'2024-01-04' },
]

export function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({name:'',email:'',phone:'',address:''})
  const [saving, setSaving] = useState(false)
  const filtered = SUPPLIERS_DATA.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()))

  const columns: TableColumn<typeof SUPPLIERS_DATA[0]>[] = [
    { label:'Supplier', render:row=>(
      <div><p className="font-semibold text-xs">{row.name}</p><p className="text-[10px] text-slate-400">{row.email}</p></div>
    )},
    { key:'phone',   label:'Phone',   render:row=><span className="text-xs">{row.phone}</span> },
    { key:'address', label:'Address', render:row=><span className="text-xs text-slate-500">{row.address}</span> },
    { label:'Status', render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Added',  render:row=><span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span> },
    { label:'Actions', render:()=>(
      <div className="flex gap-1">
        <button className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5"/></button>
        <button className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Suppliers</h1><p className="page-subtitle">{SUPPLIERS_DATA.length} suppliers</p></div>
        <Button onClick={()=>setOpen(true)}><HiOutlinePlus className="w-4 h-4"/>Add Supplier</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100"><SearchBox value={search} onChange={setSearch} placeholder="Search suppliers…"/></div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={1} totalPages={1} total={filtered.length} limit={15} onChange={()=>{}}/>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add Supplier"
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
        <Button onClick={async()=>{if(!form.name){toast.error('Name required');return}setSaving(true);await new Promise(r=>setTimeout(r,600));toast.success('Supplier added!');setOpen(false);setSaving(false)}} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Company Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <Input label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        </div>
      </Modal>
    </div>
  )
}
