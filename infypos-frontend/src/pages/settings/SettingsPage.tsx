import React, { useState } from 'react'
import { Button, Input, Select, Table, SearchBox, Modal, Badge, Pagination, ConfirmDialog, type TableColumn } from '@/components/common'
import { HiOutlineSave, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { CURRENCIES } from '@/constants/modules'
import { ROLE_LABELS } from '@/constants/roles'

// ── App Settings ───────────────────────────────────────────────
export default function SettingsPage() {
  const [form, setForm] = useState({
    companyName:'SBox System Demo Store', email:'admin@sboxsystem.com', phone:'+1 555-0100',
    address:'123 Business St, New York, NY 10001', website:'https://sboxsystem.com',
    currency:'USD', timezone:'America/New_York', taxEnabled:true, defaultTaxRate:'10',
    lowStockAlert:'5', invoicePrefix:'INV', invoiceFooter:'Thank you for your business!',
  })
  const [saving, setSaving] = useState(false)
  const set = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))

  const handleSave = async (e:React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await new Promise(r=>setTimeout(r,800))
    toast.success('Settings saved!'); setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">App Settings</h1><p className="page-subtitle">Configure your store preferences</p></div>
        <Button type="submit" loading={saving}><HiOutlineSave className="w-4 h-4"/>Save Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h3 className="section-title border-b border-slate-100 pb-3">Company Information</h3>
          <Input label="Company Name *" value={form.companyName} onChange={e=>set('companyName',e.target.value)} required/>
          <Input label="Email" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/>
          <Input label="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
          <div className="form-group">
            <label className="label">Address</label>
            <textarea rows={2} className="input resize-none" value={form.address} onChange={e=>set('address',e.target.value)}/>
          </div>
          <Input label="Website" value={form.website} onChange={e=>set('website',e.target.value)}/>
        </div>

        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Localization</h3>
            <Select label="Currency" value={form.currency} onChange={e=>set('currency',e.target.value)}
              options={CURRENCIES.map(c=>({value:c.value,label:c.label}))}/>
            <Select label="Timezone" value={form.timezone} onChange={e=>set('timezone',e.target.value)}
              options={[
                {value:'America/New_York',label:'Eastern Time (ET)'},
                {value:'America/Chicago',label:'Central Time (CT)'},
                {value:'America/Los_Angeles',label:'Pacific Time (PT)'},
                {value:'Europe/London',label:'London (GMT)'},
                {value:'Asia/Kolkata',label:'India (IST)'},
                {value:'Asia/Dubai',label:'Dubai (GST)'},
              ]}/>
          </div>
          <div className="card space-y-4">
            <h3 className="section-title border-b border-slate-100 pb-3">Tax & Stock</h3>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-semibold text-slate-700">Enable Tax</p><p className="text-xs text-slate-400">Apply tax to sales invoices</p></div>
              <button type="button" onClick={()=>set('taxEnabled',!form.taxEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.taxEnabled?'bg-primary-600':'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.taxEnabled?'translate-x-6':'translate-x-1'}`}/>
              </button>
            </div>
            {form.taxEnabled&&(
              <div className="form-group">
                <label className="label">Default Tax Rate (%)</label>
                <input type="number" min="0" max="100" step="0.1" className="input" value={form.defaultTaxRate} onChange={e=>set('defaultTaxRate',e.target.value)}/>
              </div>
            )}
            <div className="form-group">
              <label className="label">Low Stock Alert (qty)</label>
              <input type="number" min="1" className="input" value={form.lowStockAlert} onChange={e=>set('lowStockAlert',e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="card space-y-4 lg:col-span-2">
          <h3 className="section-title border-b border-slate-100 pb-3">Invoice Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invoice Prefix" value={form.invoicePrefix} onChange={e=>set('invoicePrefix',e.target.value)}/>
            <div className="form-group">
              <label className="label">Preview</label>
              <p className="input bg-slate-50 text-slate-500 font-mono">{form.invoicePrefix}-001234</p>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Invoice Footer Text</label>
            <textarea rows={2} className="input resize-none" value={form.invoiceFooter} onChange={e=>set('invoiceFooter',e.target.value)}/>
          </div>
        </div>
      </div>
    </form>
  )
}

// ── Warehouses ─────────────────────────────────────────────────
const WH_DATA = [
  { _id:'1', name:'Main Warehouse',      email:'main@store.com',   phone:'+1 555-1000', address:'123 Storage St, NY', isActive:true,  createdAt:'2024-01-01' },
  { _id:'2', name:'Secondary Warehouse', email:'sec@store.com',    phone:'+1 555-2000', address:'456 Depot Ave, LA',  isActive:true,  createdAt:'2024-01-02' },
  { _id:'3', name:'Returns Storage',     email:'ret@store.com',    phone:'+1 555-3000', address:'789 Return Rd, CH',  isActive:false, createdAt:'2024-01-03' },
]

export function WarehousesPage() {
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(false)
  const [form, setForm]       = useState({name:'',email:'',phone:'',address:''})
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const filtered = WH_DATA.filter(w=>w.name.toLowerCase().includes(search.toLowerCase()))

  const columns: TableColumn<typeof WH_DATA[0]>[] = [
    { label:'Name',    render:row=><div><p className="font-semibold text-xs">{row.name}</p><p className="text-[10px] text-slate-400">{row.email}</p></div> },
    { key:'phone',    label:'Phone',   render:row=><span className="text-xs">{row.phone}</span> },
    { key:'address',  label:'Address', render:row=><span className="text-xs text-slate-500">{row.address}</span> },
    { label:'Status', render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Created',render:row=><span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span> },
    { label:'Actions',render:row=>(
      <div className="flex gap-1">
        <button className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Warehouses</h1><p className="page-subtitle">{WH_DATA.length} locations</p></div>
        <Button onClick={()=>setOpen(true)}><HiOutlinePlus className="w-4 h-4"/>Add Warehouse</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100"><SearchBox value={search} onChange={setSearch} placeholder="Search warehouses…"/></div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={1} totalPages={1} total={filtered.length} limit={15} onChange={()=>{}}/>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add Warehouse"
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
        <Button onClick={async()=>{if(!form.name){toast.error('Name required');return}setSaving(true);await new Promise(r=>setTimeout(r,600));toast.success('Warehouse added!');setOpen(false);setSaving(false)}} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Warehouse Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <Input label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)}
        onConfirm={async()=>{await new Promise(r=>setTimeout(r,500));toast.success('Deleted');setDeleteId(null)}}
        title="Delete Warehouse" message="Delete this warehouse? This will affect all associated stock."/>
    </div>
  )
}

// ── Users ──────────────────────────────────────────────────────
const USERS_DATA = [
  { _id:'1', name:'Admin User',   email:'admin@sboxsystem.com', role:'admin',   isActive:true,  createdAt:'2024-01-01' },
  { _id:'2', name:'Store Manager',email:'manager@store.com',  role:'manager', isActive:true,  createdAt:'2024-01-02' },
  { _id:'3', name:'Cashier One',  email:'cashier1@store.com', role:'cashier', isActive:true,  createdAt:'2024-01-03' },
  { _id:'4', name:'Cashier Two',  email:'cashier2@store.com', role:'cashier', isActive:false, createdAt:'2024-01-04' },
]

export function UsersPage() {
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(false)
  const [form, setForm]       = useState({name:'',email:'',role:'cashier',password:''})
  const [saving, setSaving]   = useState(false)
  const filtered = USERS_DATA.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()))

  const roleColor: Record<string,string> = { admin:'badge-purple', manager:'badge-blue', cashier:'badge-gray' }

  const columns: TableColumn<typeof USERS_DATA[0]>[] = [
    { label:'User', render:row=>(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary-700 font-bold text-xs">{row.name[0]}</span>
        </div>
        <div><p className="font-semibold text-xs">{row.name}</p><p className="text-[10px] text-slate-400">{row.email}</p></div>
      </div>
    )},
    { label:'Role',    render:row=><span className={roleColor[row.role]||'badge-gray'}>{ROLE_LABELS[row.role]||row.role}</span> },
    { label:'Status',  render:row=><Badge status={row.isActive?'active':'inactive'}/> },
    { label:'Created', render:row=><span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span> },
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
        <div><h1 className="page-title">Users</h1><p className="page-subtitle">{USERS_DATA.length} system users</p></div>
        <Button onClick={()=>setOpen(true)}><HiOutlinePlus className="w-4 h-4"/>Add User</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={setSearch} placeholder="Search users…"/>
          <select className="input py-2 w-36 text-sm"><option>All Roles</option><option>Admin</option><option>Manager</option><option>Cashier</option></select>
        </div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={1} totalPages={1} total={filtered.length} limit={15} onChange={()=>{}}/>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add User"
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
        <Button onClick={async()=>{if(!form.name||!form.email){toast.error('Fill required fields');return}setSaving(true);await new Promise(r=>setTimeout(r,600));toast.success('User created!');setOpen(false);setSaving(false)}} loading={saving}>Create User</Button></>}>
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <Input label="Email *" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          <Input label="Password *" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          <Select label="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
            options={[{value:'admin',label:'Administrator'},{value:'manager',label:'Manager'},{value:'cashier',label:'Cashier'}]}/>
        </div>
      </Modal>
    </div>
  )
}

// ── Expenses ───────────────────────────────────────────────────
const EXPENSE_CATS = ['Rent','Utilities','Salaries','Marketing','Transport','Supplies','Other']
const EXPENSES_DATA = [
  { _id:'1', title:'Monthly Rent',       category:'Rent',      amount:2500, date:'2024-01-01', note:'Office & warehouse rent' },
  { _id:'2', title:'Electricity Bill',   category:'Utilities', amount:380,  date:'2024-01-05', note:'' },
  { _id:'3', title:'Staff Salaries',     category:'Salaries',  amount:8500, date:'2024-01-31', note:'January payroll' },
  { _id:'4', title:'Facebook Ads',       category:'Marketing', amount:650,  date:'2024-01-10', note:'Product promotion' },
  { _id:'5', title:'Delivery Van Fuel',  category:'Transport', amount:280,  date:'2024-01-15', note:'' },
]

export function ExpensesPage() {
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(false)
  const [form, setForm]       = useState({title:'',category:'',amount:'',date:'',note:''})
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)

  const filtered = EXPENSES_DATA.filter(e=>e.title.toLowerCase().includes(search.toLowerCase()))
  const total = filtered.reduce((s,e)=>s+e.amount,0)

  const columns: TableColumn<typeof EXPENSES_DATA[0]>[] = [
    { label:'Title',    render:row=><span className="font-semibold text-xs">{row.title}</span> },
    { label:'Category', render:row=><span className="badge-blue text-xs">{row.category}</span> },
    { label:'Amount',   render:row=><span className="font-bold text-xs text-primary-600">{formatCurrency(row.amount)}</span> },
    { label:'Date',     render:row=><span className="text-xs text-slate-400">{formatDate(row.date)}</span> },
    { label:'Note',     render:row=><span className="text-xs text-slate-400">{row.note||'—'}</span> },
    { label:'Actions',  render:row=>(
      <div className="flex gap-1">
        <button className="btn-icon text-blue-500 hover:bg-blue-50"><HiOutlinePencil className="w-3.5 h-3.5"/></button>
        <button onClick={()=>setDeleteId(row._id)} className="btn-icon text-red-400 hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5"/></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Expenses</h1><p className="page-subtitle">Total this period: {formatCurrency(total)}</p></div>
        <Button onClick={()=>setOpen(true)}><HiOutlinePlus className="w-4 h-4"/>Add Expense</Button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-100">
          <SearchBox value={search} onChange={setSearch} placeholder="Search expenses…"/>
          <select className="input py-2 w-36 text-sm"><option>All Categories</option>{EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}</select>
          <input type="date" className="input py-2 w-36 text-sm"/>
          <input type="date" className="input py-2 w-36 text-sm"/>
        </div>
        <Table columns={columns} data={filtered}/>
        <Pagination page={1} totalPages={1} total={filtered.length} limit={15} onChange={()=>{}}/>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add Expense"
        footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
        <Button onClick={async()=>{if(!form.title||!form.amount){toast.error('Fill required fields');return}setSaving(true);await new Promise(r=>setTimeout(r,600));toast.success('Expense added!');setOpen(false);setSaving(false)}} loading={saving}>Save Expense</Button></>}>
        <div className="space-y-4">
          <Input label="Expense Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
          <Select label="Category *" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
            options={EXPENSE_CATS.map(c=>({value:c,label:c}))} placeholder="Select category" required/>
          <div className="form-group">
            <label className="label">Amount *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm pointer-events-none">$</span>
              <input type="number" min="0" step="0.01" required className="input pl-8" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00"/>
            </div>
          </div>
          <Input label="Date *" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
          <div className="form-group">
            <label className="label">Notes</label>
            <textarea rows={2} className="input resize-none" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)}
        onConfirm={async()=>{await new Promise(r=>setTimeout(r,500));toast.success('Deleted');setDeleteId(null)}}
        title="Delete Expense" message="Delete this expense record?"/>
    </div>
  )
}
