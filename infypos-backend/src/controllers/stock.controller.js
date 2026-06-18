const Stock   = require('../models/Stock')
const Product = require('../models/Product')
const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all stock
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', warehouse, category, status } = req.query
  const productQuery = {}
  if (search)   productQuery.$or = [{ name: { $regex: search, $options:'i' } }, { sku: { $regex: search, $options:'i' } }]
  if (category) productQuery.category = category

  const products = await Product.find(productQuery).select('_id alertQuantity')
  const productIds = products.map(p => p._id)

  const stockQuery = { product: { $in: productIds } }
  if (warehouse) stockQuery.warehouse = warehouse

  const [docs, total] = await Promise.all([
    Stock.find(stockQuery).populate({ path:'product', select:'name sku alertQuantity', populate:{ path:'category', select:'name' } }).populate('warehouse','name').skip((page-1)*limit).limit(parseInt(limit)),
    Stock.countDocuments(stockQuery),
  ])

  // Filter by status if provided
  let filtered = docs
  if (status === 'low')  filtered = docs.filter(s => s.quantity > 0 && s.quantity <= s.product?.alertQuantity)
  if (status === 'out')  filtered = docs.filter(s => s.quantity <= 0)
  if (status === 'ok')   filtered = docs.filter(s => s.quantity > (s.product?.alertQuantity || 5))

  res.json({ success: true, data: filtered, meta: paginateMeta(total, page, limit) })
}

// Adjust stock manually
exports.adjust = async (req, res) => {
  const { product, warehouse, quantity, type='add', note='' } = req.body
  const qty = type === 'add' ? Math.abs(quantity) : -Math.abs(quantity)
  const stock = await Stock.adjust(product, warehouse, qty)
  sendSuccess(res, stock, 'Stock adjusted')
}

// Transfer between warehouses
exports.transfer = async (req, res) => {
  const { product, fromWarehouse, toWarehouse, quantity } = req.body
  const fromStock = await Stock.getQty(product, fromWarehouse)
  if (fromStock < quantity) return sendError(res, `Insufficient stock. Available: ${fromStock}`)
  await Stock.adjust(product, fromWarehouse, -quantity)
  await Stock.adjust(product, toWarehouse, quantity)
  sendSuccess(res, {}, 'Stock transferred')
}

// Low stock alert
exports.getLowStock = async (req, res) => {
  const products = await Product.find({ isActive: true }).select('_id alertQuantity name sku')
  const results = []
  for (const p of products) {
    const stocks = await Stock.find({ product: p._id })
    const totalQty = stocks.reduce((s, st) => s + st.quantity, 0)
    if (totalQty <= p.alertQuantity) {
      results.push({ product: p, totalQuantity: totalQty, alertQuantity: p.alertQuantity })
    }
  }
  sendSuccess(res, results)
}
