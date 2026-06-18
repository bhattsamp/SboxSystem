const mongoose = require('mongoose')

const SaleReturnItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  sku:       { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total:     { type: Number, required: true },
}, { _id: false })

const SaleReturnSchema = new mongoose.Schema({
  referenceNo: { type: String, required: true, unique: true },
  sale:        { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  warehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:       [SaleReturnItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  reason:      { type: String, default: '' },
  note:        { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('SaleReturn', SaleReturnSchema)
