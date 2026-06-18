import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { salesApi } from '@/api'

export default function SalesVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    salesApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load sale'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:     item.product?.name || item.productName || '—',
    sku:      item.sku,
    qty:      item.quantity,
    price:    item.sellingPrice || item.price,
    discount: item.discount,
    taxRate:  item.taxRate,
    total:    item.total,
  }))

  return (
    <VoucherLayout
      docType="SALES INVOICE"
      docNo={doc.invoiceNo}
      docDate={doc.createdAt}
      status={doc.paymentStatus}
      from={{ label: 'Sold By', name: 'InfyPOS', address: 'Main Business Office', email: 'admin@infypos.com' }}
      to={{ label: 'Bill To (Customer)', name: doc.customer?.name || doc.customerName || 'Walk-in Customer', phone: doc.customer?.phone, email: doc.customer?.email, address: doc.customer?.address }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={doc.subtotal}
      taxAmount={doc.taxAmount}
      discountAmount={doc.discountAmount}
      grandTotal={doc.grandTotal}
      paidAmount={doc.paidAmount}
      dueAmount={Math.max(0, doc.grandTotal - (doc.paidAmount || 0))}
      paymentMethod={doc.paymentMethod}
      notes={doc.note}
      extraMeta={[
        doc.saleType    ? { label: 'Sale Type',    value: doc.saleType    } : null,
        doc.voucherType ? { label: 'Voucher Type', value: typeof doc.voucherType === 'object' ? doc.voucherType.name : doc.voucherType } : null,
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
