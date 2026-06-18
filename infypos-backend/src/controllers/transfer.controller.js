const Transfer = require('../models/Transfer')
const Stock     = require('../models/Stock')
const { generateRefNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', sort='-createdAt' } = req.query
  const query = {}
  if (search) query.referenceNo = { $regex: search, $options: 'i' }

  const [docs, total] = await Promise.all([
    Transfer.find(query).populate('fromWarehouse toWarehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Transfer.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Transfer.findById(req.params.id).populate('fromWarehouse toWarehouse createdBy','name')
  if (!doc) return sendError(res, 'Transfer not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, fromWarehouse, toWarehouse, note='' } = req.body

  if (fromWarehouse === toWarehouse) {
    return sendError(res, 'Source and destination warehouses must be different')
  }

  // Validate stock availability
  for (const item of items) {
    const stock = await Stock.getQty(item.product, fromWarehouse)
    if (stock < item.quantity) {
      return sendError(res, `Insufficient stock for "${item.name}". Available: ${stock}`)
    }
  }

  const referenceNo = await generateRefNo(Transfer, 'TR')

  const transfer = await Transfer.create({
    referenceNo, fromWarehouse, toWarehouse, items, note,
    status: 'completed',
    createdBy: req.user._id,
  })

  // Move stock
  for (const item of items) {
    await Stock.adjust(item.product, fromWarehouse, -item.quantity)
    await Stock.adjust(item.product, toWarehouse, item.quantity)
  }

  const populated = await Transfer.findById(transfer._id).populate('fromWarehouse toWarehouse createdBy','name')
  sendSuccess(res, populated, 'Transfer created', 201)
}

// DELETE
exports.remove = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)
  if (!transfer) return sendError(res, 'Transfer not found', 404)

  // Reverse stock movement
  for (const item of transfer.items) {
    await Stock.adjust(item.product, transfer.fromWarehouse, item.quantity)
    await Stock.adjust(item.product, transfer.toWarehouse, -item.quantity)
  }

  await Transfer.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Transfer deleted')
}
