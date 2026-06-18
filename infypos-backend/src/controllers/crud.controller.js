const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

// Generic CRUD controller factory
const createCRUD = (Model, options = {}) => {
  const {
    populate    = '',
    searchFields= ['name'],
    label       = 'Record',
  } = options

  // GET all with pagination + search
  const getAll = async (req, res) => {
    const { page = 1, limit = 15, search = '', sort = '-createdAt', isActive } = req.query
    const query = {}

    if (search) {
      query.$or = searchFields.map(f => ({ [f]: { $regex: search, $options: 'i' } }))
    }
    if (isActive !== undefined) query.isActive = isActive === 'true'

    const [docs, total] = await Promise.all([
      Model.find(query).populate(populate).sort(sort).skip((page - 1) * limit).limit(parseInt(limit)),
      Model.countDocuments(query),
    ])

    res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
  }

  // GET one
  const getOne = async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(populate)
    if (!doc) return sendError(res, `${label} not found`, 404)
    sendSuccess(res, doc)
  }

  // CREATE
  const create = async (req, res) => {
    const doc = await Model.create(req.body)
    sendSuccess(res, doc, `${label} created`, 201)
  }

  // UPDATE
  const update = async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populate)
    if (!doc) return sendError(res, `${label} not found`, 404)
    sendSuccess(res, doc, `${label} updated`)
  }

  // DELETE
  const remove = async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) return sendError(res, `${label} not found`, 404)
    sendSuccess(res, {}, `${label} deleted`)
  }

  return { getAll, getOne, create, update, remove }
}

module.exports = createCRUD
