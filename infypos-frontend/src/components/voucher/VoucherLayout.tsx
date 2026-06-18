import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePrinter, HiOutlineArrowLeft } from 'react-icons/hi'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export interface VoucherItem {
  name: string
  sku?: string
  qty: number
  unit?: string
  price: number
  discount?: number
  taxRate?: number
  total: number
}

export interface VoucherParty {
  label: string
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface VoucherLayoutProps {
  docType: string
  docNo: string
  docDate: string
  status?: string
  from: VoucherParty
  to?: VoucherParty
  warehouse?: string
  items: VoucherItem[]
  subtotal: number
  taxAmount?: number
  discountAmount?: number
  shippingCost?: number
  grandTotal: number
  paidAmount?: number
  dueAmount?: number
  paymentMethod?: string
  notes?: string
  extraMeta?: { label: string; value: string }[]
}

export default function VoucherLayout(props: VoucherLayoutProps) {
  const navigate = useNavigate()
  const {
    docType, docNo, docDate, status,
    from, to, warehouse,
    items, subtotal, taxAmount = 0, discountAmount = 0, shippingCost = 0,
    grandTotal, paidAmount, dueAmount, paymentMethod,
    notes, extraMeta,
  } = props

  const hasDiscount = items.some(i => (i.discount || 0) > 0) || discountAmount > 0
  const hasTax      = items.some(i => (i.taxRate || 0) > 0) || taxAmount > 0

  return (
    <div className="voucher-root">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0 !important; background: white !important; }
          .voucher-paper { box-shadow: none !important; margin: 0 !important; page-break-inside: avoid; }
          .voucher-root { padding: 0 !important; }
        }
        .voucher-root { background: #f1f5f9; min-height: 100vh; padding: 24px 16px; }
        .voucher-paper {
          width: 100%; max-width: 780px; margin: 0 auto;
          background: white;
          box-shadow: 0 4px 32px rgba(0,0,0,.14);
          border-radius: 12px;
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, Arial, sans-serif;
          font-size: 12px;
          color: #1e293b;
        }
        .v-header { background: #0f172a; color: white; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
        .v-body { padding: 28px 36px; }
        .v-doc-badge { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 8px; padding: 10px 16px; text-align: right; }
        .v-party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .v-party-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .v-party-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px; }
        .v-party-name { font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 3px; }
        .v-party-detail { font-size: 11px; color: #64748b; line-height: 1.5; }
        .v-meta-bar { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 20px; }
        .v-meta-item { font-size: 11px; }
        .v-meta-label { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #60a5fa; }
        .v-meta-value { font-weight: 600; color: #1e40af; }
        .v-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .v-table thead tr { background: #0f172a; color: white; }
        .v-table th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
        .v-table th:last-child, .v-table td:last-child { text-align: right; }
        .v-table th.center, .v-table td.center { text-align: center; }
        .v-table tbody tr:nth-child(even) { background: #f8fafc; }
        .v-table tbody tr:nth-child(odd) { background: white; }
        .v-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        .v-table tfoot td { padding: 8px 12px; font-size: 11px; }
        .v-totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .v-totals-box { width: 240px; }
        .v-total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
        .v-total-label { color: #64748b; }
        .v-total-grand { border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 8px; font-size: 14px; font-weight: 900; }
        .v-notes { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 24px; }
        .v-sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; border-top: 2px solid #e2e8f0; padding-top: 24px; margin-top: 8px; }
        .v-sig-line { height: 40px; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px; }
        .v-sig-label { text-align: center; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; }
        .v-footer { text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding: 14px; }
      `}</style>

      {/* Action toolbar */}
      <div className="no-print" style={{ maxWidth: 780, margin: '0 auto 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', fontWeight: 500, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>
          <HiOutlineArrowLeft style={{ width: 16, height: 16 }} /> Back
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'white', fontWeight: 600, background: '#2563eb', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer' }}>
            <HiOutlinePrinter style={{ width: 16, height: 16 }} /> Print Voucher
          </button>
        </div>
      </div>

      <div className="voucher-paper">
        {/* Header bar */}
        <div className="v-header">
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>InfyPOS</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Point of Sale &amp; Inventory System</div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>admin@infypos.com</div>
          </div>
          <div className="v-doc-badge">
            <div style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>{docType}</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.5px' }}>{docNo}</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>Date: {formatDate(docDate)}</div>
            {status && (
              <div style={{ marginTop: 6 }}>
                <span style={{ background: 'rgba(74,222,128,.2)', color: '#86efac', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100 }}>
                  {status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="v-body">
          {/* Party info */}
          <div className="v-party-grid">
            <div className="v-party-box">
              <div className="v-party-label">{from.label}</div>
              <div className="v-party-name">{from.name}</div>
              {from.phone   && <div className="v-party-detail">Ph: {from.phone}</div>}
              {from.email   && <div className="v-party-detail">{from.email}</div>}
              {from.address && <div className="v-party-detail">{from.address}</div>}
            </div>
            <div className="v-party-box">
              {to ? (
                <>
                  <div className="v-party-label">{to.label}</div>
                  <div className="v-party-name">{to.name}</div>
                  {to.phone   && <div className="v-party-detail">Ph: {to.phone}</div>}
                  {to.email   && <div className="v-party-detail">{to.email}</div>}
                  {to.address && <div className="v-party-detail">{to.address}</div>}
                  {warehouse  && <div className="v-party-detail" style={{ marginTop: 4, color: '#0f172a', fontWeight: 600 }}>Warehouse: {warehouse}</div>}
                </>
              ) : (
                <>
                  <div className="v-party-label">Warehouse</div>
                  <div className="v-party-name">{warehouse || 'Main Warehouse'}</div>
                </>
              )}
            </div>
          </div>

          {/* Extra meta */}
          {extraMeta && extraMeta.length > 0 && (
            <div className="v-meta-bar">
              {extraMeta.map(m => (
                <div key={m.label} className="v-meta-item">
                  <div className="v-meta-label">{m.label}</div>
                  <div className="v-meta-value">{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Items table */}
          <table className="v-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th className="center">Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                {hasDiscount && <th style={{ textAlign: 'right' }}>Discount</th>}
                {hasTax      && <th className="center">Tax%</th>}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: 10 }}>{item.sku || '—'}</td>
                  <td className="center" style={{ fontWeight: 700 }}>{item.qty}{item.unit ? ` ${item.unit}` : ''}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  {hasDiscount && <td style={{ textAlign: 'right', color: item.discount ? '#ef4444' : '#94a3b8' }}>{item.discount ? formatCurrency(item.discount) : '—'}</td>}
                  {hasTax && <td className="center" style={{ color: '#94a3b8' }}>{item.taxRate ? `${item.taxRate}%` : '—'}</td>}
                  <td style={{ fontWeight: 700 }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="v-totals">
            <div className="v-totals-box">
              <div className="v-total-row">
                <span className="v-total-label">Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="v-total-row">
                  <span className="v-total-label">Discount</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="v-total-row">
                  <span className="v-total-label">Tax</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="v-total-row">
                  <span className="v-total-label">Shipping</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(shippingCost)}</span>
                </div>
              )}
              <div className="v-total-row v-total-grand">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              {paidAmount !== undefined && (
                <div className="v-total-row" style={{ marginTop: 6 }}>
                  <span className="v-total-label">Paid</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{formatCurrency(paidAmount)}</span>
                </div>
              )}
              {dueAmount !== undefined && dueAmount > 0 && (
                <div className="v-total-row">
                  <span className="v-total-label">Due</span>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>{formatCurrency(dueAmount)}</span>
                </div>
              )}
              {paymentMethod && (
                <div className="v-total-row">
                  <span className="v-total-label">Payment</span>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{paymentMethod}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="v-notes">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{notes}</div>
            </div>
          )}

          {/* Signature lines */}
          <div className="v-sig-grid">
            {['Prepared By', 'Checked By', 'Authorized By'].map(label => (
              <div key={label}>
                <div className="v-sig-line" />
                <div className="v-sig-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="v-footer">
          Generated by InfyPOS &nbsp;·&nbsp; {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}
