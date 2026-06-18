import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { purchaseApi } from '@/api'

export default function PurchaseVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    purchaseApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load purchase'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#64748b' }}>Loading voucher…</div>
  if (error || !doc) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#ef4444' }}>{error || 'Voucher not found'}</div>

  const items = (doc.items || []).map((item: any) => ({
    name:  item.product?.name || item.productName || '—',
    sku:   item.sku,
    qty:   item.quantity,
    price: item.costPrice,
    total: item.total,
  }))

  return (
    <VoucherLayout
      docType="PURCHASE INVOICE"
      docNo={doc.referenceNo}
      docDate={doc.createdAt}
      status={doc.status}
      from={{ label: 'Supplier', name: doc.supplier?.name || '—', phone: doc.supplier?.phone, email: doc.supplier?.email, address: doc.supplier?.address }}
      to={{ label: 'Deliver To', name: 'InfyPOS', address: 'Main Business Office' }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={doc.subtotal}
      taxAmount={doc.taxAmount}
      shippingCost={doc.shippingCost}
      grandTotal={doc.grandTotal}
      paidAmount={doc.paidAmount}
      dueAmount={Math.max(0, doc.grandTotal - doc.paidAmount)}
      notes={doc.note}
      extraMeta={[
        { label: 'Payment Status', value: doc.paymentStatus || '—' },
        { label: 'Purchase Type',  value: doc.purchaseType  || 'regular' },
      ]}
    />
  )
}
