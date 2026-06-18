const mongoose = require('mongoose')

const PurchaseReturnItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  sku:      { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  total:    { type: Number, required: true },
}, { _id: false })

const PurchaseReturnSchema = new mongoose.Schema({
  referenceNo: { type: String, required: true, unique: true },
  purchase:    { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', default: null },
  supplier:    { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  warehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:       [PurchaseReturnItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  reason:      { type: String, default: '' },
  note:        { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('PurchaseReturn', PurchaseReturnSchema)
