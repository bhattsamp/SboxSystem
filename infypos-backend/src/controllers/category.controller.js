const { Category } = require('../models/Category')
const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// GET /categories/tree — root categories with their subcategories nested
const getTree = async (req, res) => {
  const roots = await Category.find({ parentCategory: null, isActive: true }).sort('name').lean()
  const ids = roots.map(c => c._id)
  const subs = await Category.find({ parentCategory: { $in: ids } }).sort('name').lean()

  const tree = roots.map(root => ({
    ...root,
    subcategories: subs.filter(s => String(s.parentCategory) === String(root._id)),
  }))

  sendSuccess(res, tree)
}

// GET /categories — flat list, supports ?parentCategory=null|<id>
const getAll = async (req, res) => {
  const { page = 1, limit = 15, search = '', sort = '-createdAt', isActive, parentCategory } = req.query
  const query = {}

  if (search) query.name = { $regex: search, $options: 'i' }
  if (isActive !== undefined) query.isActive = isActive === 'true'

  if (parentCategory === 'null') query.parentCategory = null
  else if (parentCategory) query.parentCategory = parentCategory

  const [docs, total] = await Promise.all([
    Category.find(query).populate('parentCategory', 'name').sort(sort).skip((page - 1) * limit).limit(parseInt(limit)),
    Category.countDocuments(query),
  ])

  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

const getOne = async (req, res) => {
  const doc = await Category.findById(req.params.id).populate('parentCategory', 'name')
  if (!doc) return sendError(res, 'Category not found', 404)
  sendSuccess(res, doc)
}

const create = async (req, res) => {
  const { name, description, image, parentCategory, isActive } = req.body
  const doc = await Category.create({ name, description, image, parentCategory: parentCategory || null, isActive })
  await doc.populate('parentCategory', 'name')
  sendSuccess(res, doc, 'Category created', 201)
}

const update = async (req, res) => {
  const { name, description, image, parentCategory, isActive } = req.body
  const payload = { name, description, image, isActive }
  // Explicitly allow setting parentCategory to null (root) or another id
  if ('parentCategory' in req.body) payload.parentCategory = parentCategory || null

  const doc = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('parentCategory', 'name')
  if (!doc) return sendError(res, 'Category not found', 404)
  sendSuccess(res, doc, 'Category updated')
}

const remove = async (req, res) => {
  // Prevent deleting a category that has subcategories
  const childCount = await Category.countDocuments({ parentCategory: req.params.id })
  if (childCount > 0) return sendError(res, 'Delete all subcategories first', 400)

  const doc = await Category.findByIdAndDelete(req.params.id)
  if (!doc) return sendError(res, 'Category not found', 404)
  sendSuccess(res, {}, 'Category deleted')
}

module.exports = { getTree, getAll, getOne, create, update, remove }
