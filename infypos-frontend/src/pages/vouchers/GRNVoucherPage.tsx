import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { grnApi } from '@/api'
import { formatDate } from '@/utils/date'

export default function GRNVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    grnApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load GRN'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || '—',
    sku:   item.sku,
    qty:   item.receivedQty ?? item.orderedQty ?? item.quantity,
    unit:  item.unit,
    price: item.costPrice || 0,
    total: (item.receivedQty ?? item.orderedQty ?? 0) * (item.costPrice || 0),
  }))

  const grandTotal = doc.grandTotal || items.reduce((s: number, i: any) => s + i.total, 0)

  return (
    <VoucherLayout
      docType="GOODS RECEIPT NOTE"
      docNo={doc.grnNo}
      docDate={doc.receivedDate || doc.createdAt}
      status={doc.status}
      from={{ label: 'Received From', name: doc.supplier?.name || '—', phone: doc.supplier?.phone, email: doc.supplier?.email }}
      to={{ label: 'Received At', name: doc.warehouse?.name || 'Main Warehouse' }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={grandTotal}
      grandTotal={grandTotal}
      notes={doc.note}
      extraMeta={[
        doc.purchase?.referenceNo ? { label: 'Purchase Ref',   value: doc.purchase.referenceNo } : null,
        doc.receivedDate           ? { label: 'Received Date', value: formatDate(doc.receivedDate) } : null,
        { label: 'GRN Status', value: doc.status || '—' },
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
