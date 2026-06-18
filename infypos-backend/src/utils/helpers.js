// Generate invoice number
exports.generateInvoiceNo = async (Model, prefix = 'INV') => {
  const count = await Model.countDocuments()
  const num   = String(count + 1).padStart(6, '0')
  return `${prefix}-${num}`
}

// Generate reference number
exports.generateRefNo = async (Model, prefix = 'PO') => {
  const count = await Model.countDocuments()
  const num   = String(count + 1).padStart(6, '0')
  return `${prefix}-${num}`
}

// Pagination helper
exports.paginate = (query, page = 1, limit = 15) => {
  const skip = (page - 1) * limit
  return query.skip(skip).limit(limit)
}

// Build pagination meta
exports.paginateMeta = (total, page, limit) => ({
  total,
  page:        parseInt(page),
  limit:       parseInt(limit),
  totalPages:  Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
})

// Success response
exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data })
}

// Error response
exports.sendError = (res, message = 'Error', statusCode = 400) => {
  res.status(statusCode).json({ success: false, message })
}

// Calculate totals for sale/purchase items
exports.calcItemTotal = (qty, price, discountAmt = 0, taxRate = 0) => {
  const subtotal  = qty * price
  const afterDisc = subtotal - discountAmt
  const taxAmount = (afterDisc * taxRate) / 100
  return { subtotal, taxAmount, total: afterDisc + taxAmount }
}
