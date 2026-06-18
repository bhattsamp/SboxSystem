const mongoose = require('mongoose')

const TransferItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  sku:      { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false })

const TransferSchema = new mongoose.Schema({
  referenceNo:   { type: String, required: true, unique: true },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toWarehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:         [TransferItemSchema],
  status:        { type: String, enum: ['pending','completed'], default: 'completed' },
  note:          { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Transfer', TransferSchema)
