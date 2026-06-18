const Purchase = require('../models/Purchase')
const Stock    = require('../models/Stock')
const { generateRefNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', status, paymentStatus, supplier, documentType, sort='-createdAt' } = req.query
  const query = {}
  if (search)        query.referenceNo   = { $regex: search, $options: 'i' }
  if (status)        query.status        = status
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (supplier)      query.supplier      = supplier
  if (documentType)  query.documentType  = documentType

  const [docs, total] = await Promise.all([
    Purchase.find(query).populate('supplier','name').populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Purchase.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

exports.getOne = async (req, res) => {
  const doc = await Purchase.findById(req.params.id).populate('supplier warehouse createdBy')
  if (!doc) return sendError(res, 'Purchase not found', 404)
  sendSuccess(res, doc)
}

exports.create = async (req, res) => {
  const { items, warehouse, paidAmount=0, ...rest } = req.body
  const referenceNo = await generateRefNo(Purchase, 'PO')
  const subtotal    = items.reduce((s, i) => s + i.total, 0)
  const taxAmount   = items.reduce((s, i) => s + (i.taxAmount || 0), 0)
  const grandTotal  = subtotal + taxAmount + (rest.shippingCost || 0)

  const purchase = await Purchase.create({
    ...rest, items, warehouse, referenceNo, subtotal, taxAmount, grandTotal,
    paidAmount: parseFloat(paidAmount) || 0,
    createdBy: req.user._id,
  })

  // Add stock if status is received
  if (rest.status === 'received') {
    for (const item of items) {
      await Stock.adjust(item.product, warehouse, item.quantity)
    }
  }

  sendSuccess(res, purchase, 'Purchase created', 201)
}

exports.update = async (req, res) => {
  const old      = await Purchase.findById(req.params.id)
  if (!old) return sendError(res, 'Purchase not found', 404)

  const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true })

  // If status changed to received, add stock
  if (old.status !== 'received' && purchase.status === 'received') {
    for (const item of purchase.items) {
      await Stock.adjust(item.product, purchase.warehouse, item.quantity)
    }
  }

  sendSuccess(res, purchase, 'Purchase updated')
}

exports.remove = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
  if (!purchase) return sendError(res, 'Purchase not found', 404)
  // Reverse stock if was received
  if (purchase.status === 'received') {
    for (const item of purchase.items) {
      await Stock.adjust(item.product, purchase.warehouse, -item.quantity)
    }
  }
  await Purchase.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Purchase deleted')
}

exports.addPayment = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
  if (!purchase) return sendError(res, 'Purchase not found', 404)
  const { amount, method='cash' } = req.body
  purchase.paidAmount += parseFloat(amount)
  await purchase.save()
  sendSuccess(res, purchase, 'Payment recorded')
}
