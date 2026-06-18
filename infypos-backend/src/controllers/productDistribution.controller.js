const ProductDistribution = require('../models/ProductDistribution')
const Stock  = require('../models/Stock')
const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

const POPULATE = [
  { path: 'product',       select: 'name category brand unit image alertQuantity' },
  { path: 'warehouse',     select: 'name branch' },
  { path: 'tax',           select: 'name rate' },
  { path: 'alternateUnit', select: 'name shortName' },
]

// GET all
exports.getAll = async (req, res) => {
  const { page = 1, limit = 15, search = '', warehouse, product, isActive, sort = '-createdAt' } = req.query
  const query = {}

  if (search)   query.sku = { $regex: search, $options: 'i' }
  if (warehouse) query.warehouse = warehouse
  if (product)   query.product   = product
  if (isActive !== undefined) query.isActive = isActive === 'true'

  const [docs, total] = await Promise.all([
    ProductDistribution.find(query).populate(POPULATE).sort(sort).skip((page - 1) * limit).limit(parseInt(limit)),
    ProductDistribution.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await ProductDistribution.findById(req.params.id).populate(POPULATE)
  if (!doc) return sendError(res, 'Distribution not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { product, warehouse, sku, barcode, barcodeSymbology, purchasePrice, salePrice, mrp, taxRate, tax, openingStock, alternateUnit, alternateUnitFactor, isActive } = req.body

  if (!barcode) req.body.barcode = Date.now().toString()

  const dist = await ProductDistribution.create({
    product, warehouse, sku,
    barcode: req.body.barcode,
    barcodeSymbology, purchasePrice, salePrice, mrp, taxRate, tax,
    openingStock: openingStock || 0,
    alternateUnit: alternateUnit || null,
    alternateUnitFactor: alternateUnitFactor || 1,
    isActive,
  })

  // Create stock entry for opening stock
  if (parseInt(openingStock) > 0) {
    await Stock.findOneAndUpdate(
      { product, warehouse },
      { $inc: { quantity: parseInt(openingStock) } },
      { upsert: true, new: true }
    )
  }

  await dist.populate(POPULATE)
  sendSuccess(res, dist, 'Distribution created', 201)
}

// UPDATE
exports.update = async (req, res) => {
  const { sku, barcode, barcodeSymbology, purchasePrice, salePrice, mrp, taxRate, tax, alternateUnit, alternateUnitFactor, isActive } = req.body
  const dist = await ProductDistribution.findByIdAndUpdate(
    req.params.id,
    { sku, barcode, barcodeSymbology, purchasePrice, salePrice, mrp, taxRate, tax,
      alternateUnit: alternateUnit || null, alternateUnitFactor: alternateUnitFactor || 1, isActive },
    { new: true, runValidators: true }
  ).populate(POPULATE)
  if (!dist) return sendError(res, 'Distribution not found', 404)
  sendSuccess(res, dist, 'Distribution updated')
}

// DELETE
exports.remove = async (req, res) => {
  const dist = await ProductDistribution.findByIdAndDelete(req.params.id)
  if (!dist) return sendError(res, 'Distribution not found', 404)
  sendSuccess(res, {}, 'Distribution deleted')
}
