const Adjustment = require('../models/Adjustment')
const Stock       = require('../models/Stock')
const { generateRefNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', warehouse, sort='-createdAt' } = req.query
  const query = {}
  if (search)    query.referenceNo = { $regex: search, $options: 'i' }
  if (warehouse) query.warehouse   = warehouse

  const [docs, total] = await Promise.all([
    Adjustment.find(query).populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Adjustment.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Adjustment.findById(req.params.id).populate('warehouse createdBy','name')
  if (!doc) return sendError(res, 'Adjustment not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, reason='', note='' } = req.body

  const referenceNo = await generateRefNo(Adjustment, 'ADJ')
  const totalAmount = items.reduce((s, i) => s + (i.quantity * (i.unitCost || 0)), 0)

  const adjustment = await Adjustment.create({
    referenceNo, warehouse, items, totalAmount, reason, note,
    createdBy: req.user._id,
  })

  // Apply stock changes
  for (const item of items) {
    const qty = item.type === 'addition' ? item.quantity : -item.quantity
    await Stock.adjust(item.product, warehouse, qty)
  }

  const populated = await Adjustment.findById(adjustment._id).populate('warehouse createdBy','name')
  sendSuccess(res, populated, 'Adjustment created', 201)
}

// DELETE
exports.remove = async (req, res) => {
  const adjustment = await Adjustment.findById(req.params.id)
  if (!adjustment) return sendError(res, 'Adjustment not found', 404)

  // Reverse stock changes
  for (const item of adjustment.items) {
    const qty = item.type === 'addition' ? -item.quantity : item.quantity
    await Stock.adjust(item.product, adjustment.warehouse, qty)
  }

  await Adjustment.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Adjustment deleted')
}
