const Language = require('../models/Language')
const { sendSuccess, sendError, paginateMeta } = require('../utils/helpers')

const getAll = async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query
  const query = search ? { name: { $regex: search, $options: 'i' } } : {}
  const [docs, total] = await Promise.all([
    Language.find(query).select('-translations').sort('name').skip((page - 1) * limit).limit(parseInt(limit)),
    Language.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

const getOne = async (req, res) => {
  const doc = await Language.findById(req.params.id)
  if (!doc) return sendError(res, 'Language not found', 404)
  sendSuccess(res, doc)
}

const create = async (req, res) => {
  const { name, isoCode } = req.body
  const doc = await Language.create({ name, isoCode })
  sendSuccess(res, doc, 'Language created', 201)
}

const update = async (req, res) => {
  const { name, isoCode, isActive } = req.body
  const doc = await Language.findByIdAndUpdate(req.params.id, { name, isoCode, isActive }, { new: true, runValidators: true }).select('-translations')
  if (!doc) return sendError(res, 'Language not found', 404)
  sendSuccess(res, doc, 'Language updated')
}

const remove = async (req, res) => {
  const doc = await Language.findByIdAndDelete(req.params.id)
  if (!doc) return sendError(res, 'Language not found', 404)
  sendSuccess(res, {}, 'Language deleted')
}

const toggleStatus = async (req, res) => {
  const doc = await Language.findById(req.params.id)
  if (!doc) return sendError(res, 'Language not found', 404)
  doc.isActive = !doc.isActive
  await doc.save()
  sendSuccess(res, { isActive: doc.isActive }, `Language ${doc.isActive ? 'activated' : 'deactivated'}`)
}

// GET /languages/:id/translations
const getTranslations = async (req, res) => {
  const doc = await Language.findById(req.params.id).select('translations name isoCode')
  if (!doc) return sendError(res, 'Language not found', 404)
  sendSuccess(res, doc)
}

// PUT /languages/:id/translations — body: { section, data: { key: value, ... } }
const updateTranslations = async (req, res) => {
  const { section, data } = req.body
  const allowed = ['labels', 'messages', 'errors', 'success']
  if (!allowed.includes(section)) return sendError(res, 'Invalid section', 400)

  const doc = await Language.findByIdAndUpdate(
    req.params.id,
    { [`translations.${section}`]: data },
    { new: true }
  ).select('translations name isoCode')

  if (!doc) return sendError(res, 'Language not found', 404)
  sendSuccess(res, doc, 'Translations saved')
}

module.exports = { getAll, getOne, create, update, remove, toggleStatus, getTranslations, updateTranslations }
