const Hold = require('../models/Hold')
const { generateRefNo, sendSuccess, sendError } = require('../utils/helpers')

// GET all (own holds)
exports.getAll = async (req, res) => {
  const docs = await Hold.find({ createdBy: req.user._id }).populate('warehouse customer','name').sort('-createdAt')
  sendSuccess(res, docs)
}

// GET one
exports.getOne = async (req, res) => {
  const doc = await Hold.findById(req.params.id).populate('warehouse customer','name')
  if (!doc) return sendError(res, 'Held sale not found', 404)
  sendSuccess(res, doc)
}

// CREATE
exports.create = async (req, res) => {
  const { items, warehouse, customer=null, discount=0, discountType='percent', note='' } = req.body

  const holdNo = await generateRefNo(Hold, 'HOLD')

  const hold = await Hold.create({
    holdNo, warehouse, customer, items, discount, discountType, note,
    createdBy: req.user._id,
  })

  sendSuccess(res, hold, 'Sale held', 201)
}

// DELETE
exports.remove = async (req, res) => {
  const hold = await Hold.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
  if (!hold) return sendError(res, 'Held sale not found', 404)
  sendSuccess(res, {}, 'Held sale removed')
}
