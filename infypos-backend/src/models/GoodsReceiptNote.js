const mongoose = require('mongoose')

const GRNItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:        { type: String, required: true },
  sku:         { type: String, default: '' },
  orderedQty:  { type: Number, default: 0 },
  receivedQty: { type: Number, required: true, min: 0 },
  unitCost:    { type: Number, default: 0 },
  total:       { type: Number, default: 0 },
}, { _id: false })

const GoodsReceiptNoteSchema = new mongoose.Schema({
  grnNo:        { type: String, required: true, unique: true },
  purchase:     { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', default: null },
  supplier:     { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  warehouse:    { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:        [GRNItemSchema],
  receivedDate: { type: Date, default: Date.now },
  grandTotal:   { type: Number, default: 0 },
  status:       { type: String, enum: ['draft','partial','complete','cancelled'], default: 'draft' },
  note:         { type: String, default: '' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('GoodsReceiptNote', GoodsReceiptNoteSchema)
