import React, { useState, useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import JsBarcode from 'jsbarcode'
import toast from 'react-hot-toast'
import { HiOutlinePrinter, HiOutlineRefresh, HiOutlinePlus } from 'react-icons/hi'
import { Button, Select } from '@/components/common'
import { BARCODE_SYMBOLOGIES, PAPER_SIZES, PAPER_LAYOUTS } from '@/constants/barcode'
import { formatCurrency } from '@/utils/currency'

const WAREHOUSES = [{value:'1',label:'Main Warehouse'},{value:'2',label:'Secondary Warehouse'}]
const PRODUCTS   = [
  {value:'1',label:'Apple iPhone 15 Pro', sku:'APL-00123',price:999,  barcode:'8901234567890'},
  {value:'2',label:'Samsung Galaxy S24',  sku:'SAM-00456',price:799,  barcode:'1234567890123'},
  {value:'3',label:'Sony WH-1000XM5',     sku:'SNY-00789',price:349,  barcode:'3456789012345'},
  {value:'4',label:'Nike Air Max 270',    sku:'NK-00321', price:129,  barcode:'4567890123456'},
  {value:'5',label:'Dell XPS 15',         sku:'DEL-00654',price:1499, barcode:'6789012345678'},
  {value:'6',label:'Wireless Earbuds Pro',sku:'WEP-00789',price:149,  barcode:'7890123456789'},
]

type BItem = typeof PRODUCTS[0]

function BarcodeLabel({ item, config }: { item:BItem; config:{ showName:boolean; showPrice:boolean; showSKU:boolean; symbology:string }}) {
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(()=>{
    if(!svgRef.current||!item.barcode) return
    try {
      JsBarcode(svgRef.current, item.barcode, {
        format: config.symbology||'CODE128', width:1.6, height:36,
        displayValue:false, margin:3, background:'#fff', lineColor:'#000',
      })
    } catch {}
  },[item,config.symbology])

  return (
    <div className="flex flex-col items-center border border-dashed border-slate-200 p-2 bg-white print-no-break">
      {config.showName  && <p className="text-[7pt] font-bold text-slate-800 text-center truncate w-full mb-0.5">{item.label}</p>}
      <svg ref={svgRef} className="max-w-full"/>
      {config.showSKU   && <p className="text-[6pt] font-mono text-slate-500 text-center">{item.sku}</p>}
      {config.showPrice && <p className="text-[8pt] font-black text-slate-800 text-center">{formatCurrency(item.price)}</p>}
    </div>
  )
}

const PrintArea = React.forwardRef<HTMLDivElement, {
  items:BItem[]; qty:number; paperSize:string
  config:{showName:boolean;showPrice:boolean;showSKU:boolean;symbology:string}
}>(({items,qty,paperSize,config},ref)=>{
  const layout = PAPER_LAYOUTS[paperSize]||PAPER_LAYOUTS['A4']
  const all: BItem[] = []
  items.forEach(item=>{ for(let i=0;i<qty;i++) all.push(item) })
  return (
    <div ref={ref} className="barcode-print-area p-4 bg-white">
      <div className="barcode-grid" style={{display:'grid',gridTemplateColumns:`repeat(${layout.cols},1fr)`,gap:'4px'}}>
        {all.map((item,idx)=><BarcodeLabel key={`${item.value}-${idx}`} item={item} config={config}/>)}
      </div>
    </div>
  )
})
PrintArea.displayName='PrintArea'

export default function BarcodePrintPage() {
  const printRef  = useRef<HTMLDivElement>(null)
  const [warehouse, setWarehouse] = useState('1')
  const [selected, setSelected]   = useState('')
  const [qty, setQty]             = useState(1)
  const [paper, setPaper]         = useState('A4')
  const [symbology, setSymbology] = useState('CODE128')
  const [showName, setShowName]   = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showSKU, setShowSKU]     = useState(true)
  const [list, setList]           = useState<BItem[]>([])

  const handlePrint = useReactToPrint({
    content:()=>printRef.current,
    documentTitle:'Barcodes-SBox System',
    onAfterPrint:()=>toast.success('Sent to printer!'),
  })

  const addToList = () => {
    if(!selected){toast.error('Please select a product');return}
    const prod = PRODUCTS.find(p=>p.value===selected)
    if(!prod) return
    setList(prev=>[...prev.filter(p=>p.value!==prod.value),prod])
    toast.success(`${prod.label.slice(0,25)}… added`)
  }

  const layout = PAPER_LAYOUTS[paper]||PAPER_LAYOUTS['A4']
  const config = {showName,showPrice,showSKU,symbology}
  const totalLabels = list.length*qty

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Print Barcode</h1>
          <p className="page-subtitle">Generate and print barcode labels for products</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={()=>setList([])} disabled={!list.length}>
            <HiOutlineRefresh className="w-4 h-4"/>Clear
          </Button>
          <Button onClick={handlePrint} disabled={!list.length}>
            <HiOutlinePrinter className="w-4 h-4"/>Print {totalLabels||''} Label{totalLabels!==1?'s':''}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="space-y-5">
          <div className="card space-y-4">
            <h3 className="section-title">Product Selection</h3>
            <Select label="Warehouse" value={warehouse} onChange={e=>setWarehouse(e.target.value)} options={WAREHOUSES}/>
            <Select label="Select Product" value={selected} onChange={e=>setSelected(e.target.value)} options={PRODUCTS} placeholder="-- Choose product --"/>
            <div className="form-group">
              <label className="label">Quantity per Product</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setQty(q=>Math.max(1,q-1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 hover:bg-slate-50 transition-colors">−</button>
                <input type="number" min="1" max="500" value={qty} onChange={e=>setQty(Math.max(1,Math.min(500,Number(e.target.value)||1)))}
                  className="input text-center font-black w-20"/>
                <button type="button" onClick={()=>setQty(q=>Math.min(500,q+1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 hover:bg-slate-50 transition-colors">+</button>
              </div>
              <p className="hint-msg">Max 500 per product</p>
            </div>
            <Button variant="outline" className="w-full" onClick={addToList}>
              <HiOutlinePlus className="w-4 h-4"/>Add to Print List
            </Button>
          </div>

          <div className="card space-y-4">
            <h3 className="section-title">Paper & Format</h3>
            <Select label="Paper Size" value={paper} onChange={e=>setPaper(e.target.value)}
              options={PAPER_SIZES.map(s=>({value:s.value,label:s.label}))}/>
            <Select label="Barcode Symbology" value={symbology} onChange={e=>setSymbology(e.target.value)}
              options={BARCODE_SYMBOLOGIES.map(s=>({value:s.value,label:s.label}))}/>
            <div>
              <label className="label mb-3">Display Options</label>
              <div className="space-y-2.5">
                {[
                  {label:'Product Name',value:showName,  set:setShowName},
                  {label:'Price',       value:showPrice, set:setShowPrice},
                  {label:'SKU Code',    value:showSKU,   set:setShowSKU},
                ].map(({label,value,set})=>(
                  <label key={label} className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-sm text-slate-700 font-medium">{label}</span>
                    <button type="button" onClick={()=>set(!value)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${value?'bg-primary-600':'bg-slate-200'}`}
                      style={{height:22,minWidth:40}}>
                      <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform ${value?'translate-x-[22px]':'translate-x-[3px]'}`}/>
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Print list */}
          {list.length>0&&(
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">Print Queue ({list.length})</h3>
                <button onClick={()=>setList([])} className="text-xs text-red-500 hover:text-red-700 font-bold">Clear</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {list.map(item=>(
                  <div key={item.value} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.label}</p>
                      <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                    </div>
                    <button onClick={()=>setList(prev=>prev.filter(p=>p.value!==item.value))}
                      className="text-slate-400 hover:text-red-400 ml-2 text-lg leading-none font-bold flex-shrink-0">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="card min-h-96">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-title text-base">Preview</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {layout.label} · {layout.cols} columns
                  {list.length>0&&` · ${totalLabels} label${totalLabels!==1?'s':''}`}
                </p>
              </div>
            </div>

            {list.length===0?(
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <HiOutlinePrinter className="w-8 h-8 text-slate-300"/>
                </div>
                <p className="text-sm font-semibold text-slate-500">No products in queue</p>
                <p className="text-xs text-slate-400 mt-1">Select a product and click "Add to Print List"</p>
              </div>
            ):(
              <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden">
                <div style={{display:'grid',gridTemplateColumns:`repeat(${layout.cols},1fr)`,gap:'4px',padding:'12px',background:'#f8fafc'}}>
                  {(()=>{
                    const all: BItem[]=[]
                    list.forEach(item=>{for(let i=0;i<qty;i++) all.push(item)})
                    return all.slice(0,Math.min(20,layout.cols*4)).map((item,idx)=>(
                      <BarcodeLabel key={`${item.value}-${idx}`} item={item} config={config}/>
                    ))
                  })()}
                </div>
                {totalLabels>Math.min(20,layout.cols*4)&&(
                  <div className="text-center py-3 text-xs text-slate-400 bg-slate-50 border-t border-slate-200">
                    + {totalLabels-Math.min(20,layout.cols*4)} more labels will appear in print
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden print area */}
      <div className="hidden">
        <PrintArea ref={printRef} items={list} qty={qty} paperSize={paper} config={config}/>
      </div>
    </div>
  )
}
