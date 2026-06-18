const SaleReturn = require('../models/SaleReturn')
const Stock       = require('../models/Stock')
const { generateRefNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', customer, warehouse, sort='-createdAt' } = req.query
  const query = {}
  if (search)    query.referenceNo = { $regex: search, $options: 'i' }
  if (customer)  query.customer    = customer
  if (warehouse) query.warehouse   = warehouse

  const [docs, total] = await Promise.all([
    SaleReturn.find(query).populate('customer','name').populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    SaleReturn.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await SaleReturn.findById(req.params.id).populate('sale customer warehouse createdBy')
  if (!doc) return sendError(res, 'Sale return not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, sale=null, customer=null, reason='', note='' } = req.body

  const referenceNo = await generateRefNo(SaleReturn, 'SRET')
  const totalAmount = items.reduce((s, i) => s + i.total, 0)

  const saleReturn = await SaleReturn.create({
    referenceNo, warehouse, sale, customer, items, totalAmount, reason, note,
    createdBy: req.user._id,
  })

  // Stock returns from customer
  for (const item of items) {
    await Stock.adjust(item.product, warehouse, item.quantity)
  }

  const populated = await SaleReturn.findById(saleReturn._id).populate('sale customer warehouse createdBy','name')
  sendSuccess(res, populated, 'Sale return created', 201)
}

// DELETE
exports.remove = async (req, res) => {
  const saleReturn = await SaleReturn.findById(req.params.id)
  if (!saleReturn) return sendError(res, 'Sale return not found', 404)

  // Reverse stock
  for (const item of saleReturn.items) {
    await Stock.adjust(item.product, saleReturn.warehouse, -item.quantity)
  }

  await SaleReturn.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Sale return deleted')
}
