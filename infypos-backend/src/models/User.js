const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email:     { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password:  { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone:     { type: String, default: '' },
  role:      { type: String, enum: ['admin', 'manager', 'cashier'], default: 'cashier' },
  avatar:    { type: String, default: '' },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  isActive:  { type: Boolean, default: true },
  permissions: [String],
  lastLogin: { type: Date },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
}, { timestamps: true })

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

// Match password
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', UserSchema)
