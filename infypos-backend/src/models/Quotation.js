const mongoose = require('mongoose')

const QuotationItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:         { type: String, required: true },
  sku:          { type: String, required: true },
  quantity:     { type: Number, required: true, min: 1 },
  unitPrice:    { type: Number, required: true, min: 0 },
  discount:     { type: Number, default: 0 },
  discountType: { type: String, enum: ['fixed','percent'], default: 'fixed' },
  taxRate:      { type: Number, default: 0 },
  taxAmount:    { type: Number, default: 0 },
  subtotal:     { type: Number, required: true },
  total:        { type: Number, required: true },
}, { _id: false })

const QuotationSchema = new mongoose.Schema({
  quotationNo:    { type: String, required: true, unique: true },
  customer:       { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  warehouse:      { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:          [QuotationItemSchema],
  subtotal:       { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount:      { type: Number, default: 0 },
  shippingCost:   { type: Number, default: 0 },
  grandTotal:     { type: Number, required: true, min: 0 },
  status:         { type: String, enum: ['draft','sent','accepted','rejected','expired','converted'], default: 'draft' },
  validUntil:     { type: Date, default: null },
  note:           { type: String, default: '' },
  terms:          { type: String, default: '' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Quotation', QuotationSchema)
