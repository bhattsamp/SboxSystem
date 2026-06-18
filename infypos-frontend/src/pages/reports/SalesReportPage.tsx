import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Button, Badge, Table, type TableColumn } from '@/components/common'
import { HiOutlineDownload, HiOutlineFilter } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const monthlyData = [
  {month:'Jan',sales:4200,purchases:2800,profit:1400},{month:'Feb',sales:3800,purchases:2400,profit:1400},
  {month:'Mar',sales:5100,purchases:3200,profit:1900},{month:'Apr',sales:4700,purchases:2900,profit:1800},
  {month:'May',sales:6300,purchases:4100,profit:2200},{month:'Jun',sales:5800,purchases:3600,profit:2200},
  {month:'Jul',sales:7200,purchases:4800,profit:2400},{month:'Aug',sales:6900,purchases:4300,profit:2600},
  {month:'Sep',sales:8100,purchases:5200,profit:2900},{month:'Oct',sales:7600,purchases:4700,profit:2900},
  {month:'Nov',sales:9200,purchases:6100,profit:3100},{month:'Dec',sales:10500,purchases:7200,profit:3300},
]

const SALES_ROWS = [
  { _id:'1', invoiceNo:'INV-001024', customer:'John Doe',        items:3, grandTotal:285,   paidAmount:285,   dueAmount:0,    paymentStatus:'paid',    createdAt:'2024-01-20' },
  { _id:'2', invoiceNo:'INV-001023', customer:'Jane Smith',       items:2, grandTotal:142.5, paidAmount:142.5, dueAmount:0,    paymentStatus:'paid',    createdAt:'2024-01-19' },
  { _id:'3', invoiceNo:'INV-001022', customer:'Walk-in Customer', items:1, grandTotal:67,    paidAmount:67,    dueAmount:0,    paymentStatus:'paid',    createdAt:'2024-01-19' },
  { _id:'4', invoiceNo:'INV-001021', customer:'Robert Johnson',   items:5, grandTotal:412,   paidAmount:200,   dueAmount:212,  paymentStatus:'partial', createdAt:'2024-01-18' },
  { _id:'5', invoiceNo:'INV-001020', customer:'Emily Davis',      items:2, grandTotal:99.99, paidAmount:0,     dueAmount:99.99,paymentStatus:'unpaid',  createdAt:'2024-01-18' },
]

const STOCK_ROWS = [
  { _id:'1', product:'Apple iPhone 15 Pro', sku:'APL-00123', category:'Electronics', warehouse:'Main',      qty:12, alertQty:5,  status:'ok'  },
  { _id:'2', product:'Samsung Galaxy S24',  sku:'SAM-00456', category:'Electronics', warehouse:'Main',      qty:8,  alertQty:5,  status:'ok'  },
  { _id:'3', product:'Sony WH-1000XM5',     sku:'SNY-00789', category:'Electronics', warehouse:'Main',      qty:3,  alertQty:5,  status:'low' },
  { _id:'4', product:'Nike Air Max 270',    sku:'NK-00321',  category:'Clothing',    warehouse:'Main',      qty:0,  alertQty:10, status:'out' },
  { _id:'5', product:'The Alchemist',       sku:'BK-00654',  category:'Books',       warehouse:'Main',      qty:25, alertQty:5,  status:'ok'  },
  { _id:'6', product:'Wireless Mouse Pro',  sku:'WM-00987',  category:'Electronics', warehouse:'Secondary', qty:2,  alertQty:10, status:'low' },
]

// Shared filter bar
function ReportFilters({ startDate, setStartDate, endDate, setEndDate, warehouse, setWarehouse }: any) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-end gap-4">
        <div className="form-group">
          <label className="label">Start Date</label>
          <input type="date" className="input w-40 text-sm" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="label">End Date</label>
          <input type="date" className="input w-40 text-sm" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="label">Warehouse</label>
          <select className="input w-44 text-sm" value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
            <option value="">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="secondary">Secondary Warehouse</option>
          </select>
        </div>
        <Button variant="secondary"><HiOutlineFilter className="w-4 h-4"/>Apply Filters</Button>
        <Button variant="ghost" className="ml-auto"><HiOutlineDownload className="w-4 h-4"/>Export Excel</Button>
      </div>
    </div>
  )
}

