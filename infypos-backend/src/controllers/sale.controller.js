const Sale    = require('../models/Sale')
const Stock   = require('../models/Stock')
const { Customer } = require('../models/Customer')
const { generateInvoiceNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', status, paymentStatus, customer, warehouse, sort='-createdAt' } = req.query
  const query = {}
  if (search)        query.invoiceNo = { $regex: search, $options: 'i' }
  if (status)        query.status        = status
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (customer)      query.customer      = customer
  if (warehouse)     query.warehouse     = warehouse

  const [docs, total] = await Promise.all([
    Sale.find(query).populate('customer','name email phone').populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Sale.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Sale.findById(req.params.id).populate('customer warehouse createdBy','name email phone')
  if (!doc) return sendError(res, 'Sale not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, customer, paidAmount=0, ...rest } = req.body

  // Validate stock
  for (const item of items) {
    const stock = await Stock.getQty(item.product, warehouse)
    if (stock < item.quantity) {
      return sendError(res, `Insufficient stock for "${item.name}". Available: ${stock}`)
    }
  }

  const invoiceNo = await generateInvoiceNo(Sale, rest.invoicePrefix || 'INV')
  const subtotal  = items.reduce((s, i) => s + i.subtotal, 0)
  const taxAmount = items.reduce((s, i) => s + (i.taxAmount || 0), 0)
  const grandTotal= subtotal + taxAmount + (rest.shippingCost || 0) - (rest.discountAmount || 0)

  const sale = await Sale.create({
    ...rest, items, warehouse, customer: customer || null,
    invoiceNo, subtotal, taxAmount, grandTotal,
    paidAmount: parseFloat(paidAmount) || 0,
    createdBy: req.user._id,
    payments: paidAmount > 0 ? [{ amount: paidAmount, method: rest.paymentMethod || 'cash', date: new Date() }] : [],
  })

  // Deduct stock
  for (const item of items) {
    await Stock.adjust(item.product, warehouse, -item.quantity)
  }

  // Update customer outstanding
  if (customer && sale.dueAmount > 0) {
    await Customer.findByIdAndUpdate(customer, {
      $inc: { totalPurchased: grandTotal, outstanding: sale.dueAmount }
    })
  }

  const populated = await Sale.findById(sale._id).populate('customer warehouse createdBy', 'name email')
  sendSuccess(res, populated, 'Sale created', 201)
}

// UPDATE (status/payment only — items immutable after creation)
exports.update = async (req, res) => {
  const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!sale) return sendError(res, 'Sale not found', 404)
  sendSuccess(res, sale, 'Sale updated')
}

// DELETE
exports.remove = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
  if (!sale) return sendError(res, 'Sale not found', 404)
  // Restore stock
  for (const item of sale.items) {
    await Stock.adjust(item.product, sale.warehouse, item.quantity)
  }
  await Sale.findByIdAndDelete(req.params.id)
  sendSuccess(res, {}, 'Sale deleted')
}

// ADD PAYMENT
exports.addPayment = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
  if (!sale) return sendError(res, 'Sale not found', 404)
  const { amount, method='cash', reference='', note='' } = req.body
  sale.payments.push({ amount: parseFloat(amount), method, reference, note, date: new Date() })
  sale.paidAmount += parseFloat(amount)
  await sale.save()
  sendSuccess(res, sale, 'Payment recorded')
}
