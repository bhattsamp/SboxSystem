const PurchaseReturn = require('../models/PurchaseReturn')
const Stock           = require('../models/Stock')
const { generateRefNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', supplier, warehouse, sort='-createdAt' } = req.query
  const query = {}
  if (search)    query.referenceNo = { $regex: search, $options: 'i' }
  if (supplier)  query.supplier    = supplier
  if (warehouse) query.warehouse   = warehouse

  const [docs, total] = await Promise.all([
    PurchaseReturn.find(query).populate('supplier','name').populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    PurchaseReturn.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await PurchaseReturn.findById(req.params.id).populate('purchase supplier warehouse createdBy')
  if (!doc) return sendError(res, 'Purchase return not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, purchase=null, supplier=null, reason='', note='' } = req.body

  const referenceNo = await generateRefNo(PurchaseReturn, 'PRET')
  const totalAmount = items.reduce((s, i) => s + i.total, 0)

  const purchaseReturn = await PurchaseReturn.create({
    referenceNo, warehouse, purchase, supplier, items, totalAmount, reason, note,
    createdBy: req.user._id,
  })

  // Stock leaves to supplier
  for (const item of items) {
    await Stock.adjust(item.product, warehouse, -item.quantity)
  }

  const populated = await PurchaseReturn.findById(purchaseReturn._id).populate('purchase supplier warehouse createdBy','name')
  sendSuccess(res, populated, 'Purchase return created', 201)
}

// DELETE
exports.remove = async (req, res) => {
  const purchaseReturn = await PurchaseReturn.findById(req.params.id)
  if (!purchaseReturn) return sendError(res, 'Purchase return not found', 404)

  // Reverse stock
  for (const item of purchaseReturn.items) {
    await Stock.adjust(item.product, purchaseReturn.warehouse, item.quantity)
  }

  await PurchaseReturn.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Purchase return deleted')
}
