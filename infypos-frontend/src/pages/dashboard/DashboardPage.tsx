import React from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { HiOutlineCurrencyDollar, HiOutlineShoppingBag, HiOutlineReceiptRefund, HiOutlineCube, HiOutlineArrowRight, HiOutlineExclamationCircle, HiOutlineTrendingUp } from 'react-icons/hi'
import { StatCard, Badge } from '@/components/common'
import { formatCurrency } from '@/utils/currency'
import { formatDate as fmtDate } from '@/utils/date'

const salesData = [
  { month: 'Jan', sales: 4200, purchases: 2800 }, { month: 'Feb', sales: 3800, purchases: 2400 },
  { month: 'Mar', sales: 5100, purchases: 3200 }, { month: 'Apr', sales: 4700, purchases: 2900 },
  { month: 'May', sales: 6300, purchases: 4100 }, { month: 'Jun', sales: 5800, purchases: 3600 },
  { month: 'Jul', sales: 7200, purchases: 4800 }, { month: 'Aug', sales: 6900, purchases: 4300 },
  { month: 'Sep', sales: 8100, purchases: 5200 }, { month: 'Oct', sales: 7600, purchases: 4700 },
  { month: 'Nov', sales: 9200, purchases: 6100 }, { month: 'Dec', sales: 10500, purchases: 7200 },
]
const categoryData = [
  { name: 'Electronics', value: 35 }, { name: 'Clothing', value: 25 },
  { name: 'Food', value: 20 },        { name: 'Books', value: 12 }, { name: 'Others', value: 8 },
]
const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6']
const recentSales = [
  { invoiceNo: '#S-1024', customer: 'John Doe',        grandTotal: 285,   paymentStatus: 'paid',    createdAt: new Date().toISOString() },
  { invoiceNo: '#S-1023', customer: 'Jane Smith',       grandTotal: 142.5, paymentStatus: 'paid',    createdAt: new Date(Date.now()-86400000).toISOString() },
  { invoiceNo: '#S-1022', customer: 'Walk-in Customer', grandTotal: 67,    paymentStatus: 'paid',    createdAt: new Date(Date.now()-86400000).toISOString() },
  { invoiceNo: '#S-1021', customer: 'Robert Johnson',   grandTotal: 412,   paymentStatus: 'partial', createdAt: new Date(Date.now()-2*86400000).toISOString() },
  { invoiceNo: '#S-1020', customer: 'Emily Davis',      grandTotal: 99.99, paymentStatus: 'unpaid',  createdAt: new Date(Date.now()-2*86400000).toISOString() },
]
const lowStock = [
  { name: 'Apple iPhone 15 Pro',    sku: 'APL-00123', qty: 2,  alert: 5  },
  { name: 'Samsung Galaxy S24',     sku: 'SAM-00456', qty: 1,  alert: 5  },
  { name: 'Wireless Earbuds Pro',   sku: 'WEP-00789', qty: 3,  alert: 10 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"    value={formatCurrency(48250)} icon={HiOutlineCurrencyDollar} color="blue"   change={12.5} />
        <StatCard title="Total Purchases"  value={formatCurrency(31800)} icon={HiOutlineShoppingBag}    color="orange" change={8.3}  />
        <StatCard title="Total Orders"     value={187}                   icon={HiOutlineReceiptRefund}   color="green"  change={5.2}  />
        <StatCard title="Total Products"   value={342}                   icon={HiOutlineCube}            color="purple" change={2.1}  />
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Sales",   value: formatCurrency(1240), color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100' },
          { label: 'This Month',      value: formatCurrency(12800),color:'text-blue-600',    bg:'bg-blue-50 border-blue-100'       },
          { label: 'Low Stock Items', value: '8 products',         color:'text-red-600',     bg:'bg-red-50 border-red-100'          },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title text-base">Sales vs Purchases</h2>
              <p className="text-xs text-slate-400 mt-0.5">Full year overview — {new Date().getFullYear()}</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600"><span className="inline-block w-3 h-0.5 bg-blue-500 rounded"/>Sales</span>
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="inline-block w-3 h-0.5 bg-emerald-500 rounded"/>Purchases</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/>
              <Tooltip formatter={(v:number,n:string)=>[formatCurrency(v),n]} contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,.1)',fontSize:12}}/>
              <Area type="monotone" dataKey="sales"     stroke="#3b82f6" strokeWidth={2.5} fill="url(#gS)" name="Sales"/>
              <Area type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2.5} fill="url(#gP)" name="Purchases"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="mb-5">
            <h2 className="section-title text-base">By Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sales distribution this month</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={3}>
                {categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v:number)=>[`${v}%`,'Share']} contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,.1)',fontSize:12}}/>
              <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:'#64748b'}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="card xl:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="section-title text-base">Recent Sales</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest 5 transactions</p>
            </div>
            <Link to="/sales" className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-bold">
              View all <HiOutlineArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th>
            </tr></thead>
            <tbody>
              {recentSales.map((s,i)=>(
                <tr key={i}>
                  <td className="font-mono font-bold text-primary-600">{s.invoiceNo}</td>
                  <td>{s.customer}</td>
                  <td className="text-slate-400">{fmtDate(s.createdAt)}</td>
                  <td className="font-bold">{formatCurrency(s.grandTotal)}</td>
                  <td><Badge status={s.paymentStatus}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title text-base">Low Stock Alert</h2>
              <p className="text-xs text-slate-400 mt-0.5">Requires restocking</p>
            </div>
            <span className="badge-red">3 items</span>
          </div>
          <div className="space-y-2.5">
            {lowStock.map((item,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <HiOutlineExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-red-600">{item.qty}</p>
                  <p className="text-[10px] text-slate-400">min {item.alert}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/reports/stock" className="flex items-center gap-1.5 mt-4 text-xs text-primary-600 hover:text-primary-700 font-bold">
            View stock report <HiOutlineArrowRight className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </div>
    </div>
  )
}
