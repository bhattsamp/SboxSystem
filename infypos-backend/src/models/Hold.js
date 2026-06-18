const mongoose = require('mongoose')

const HoldItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  name:      { type: String, required: true },
  sku:       { type: String, default: '' },
  quantity:  { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate:   { type: Number, default: 0 },
}, { _id: false })

const HoldSchema = new mongoose.Schema({
  holdNo:       { type: String, required: true, unique: true },
  warehouse:    { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  items:        [HoldItemSchema],
  discount:     { type: Number, default: 0 },
  discountType: { type: String, enum: ['fixed','percent'], default: 'percent' },
  note:         { type: String, default: '' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Hold', HoldSchema)
