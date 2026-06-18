const User = require('../models/User')
const { paginateMeta, sendSuccess, sendError } = require('../utils/helpers')

exports.getAll = async (req, res) => {
  const { page=1, limit=15, search='', role } = req.query
  const query = {}
  if (search) query.$or = [{ name: { $regex: search, $options:'i' } }, { email: { $regex: search, $options:'i' } }]
  if (role)   query.role = role
  const [docs, total] = await Promise.all([
    User.find(query).populate('warehouse','name').sort('-createdAt').skip((page-1)*limit).limit(parseInt(limit)),
    User.countDocuments(query),
  ])
  res.json({ success: true, data: docs, meta: paginateMeta(total, page, limit) })
}

exports.getOne = async (req, res) => {
  const user = await User.findById(req.params.id).populate('warehouse','name')
  if (!user) return sendError(res, 'User not found', 404)
  sendSuccess(res, user)
}

exports.create = async (req, res) => {
  const { name, email, password, role, warehouse } = req.body
  const exists = await User.findOne({ email })
  if (exists) return sendError(res, 'Email already registered')
  const user = await User.create({ name, email, password, role, warehouse })
  sendSuccess(res, user, 'User created', 201)
}

exports.update = async (req, res) => {
  const { password, ...rest } = req.body
  const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true })
  if (!user) return sendError(res, 'User not found', 404)
  if (password) { user.password = password; await user.save() }
  sendSuccess(res, user, 'User updated')
}

exports.remove = async (req, res) => {
  if (req.params.id === req.user._id.toString()) return sendError(res, 'Cannot delete your own account')
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return sendError(res, 'User not found', 404)
  sendSuccess(res, {}, 'User deleted')
}

exports.toggleStatus = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return sendError(res, 'User not found', 404)
  user.isActive = !user.isActive
  await user.save()
  sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`)
}
