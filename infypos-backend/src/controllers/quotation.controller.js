const Quotation = require('../models/Quotation')
const Sale       = require('../models/Sale')
const Stock      = require('../models/Stock')
const { generateRefNo, generateInvoiceNo, paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET all
exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', status, customer, warehouse, sort='-createdAt' } = req.query
  const query = {}
  if (search)   query.quotationNo = { $regex: search, $options: 'i' }
  if (status)   query.status      = status
  if (customer) query.customer    = customer
  if (warehouse)query.warehouse   = warehouse

  const [docs, total] = await Promise.all([
    Quotation.find(query).populate('customer','name email phone').populate('warehouse','name').populate('createdBy','name').sort(sort).skip((page-1)*limit).limit(parseInt(limit)),
    Quotation.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Quotation.findById(req.params.id).populate('customer warehouse createdBy','name email phone')
  if (!doc) return sendError(res, 'Quotation not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, customer, ...rest } = req.body

  const quotationNo = await generateRefNo(Quotation, 'QUO')
  const subtotal    = items.reduce((s, i) => s + i.subtotal, 0)
  const taxAmount   = items.reduce((s, i) => s + (i.taxAmount || 0), 0)
  const grandTotal  = subtotal + taxAmount + (rest.shippingCost || 0) - (rest.discountAmount || 0)

  const quotation = await Quotation.create({
    ...rest, items, warehouse, customer: customer || null,
    quotationNo, subtotal, taxAmount, grandTotal,
    createdBy: req.user._id,
  })

  const populated = await Quotation.findById(quotation._id).populate('customer warehouse createdBy','name email')
  sendSuccess(res, populated, 'Quotation created', 201)
}

// UPDATE
exports.update = async (req, res) => {
  const existing = await Quotation.findById(req.params.id)
  if (!existing) return sendError(res, 'Quotation not found', 404)

  const { items, ...rest } = req.body
  const update = { ...rest }

  if (items) {
    update.items     = items
    update.subtotal  = items.reduce((s, i) => s + i.subtotal, 0)
    update.taxAmount = items.reduce((s, i) => s + (i.taxAmount || 0), 0)
    update.grandTotal= update.subtotal + update.taxAmount + (rest.shippingCost ?? existing.shippingCost) - (rest.discountAmount ?? existing.discountAmount)
  }

  const quotation = await Quotation.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('customer warehouse createdBy','name email')
  sendSuccess(res, quotation, 'Quotation updated')
}

// DELETE
exports.remove = async (req, res) => {
  const quotation = await Quotation.findByIdAndDelete(req.params.id)
  if (!quotation) return sendError(res, 'Quotation not found', 404)
  sendSuccess(res, {}, 'Quotation deleted')
}

// CONVERT TO SALE
exports.convertToSale = async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
  if (!quotation) return sendError(res, 'Quotation not found', 404)
  if (quotation.status === 'converted') return sendError(res, 'Quotation already converted')

  // Validate stock
  for (const item of quotation.items) {
    const stock = await Stock.getQty(item.product, quotation.warehouse)
    if (stock < item.quantity) {
      return sendError(res, `Insufficient stock for "${item.name}". Available: ${stock}`)
    }
  }

  const invoiceNo = await generateInvoiceNo(Sale, 'INV')

  const sale = await Sale.create({
    invoiceNo,
    customer:   quotation.customer,
    warehouse:  quotation.warehouse,
    items:      quotation.items,
    subtotal:   quotation.subtotal,
    discountAmount: quotation.discountAmount,
    taxAmount:  quotation.taxAmount,
    shippingCost: quotation.shippingCost,
    grandTotal: quotation.grandTotal,
    note:       quotation.note,
    terms:      quotation.terms,
    createdBy:  req.user._id,
  })

  // Deduct stock
  for (const item of quotation.items) {
    await Stock.adjust(item.product, quotation.warehouse, -item.quantity)
  }

  quotation.status = 'converted'
  await quotation.save()

  const populated = await Sale.findById(sale._id).populate('customer warehouse createdBy','name email')
  sendSuccess(res, populated, 'Quotation converted to sale', 201)
}
