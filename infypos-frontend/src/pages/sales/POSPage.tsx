import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineX,
  HiOutlinePrinter, HiOutlineCash, HiOutlineCreditCard, HiOutlineRefresh,
  HiOutlineTag, HiOutlineShoppingCart, HiOutlineArrowLeft, HiOutlinePause, HiOutlineArchive, HiOutlinePlay } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import { Button, Modal } from '@/components/common'
import { holdApi, warehouseApi } from '@/api'

const PRODUCTS = [
  { _id:'1', name:'Apple iPhone 15 Pro',  sku:'APL-001', salePrice:999,   category:'Electronics', taxRate:0 },
  { _id:'2', name:'Samsung Galaxy S24',    sku:'SAM-001', salePrice:799,   category:'Electronics', taxRate:0 },
  { _id:'3', name:'Sony WH-1000XM5',       sku:'SNY-001', salePrice:349,   category:'Electronics', taxRate:0 },
  { _id:'4', name:'Nike Air Max 270',       sku:'NK-001',  salePrice:129,   category:'Clothing',    taxRate:0 },
  { _id:'5', name:'Adidas Ultraboost 22',   sku:'ADB-001', salePrice:159,   category:'Clothing',    taxRate:0 },
  { _id:'6', name:'Dell XPS 15 Laptop',     sku:'DEL-001', salePrice:1499,  category:'Electronics', taxRate:0 },
  { _id:'7', name:'The Alchemist',          sku:'BK-001',  salePrice:14.99, category:'Books',       taxRate:0 },
  { _id:'8', name:'Wireless Mouse Pro',     sku:'WM-001',  salePrice:59,    category:'Electronics', taxRate:0 },
  { _id:'9', name:'Coffee Mug XL',          sku:'CM-001',  salePrice:19.99, category:'Others',      taxRate:0 },
  { _id:'10', name:'Mechanical Keyboard',   sku:'KB-001',  salePrice:89,    category:'Electronics', taxRate:0 },
  { _id:'11', name:'USB-C Hub 7-in-1',      sku:'USB-001', salePrice:45,    category:'Electronics', taxRate:0 },
  { _id:'12', name:'Yoga Mat Premium',      sku:'YM-001',  salePrice:39,    category:'Others',      taxRate:0 },
  { _id:'13', name:'Wireless Earbuds Pro',  sku:'WEP-001', salePrice:149,   category:'Electronics', taxRate:0 },
  { _id:'14', name:'Levi\'s Slim Jeans',    sku:'LVS-001', salePrice:89,    category:'Clothing',    taxRate:0 },
  { _id:'15', name:'Python Programming',    sku:'PY-001',  salePrice:49,    category:'Books',       taxRate:0 },
]
const CATS = ['All','Electronics','Clothing','Books','Others']
const CAT_COLOR: Record<string,string> = {
  Electronics:'bg-blue-100 text-blue-700', Clothing:'bg-purple-100 text-purple-700',
  Books:'bg-amber-100 text-amber-700', Others:'bg-slate-100 text-slate-600',
}

interface CartItem { _id:string; name:string; sku:string; salePrice:number; qty:number }
interface HoldItem { product?:string|null; name:string; sku:string; quantity:number; unitPrice:number; taxRate:number }
interface HoldRecord {
  _id:string; holdNo:string; items:HoldItem[]; discount:number; discountType:'fixed'|'percent'
  warehouse?:{_id:string;name:string}; customer?:{_id:string;name:string}; createdAt:string
}

