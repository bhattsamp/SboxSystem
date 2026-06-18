import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { holdApi } from '@/api'

export default function HoldVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    holdApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load hold'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || item.productName || '—',
    sku:   item.sku,
    qty:   item.quantity,
    price: item.sellingPrice || item.price || 0,
    total: item.total || item.quantity * (item.sellingPrice || item.price || 0),
  }))

  const grandTotal = doc.grandTotal || items.reduce((s: number, i: any) => s + i.total, 0)

  return (
    <VoucherLayout
      docType="HOLD RECEIPT"
      docNo={doc.holdNo || doc.referenceNo || `HOLD-${doc._id?.slice(-6).toUpperCase()}`}
      docDate={doc.createdAt}
      status="ON HOLD"
      from={{ label: 'Held By', name: 'InfyPOS', address: 'Main Business Office', email: 'admin@infypos.com' }}
      to={{ label: 'Customer', name: doc.customer?.name || doc.customerName || 'Walk-in Customer', phone: doc.customer?.phone, email: doc.customer?.email }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={grandTotal}
      grandTotal={grandTotal}
      notes={doc.note || 'This order is on hold and has not been invoiced yet.'}
      extraMeta={[
        { label: 'Hold Status', value: 'ON HOLD — Not yet invoiced' },
      ]}
    />
  )
}
