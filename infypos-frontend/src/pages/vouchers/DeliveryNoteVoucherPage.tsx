import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { deliveryNoteApi } from '@/api'
import { formatDate } from '@/utils/date'

export default function DeliveryNoteVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    deliveryNoteApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load delivery note'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || '—',
    sku:   item.sku,
    qty:   item.deliveredQty ?? item.orderedQty ?? item.quantity,
    price: item.sellingPrice || item.price || 0,
    total: (item.deliveredQty ?? item.orderedQty ?? 0) * (item.sellingPrice || item.price || 0),
  }))

  const grandTotal = doc.grandTotal || items.reduce((s: number, i: any) => s + i.total, 0)

  return (
    <VoucherLayout
      docType="DELIVERY NOTE"
      docNo={doc.deliveryNo}
      docDate={doc.deliveryDate || doc.createdAt}
      status={doc.status}
      from={{ label: 'Dispatched From', name: doc.warehouse?.name || 'Main Warehouse' }}
      to={{ label: 'Deliver To (Customer)', name: doc.customer?.name || '—', phone: doc.customer?.phone, email: doc.customer?.email, address: doc.customer?.address }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={grandTotal}
      grandTotal={grandTotal}
      notes={doc.note}
      extraMeta={[
        doc.salesOrder?.orderNo ? { label: 'Sales Order Ref', value: doc.salesOrder.orderNo } : null,
        doc.sale?.invoiceNo     ? { label: 'Invoice Ref',     value: doc.sale.invoiceNo     } : null,
        doc.deliveryDate        ? { label: 'Delivery Date',   value: formatDate(doc.deliveryDate) } : null,
        { label: 'Status', value: doc.status || '—' },
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
