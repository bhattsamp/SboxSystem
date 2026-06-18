const Product = require('../models/Product')
const Stock   = require('../models/Stock')
const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')
const path    = require('path')
const fs      = require('fs')

// GET all products
exports.getAll = async (req, res) => {
  const { page = 1, limit = 15, search = '', category, brand, isActive, sort = '-createdAt' } = req.query
  const query = {}
  if (search)   query.name = { $regex: search, $options: 'i' }
  if (category) query.category = category
  if (brand)    query.brand    = brand
  if (isActive !== undefined) query.isActive = isActive === 'true'

  const [docs, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('unit', 'name shortName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Product.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Product.findById(req.params.id).populate('category brand unit')
  if (!doc) return sendError(res, 'Product not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { name, description, category, brand, unit, alertQuantity, isActive } = req.body
  const data = { name, description, category, brand, unit, alertQuantity, isActive }
  if (req.file) data.image = `/uploads/products/${req.file.filename}`

  const product = await Product.create(data)
  sendSuccess(res, product, 'Product created', 201)
}

// UPDATE
exports.update = async (req, res) => {
  const { name, description, category, brand, unit, alertQuantity, isActive } = req.body
  const data = { name, description, category, brand, unit, alertQuantity, isActive }

  if (req.file) {
    data.image = `/uploads/products/${req.file.filename}`
    const old = await Product.findById(req.params.id)
    if (old?.image) {
      const oldPath = path.join(__dirname, '../../', old.image)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    .populate('category brand unit')
  if (!product) return sendError(res, 'Product not found', 404)
  sendSuccess(res, product, 'Product updated')
}

// DELETE
exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return sendError(res, 'Product not found', 404)
  await Stock.deleteMany({ product: req.params.id })
  if (product.image) {
    const imgPath = path.join(__dirname, '../../', product.image)
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
  }
  sendSuccess(res, {}, 'Product deleted')
}

// GET stock for a product
exports.getStock = async (req, res) => {
  const stock = await Stock.find({ product: req.params.id }).populate('warehouse', 'name')
  sendSuccess(res, stock)
}
