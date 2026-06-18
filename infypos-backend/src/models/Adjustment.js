const mongoose = require('mongoose')

const AdjustmentItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  sku:      { type: String, required: true },
  type:     { type: String, enum: ['addition','subtraction'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, default: 0, min: 0 },
}, { _id: false })

const AdjustmentSchema = new mongoose.Schema({
  referenceNo: { type: String, required: true, unique: true },
  warehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:       [AdjustmentItemSchema],
  totalAmount: { type: Number, default: 0, min: 0 },
  reason:      { type: String, default: '' },
  note:        { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Adjustment', AdjustmentSchema)
