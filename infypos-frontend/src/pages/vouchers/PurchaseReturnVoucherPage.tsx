import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { purchaseReturnApi } from '@/api'

export default function PurchaseReturnVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    purchaseReturnApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load purchase return'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || '—',
    sku:   item.sku,
    qty:   item.quantity,
    price: item.costPrice,
    total: item.total,
  }))

  return (
    <VoucherLayout
      docType="DEBIT NOTE"
      docNo={doc.referenceNo}
      docDate={doc.createdAt}
      status={doc.status}
      from={{ label: 'Return To (Supplier)', name: doc.supplier?.name || '—', phone: doc.supplier?.phone, email: doc.supplier?.email, address: doc.supplier?.address }}
      to={{ label: 'Returned From', name: 'InfyPOS', address: 'Main Business Office' }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={doc.subtotal || doc.grandTotal}
      grandTotal={doc.grandTotal}
      notes={doc.note}
      extraMeta={[
        doc.purchase?.referenceNo ? { label: 'Purchase Ref', value: doc.purchase.referenceNo } : null,
        doc.reason ? { label: 'Return Reason', value: doc.reason } : null,
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
