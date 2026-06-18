import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VoucherLayout from '@/components/voucher/VoucherLayout'
import { saleReturnApi } from '@/api'

export default function SaleReturnVoucherPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  useEffect(() => {
    saleReturnApi.getById(id!)
      .then(res => setDoc(res.data.data || res.data))
      .catch(() => setError('Failed to load sale return'))
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
      docType="CREDIT NOTE"
      docNo={doc.referenceNo}
      docDate={doc.createdAt}
      status={doc.status}
      from={{ label: 'Returned By (Customer)', name: doc.customer?.name || '—', phone: doc.customer?.phone, email: doc.customer?.email, address: doc.customer?.address }}
      to={{ label: 'Received By', name: 'InfyPOS', address: 'Main Business Office' }}
      warehouse={doc.warehouse?.name}
      items={items}
      subtotal={doc.subtotal || doc.grandTotal}
      grandTotal={doc.grandTotal}
      notes={doc.note}
      extraMeta={[
        doc.sale?.invoiceNo ? { label: 'Invoice Ref',    value: doc.sale.invoiceNo } : null,
        doc.reason          ? { label: 'Return Reason',  value: doc.reason         } : null,
      ].filter(Boolean) as { label: string; value: string }[]}
    />
  )
}