// ── Sales Report ───────────────────────────────────────────────
export default function SalesReportPage() {
  const [startDate, setStartDate] = useState('2024-01-01')
  const [endDate,   setEndDate]   = useState('2024-12-31')
  const [warehouse, setWarehouse] = useState('')

  const totalSales   = SALES_ROWS.reduce((s,r)=>s+r.grandTotal,0)
  const totalReceived= SALES_ROWS.reduce((s,r)=>s+r.paidAmount,0)
  const totalDue     = SALES_ROWS.reduce((s,r)=>s+r.dueAmount,0)

  const columns: TableColumn<typeof SALES_ROWS[0]>[] = [
    { label:'Invoice #', render:row=><span className="font-mono font-bold text-primary-600 text-xs">{row.invoiceNo}</span> },
    { label:'Customer',  key:'customer' },
    { label:'Items',     render:row=><span className="badge-blue">{row.items}</span> },
    { label:'Total',     render:row=><span className="font-bold text-xs">{formatCurrency(row.grandTotal)}</span> },
    { label:'Paid',      render:row=><span className="text-emerald-600 font-semibold text-xs">{formatCurrency(row.paidAmount)}</span> },
    { label:'Due',       render:row=><span className={`font-semibold text-xs ${row.dueAmount>0?'text-red-500':'text-slate-400'}`}>{formatCurrency(row.dueAmount)}</span> },
    { label:'Status',    render:row=><Badge status={row.paymentStatus}/> },
    { label:'Date',      render:row=><span className="text-slate-400 text-xs">{formatDate(row.createdAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Sales Report</h1><p className="page-subtitle">Detailed sales analysis</p></div>
      </div>
      <ReportFilters {...{startDate,setStartDate,endDate,setEndDate,warehouse,setWarehouse}}/>
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Sales',    value:formatCurrency(totalSales),    color:'text-blue-600',    bg:'bg-blue-50 border-blue-100'},
          {label:'Total Received', value:formatCurrency(totalReceived), color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100'},
          {label:'Total Due',      value:formatCurrency(totalDue),      color:'text-red-600',     bg:'bg-red-50 border-red-100'},
        ].map(s=>(
          <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title mb-5 text-base">Monthly Sales Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{top:5,right:10,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/>
            <Tooltip formatter={(v:number)=>[formatCurrency(v),'Sales']} contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,.1)',fontSize:12}}/>
            <Bar dataKey="sales" fill="#3b82f6" radius={[4,4,0,0]} name="Sales"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="section-title text-base">Sales Transactions</h3></div>
        <Table columns={columns} data={SALES_ROWS}/>
      </div>
    </div>
  )
}

// ── Purchase Report ────────────────────────────────────────────
export function PurchaseReportPage() {
  const [startDate, setStartDate] = useState('2024-01-01')
  const [endDate,   setEndDate]   = useState('2024-12-31')
  const [warehouse, setWarehouse] = useState('')
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Purchase Report</h1><p className="page-subtitle">Detailed purchase analysis</p></div>
      </div>
      <ReportFilters {...{startDate,setStartDate,endDate,setEndDate,warehouse,setWarehouse}}/>
      <div className="card">
        <h3 className="section-title mb-5 text-base">Monthly Purchase Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyData} margin={{top:5,right:10,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/>
            <Tooltip formatter={(v:number)=>[formatCurrency(v),'Purchases']} contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,.1)',fontSize:12}}/>
            <Line type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2.5} dot={false} name="Purchases"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Purchases',value:formatCurrency(monthlyData.reduce((s,r)=>s+r.purchases,0)),color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-100'},
          {label:'Avg Monthly',    value:formatCurrency(monthlyData.reduce((s,r)=>s+r.purchases,0)/12),color:'text-blue-600',bg:'bg-blue-50 border-blue-100'},
          {label:'Highest Month',  value:'December',color:'text-purple-600',bg:'bg-purple-50 border-purple-100'},
        ].map(s=>(
          <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-black mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stock Report ───────────────────────────────────────────────
export function StockReportPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const filtered = STOCK_ROWS.filter(r =>
    (r.product.toLowerCase().includes(search.toLowerCase())||r.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!filter || r.status===filter)
  )

  const stockColumns: TableColumn<typeof STOCK_ROWS[0]>[] = [
    { label:'Product', render:row=><div><p className="font-semibold text-xs">{row.product}</p><p className="text-[10px] font-mono text-slate-400">{row.sku}</p></div> },
    { label:'Category',  render:row=><span className="badge-blue text-xs">{row.category}</span> },
    { label:'Warehouse', key:'warehouse', render:row=><span className="text-xs text-slate-500">{row.warehouse}</span> },
    { label:'Qty In Stock', render:row=><span className={`font-black text-sm ${row.qty===0?'text-red-600':row.qty<=row.alertQty?'text-amber-600':'text-slate-800'}`}>{row.qty}</span> },
    { label:'Alert Qty',    render:row=><span className="font-mono text-xs text-slate-500">{row.alertQty}</span> },
    { label:'Status',       render:row=><Badge status={row.status==='ok'?'active':row.status==='low'?'pending':'cancelled'} label={row.status==='ok'?'OK':row.status==='low'?'Low Stock':'Out of Stock'}/> },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Stock Report</h1><p className="page-subtitle">Current inventory levels</p></div>
        <Button variant="ghost"><HiOutlineDownload className="w-4 h-4"/>Export</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total SKUs',  value:STOCK_ROWS.length,                          color:'text-blue-600',  bg:'bg-blue-50 border-blue-100'},
          {label:'Low Stock',   value:STOCK_ROWS.filter(r=>r.status==='low').length,  color:'text-amber-600', bg:'bg-amber-50 border-amber-100'},
          {label:'Out of Stock',value:STOCK_ROWS.filter(r=>r.status==='out').length,  color:'text-red-600',   bg:'bg-red-50 border-red-100'},
        ].map(s=>(
          <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-black mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-100">
          <input className="input w-56 text-sm" placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="input w-36 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Status</option><option value="ok">OK</option><option value="low">Low Stock</option><option value="out">Out of Stock</option>
          </select>
          <select className="input w-44 text-sm"><option>All Warehouses</option><option>Main Warehouse</option><option>Secondary Warehouse</option></select>
        </div>
        <Table columns={stockColumns} data={filtered}/>
      </div>
    </div>
  )
}
