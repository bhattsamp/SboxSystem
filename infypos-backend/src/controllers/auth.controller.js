const User = require('../models/User')

// @desc  Login
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' })

  const user = await User.findOne({ email }).select('+password')
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })
  if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated' })

  const isMatch = await user.matchPassword(password)
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' })

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = user.getSignedJwtToken()
  const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, warehouse: user.warehouse, isActive: user.isActive }
  res.json({ success: true, message: 'Login successful', data: { token, user: userData } })
}

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('warehouse', 'name')
  res.json({ success: true, data: user })
}

// @desc  Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')
  const isMatch = await user.matchPassword(oldPassword)
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' })
  user.password = newPassword
  await user.save()
  res.json({ success: true, message: 'Password changed successfully' })
}

// @desc  Logout (client-side token removal)
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
}

// @desc  Forgot password (stub — implement email in production)
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(404).json({ success: false, message: 'No account with that email' })
  res.json({ success: true, message: 'Reset link sent (configure SMTP in production)' })
}
