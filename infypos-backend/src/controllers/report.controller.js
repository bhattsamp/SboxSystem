const Sale     = require('../models/Sale')
const Purchase = require('../models/Purchase')
const Stock    = require('../models/Stock')
const Product  = require('../models/Product')
const { Expense } = require('../models/Expense')
const { paginateMeta } = require('../utils/helpers')

const dateRange = (startDate, endDate) => ({
  $gte: new Date(startDate || '2000-01-01'),
  $lte: new Date(endDate   || new Date()),
})

// Sales report
exports.getSalesReport = async (req, res) => {
  const { page=1, limit=15, startDate, endDate, warehouse, customer, paymentStatus, sort='-createdAt' } = req.query
  const query = { createdAt: dateRange(startDate, endDate) }
  if (warehouse)     query.warehouse     = warehouse
  if (customer)      query.customer      = customer
  if (paymentStatus) query.paymentStatus = paymentStatus

  const [docs, total, summary] = await Promise.all([
    Sale.find(query).populate('customer','name').populate('warehouse','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Sale.countDocuments(query),
    Sale.aggregate([
      { $match: query },
      { $group: { _id: null, totalSales: { $sum:'$grandTotal' }, totalReceived: { $sum:'$paidAmount' }, totalDue: { $sum:'$dueAmount' }, count: { $sum:1 } } },
    ]),
  ])

  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit), summary: summary[0] || {} })
}

// Purchase report
exports.getPurchaseReport = async (req, res) => {
  const { page=1, limit=15, startDate, endDate, warehouse, supplier, sort='-createdAt' } = req.query
  const query = { createdAt: dateRange(startDate, endDate) }
  if (warehouse) query.warehouse = warehouse
  if (supplier)  query.supplier  = supplier

  const [docs, total, summary] = await Promise.all([
    Purchase.find(query).populate('supplier','name').populate('warehouse','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Purchase.countDocuments(query),
    Purchase.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum:'$grandTotal' }, paid: { $sum:'$paidAmount' }, due: { $sum:'$dueAmount' } } }]),
  ])

  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit), summary: summary[0] || {} })
}

// Stock report
exports.getStockReport = async (req, res) => {
  const { warehouse, category, status } = req.query
  const productQuery = {}
  if (category) productQuery.category = category

  const products = await Product.find(productQuery).populate('category','name').populate('unit','name shortName')
  const rows = []
  for (const p of products) {
    const stockQuery = { product: p._id }
    if (warehouse) stockQuery.warehouse = warehouse
    const stocks = await Stock.find(stockQuery).populate('warehouse','name')
    const totalQty = stocks.reduce((s, st) => s + st.quantity, 0)
    const stockStatus = totalQty <= 0 ? 'out' : totalQty <= p.alertQuantity ? 'low' : 'ok'
    if (!status || status === stockStatus) {
      rows.push({ product: p, totalQuantity: totalQty, stocks, status: stockStatus })
    }
  }
  res.json({ success: true, data: rows })
}

// Profit & loss
exports.getProfitLoss = async (req, res) => {
  const { startDate, endDate } = req.query
  const range = dateRange(startDate, endDate)

  const [salesAgg, purchaseAgg, expenseAgg] = await Promise.all([
    Sale.aggregate([{ $match:{ createdAt: range } }, { $group:{ _id:null, revenue:{ $sum:'$grandTotal' } } }]),
    Purchase.aggregate([{ $match:{ createdAt: range } }, { $group:{ _id:null, cost:{ $sum:'$grandTotal' } } }]),
    Expense.aggregate([{ $match:{ date: range } }, { $group:{ _id:null, total:{ $sum:'$amount' } } }]),
  ])

  const revenue  = salesAgg[0]?.revenue    || 0
  const cost     = purchaseAgg[0]?.cost    || 0
  const expenses = expenseAgg[0]?.total    || 0
  const profit   = revenue - cost - expenses

  res.json({ success: true, data: { revenue, cost, expenses, profit, profitMargin: revenue > 0 ? ((profit/revenue)*100).toFixed(2) : 0 } })
}