export default function POSPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [cart, setCart]         = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [method, setMethod]     = useState<'cash'|'card'>('cash')
  const [checkout, setCheckout] = useState(false)
  const [paid, setPaid]         = useState('')
  const [processing, setProc]   = useState(false)
  const [barcodeVal, setBarcode]= useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [holding, setHolding]   = useState(false)
  const [heldOpen, setHeldOpen] = useState(false)
  const [heldSales, setHeldSales] = useState<HoldRecord[]>([])
  const [heldLoading, setHeldLoading] = useState(false)

  const filtered = PRODUCTS.filter(p =>
    (cat==='All'||p.category===cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = useCallback((p: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const ex = prev.find(i=>i._id===p._id)
      if (ex) return prev.map(i=>i._id===p._id?{...i,qty:i.qty+1}:i)
      return [...prev,{_id:p._id,name:p.name,sku:p.sku,salePrice:p.salePrice,qty:1}]
    })
  },[])

  const updateQty = (id:string,qty:number) => {
    if(qty<=0){setCart(prev=>prev.filter(i=>i._id!==id));return}
    setCart(prev=>prev.map(i=>i._id===id?{...i,qty}:i))
  }

  const subtotal  = cart.reduce((s,i)=>s+i.salePrice*i.qty,0)
  const discAmt   = (subtotal*discount)/100
  const grandTotal= subtotal-discAmt
  const change    = parseFloat(paid||'0')-grandTotal

  const handleBarcode = (e:React.KeyboardEvent) => {
    if(e.key!=='Enter') return
    const p = PRODUCTS.find(x=>x.sku===barcodeVal)
    if(p){addToCart(p);setBarcode('');toast.success(`${p.name.slice(0,20)}… added`,{duration:1000,position:'bottom-right'})}
    else toast.error('Product not found')
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await warehouseApi.getAll({ limit: 1 })
        const whs = res.data.data || []
        if (whs.length) setWarehouseId(whs[0]._id)
      } catch {
        // no warehouse available — Hold will be disabled
      }
    })()
  }, [])

  const resumeFromHold = async (hold: HoldRecord) => {
    setCart(hold.items.map((i,idx) => ({ _id: i.product || `hold-${idx}`, name: i.name, sku: i.sku, salePrice: i.unitPrice, qty: i.quantity })))
    setDiscount(hold.discountType === 'percent' ? hold.discount : 0)
    try { await holdApi.delete(hold._id) } catch { /* already removed */ }
    toast.success(`Resumed ${hold.holdNo}`)
  }

  useEffect(() => {
    const resumeHold = (location.state as { resumeHold?: HoldRecord } | null)?.resumeHold
    if (resumeHold) {
      resumeFromHold(resumeHold)
      navigate('.', { replace: true, state: {} })
    }
  }, [])

  const handleHold = async () => {
    if (!cart.length) { toast.error('Cart is empty'); return }
    if (!warehouseId) { toast.error('No warehouse configured'); return }
    setHolding(true)
    try {
      await holdApi.create({
        warehouse: warehouseId,
        items: cart.map(i => ({ name: i.name, sku: i.sku, quantity: i.qty, unitPrice: i.salePrice, taxRate: 0 })),
        discount, discountType: 'percent',
      })
      toast.success('Sale held')
      setCart([]); setDiscount(0)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to hold sale')
    } finally {
      setHolding(false)
    }
  }

  const openHeldSales = async () => {
    setHeldOpen(true)
    setHeldLoading(true)
    try {
      const res = await holdApi.getAll()
      setHeldSales(res.data.data || [])
    } catch {
      toast.error('Failed to load held sales')
    } finally {
      setHeldLoading(false)
    }
  }

  const handleResumeHeld = async (hold: HoldRecord) => {
    await resumeFromHold(hold)
    setHeldOpen(false)
  }

  const handleDeleteHeld = async (id: string) => {
    try {
      await holdApi.delete(id)
      setHeldSales(prev => prev.filter(h => h._id !== id))
      toast.success('Held sale removed')
    } catch {
      toast.error('Failed to remove held sale')
    }
  }

  const handleCheckout = async () => {
    if(!cart.length){toast.error('Cart is empty');return}
    setProc(true)
    await new Promise(r=>setTimeout(r,1200))
    const inv = '#INV-'+Math.floor(1000+Math.random()*9000)
    toast.success(`Sale ${inv} completed!`)
    setCart([]); setCheckout(false); setPaid(''); setDiscount(0)
    setProc(false)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="bg-sidebar px-5 py-3 flex items-center justify-between flex-shrink-0 h-14">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">SB</span>
          </div>
          <span className="text-white font-bold text-sm">SBox System — Point of Sale</span>
        </div>
        <div className="flex items-center gap-2">
          <input value={barcodeVal} onChange={e=>setBarcode(e.target.value)} onKeyDown={handleBarcode}
            className="input input-sm w-44 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            placeholder="Scan barcode…"/>
          <button onClick={openHeldSales} className="btn btn-white btn-sm gap-1.5">
            <HiOutlineArchive className="w-3.5 h-3.5"/> Held Sales
          </button>
          <Link to="/dashboard" className="btn btn-white btn-sm gap-1.5">
            <HiOutlineArrowLeft className="w-3.5 h-3.5"/> Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Products */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input className="input pl-9 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or SKU…"/>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATS.map(c=>(
              <button key={c} onClick={()=>setCat(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${cat===c?'bg-primary-600 text-white shadow-sm':'bg-white text-slate-600 hover:bg-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filtered.map(p=>{
                const inCart=cart.find(i=>i._id===p._id)
                return(
                  <div key={p._id} onClick={()=>addToCart(p)}
                    className={`pos-card relative${inCart?' in-cart':''}`}>
                    <div className="w-full h-16 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLOR[p.category]||'badge-gray'}`}>{p.category}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{p.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-sm font-black text-primary-600">{formatCurrency(p.salePrice)}</p>
                      {inCart&&<span className="badge-blue text-[10px]">{inCart.qty}×</span>}
                    </div>
                  </div>
                )
              })}
              {filtered.length===0&&(
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <HiOutlineSearch className="w-10 h-10 text-slate-300 mb-2"/>
                  <p className="text-slate-400 text-sm">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          {/* Cart header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineShoppingCart className="w-4 h-4 text-primary-600"/>
              <span className="font-bold text-sm text-slate-800">Shopping Cart</span>
              {cart.length>0&&<span className="badge-blue text-xs">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </div>
            {cart.length>0&&(
              <button onClick={()=>setCart([])} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold">
                <HiOutlineRefresh className="w-3.5 h-3.5"/> Clear
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length===0?(
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <HiOutlineShoppingCart className="w-12 h-12 text-slate-200 mb-3"/>
                <p className="text-sm text-slate-400 font-medium">Cart is empty</p>
                <p className="text-xs text-slate-300 mt-1">Click on products to add</p>
              </div>
            ):cart.map(item=>(
              <div key={item._id} className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                  <p className="text-xs font-bold text-primary-600 mt-0.5">{formatCurrency(item.salePrice)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={()=>updateQty(item._id,0)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <HiOutlineX className="w-3 h-3"/>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={()=>updateQty(item._id,item.qty-1)}
                      className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                      <HiOutlineMinus className="w-2.5 h-2.5"/>
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                    <button onClick={()=>updateQty(item._id,item.qty+1)}
                      className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-green-50 hover:text-green-500 hover:border-green-200 transition-colors">
                      <HiOutlinePlus className="w-2.5 h-2.5"/>
                    </button>
                  </div>
                  <p className="text-xs font-black text-slate-800">{formatCurrency(item.salePrice*item.qty)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-4 py-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <HiOutlineTag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>
              <span className="text-xs text-slate-500 font-semibold">Discount %</span>
              <input type="number" min="0" max="100" value={discount}
                onChange={e=>setDiscount(Math.min(100,Math.max(0,Number(e.target.value)||0)))}
                className="input input-sm w-16 ml-auto text-right font-bold"/>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              {discount>0&&(
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Discount ({discount}%)</span>
                  <span className="font-bold text-red-500">−{formatCurrency(discAmt)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-sm font-black text-slate-800">Grand Total</span>
                <span className="text-sm font-black text-primary-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['cash','card'] as const).map(m=>(
                <button key={m} onClick={()=>setMethod(m)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${method===m?'border-primary-500 bg-primary-50 text-primary-700':'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {m==='cash'?<HiOutlineCash className="w-4 h-4"/>:<HiOutlineCreditCard className="w-4 h-4"/>}
                  {m==='cash'?'Cash':'Card / POS'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="justify-center py-3" onClick={handleHold} loading={holding} disabled={!cart.length}>
                <HiOutlinePause className="w-4 h-4"/>
                Hold
              </Button>
              <Button className="flex-1 justify-center py-3" onClick={()=>setCheckout(true)} disabled={!cart.length}>
                <HiOutlinePrinter className="w-4 h-4"/>
                Checkout — {formatCurrency(grandTotal)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      <Modal open={checkout} onClose={()=>setCheckout(false)} title="Complete Sale" size="sm"
        footer={<>
          <Button variant="secondary" onClick={()=>setCheckout(false)} disabled={processing}>Cancel</Button>
          <Button onClick={handleCheckout} loading={processing}>
            <HiOutlinePrinter className="w-4 h-4"/> Complete & Print
          </Button>
        </>}>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            {cart.slice(0,3).map((item,i)=>(
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-600 truncate max-w-[180px]">{item.name} ×{item.qty}</span>
                <span className="font-bold">{formatCurrency(item.salePrice*item.qty)}</span>
              </div>
            ))}
            {cart.length>3&&<p className="text-xs text-slate-400">+{cart.length-3} more items</p>}
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="text-sm font-black text-slate-800">Total</span>
              <span className="text-sm font-black text-primary-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Amount Received ({method==='cash'?'Cash':'Card'})</label>
            <input type="number" min="0" step="0.01" value={paid}
              onChange={e=>setPaid(e.target.value)}
              className="input text-right text-lg font-black" placeholder="0.00" autoFocus/>
          </div>
          {parseFloat(paid)>0&&(
            <div className={`p-3.5 rounded-xl text-center font-black text-sm ${change>=0?'bg-emerald-50 text-emerald-700 border border-emerald-100':'bg-red-50 text-red-600 border border-red-100'}`}>
              {change>=0?`Change: ${formatCurrency(change)}`:`Short by: ${formatCurrency(Math.abs(change))}`}
            </div>
          )}
        </div>
      </Modal>

      {/* Held sales modal */}
      <Modal open={heldOpen} onClose={()=>setHeldOpen(false)} title="Held Sales" size="md">
        {heldLoading?(
          <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
        ):heldSales.length===0?(
          <div className="flex flex-col items-center py-10 text-center">
            <HiOutlineArchive className="w-10 h-10 text-slate-300 mb-2"/>
            <p className="text-sm text-slate-400">No held sales</p>
          </div>
        ):(
          <div className="space-y-2">
            {heldSales.map(hold=>{
              const sub = hold.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0)
              const discAmt = hold.discountType==='percent'?(sub*hold.discount)/100:hold.discount
              const total = Math.max(0,sub-discAmt)
              return (
                <div key={hold._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-mono font-bold text-primary-600">{hold.holdNo}</p>
                    <p className="text-[11px] text-slate-400">{hold.items.length} items · {formatDateTime(hold.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-800">{formatCurrency(total)}</span>
                    <button onClick={()=>handleResumeHeld(hold)} className="btn-icon text-emerald-500 hover:bg-emerald-100" title="Resume">
                      <HiOutlinePlay className="w-4 h-4"/>
                    </button>
                    <button onClick={()=>handleDeleteHeld(hold._id)} className="btn-icon text-red-400 hover:bg-red-100" title="Delete">
                      <HiOutlineTrash className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
