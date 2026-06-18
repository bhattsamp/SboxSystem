import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { salesOrderApi } from '@/api'

export default function SalesOrderVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    salesOrderApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load sales order'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || '—',
    sku:   item.sku,
    qty:   item.quantity,
    price: item.sellingPrice || item.price,
    total: item.total,
  }))

  return (
    <VoucherLayout
      docType="SALES ORDER"
      docNo={doc.orderNo}
      docDate={doc.createdAt}
      status={doc.status}
      from={{ label: 'Sold By', name: 'InfyPOS', address: 'Main Business Office', email: 'admin@infypos.com' }}
      to={{ label: 'Order For (Customer)', name: doc.customer?.name || '—', phone: doc.customer?.phone, email: doc.customer?.email, address: doc.customer?.address }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={doc.subtotal || doc.grandTotal}
      taxAmount={doc.taxAmount}
      grandTotal={doc.grandTotal}
      notes={doc.note}
      extraMeta={[
        doc.saleType    ? { label: 'Sale Type',    value: doc.saleType } : null,
        doc.voucherType ? { label: 'Voucher Type', value: typeof doc.voucherType === 'object' ? doc.voucherType.name : doc.voucherType } : null,
        doc.quotation   ? { label: 'Quotation Ref', value: typeof doc.quotation === 'object' ? doc.quotation.quoteNo : doc.quotation } : null,
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
