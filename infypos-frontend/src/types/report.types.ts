export interface ReportFilter {
  startDate: string
  endDate: string
  warehouse?: string
  product?: string
  category?: string
  customer?: string
  supplier?: string
  status?: string
  paymentStatus?: string
}

export interface SalesReportRow {
  _id: string
  invoiceNo: string
  customer: string
  items: number
  grandTotal: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
  createdAt: string
}

export interface StockReportRow {
  _id: string
  product: string
  sku: string
  category: string
  warehouse: string
  quantity: number
  alertQuantity: number
  status: 'ok' | 'low' | 'out'
}
