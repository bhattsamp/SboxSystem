const mongoose = require('mongoose')

const PurchaseItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  sku:      { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  taxRate:  { type: Number, default: 0 },
  taxAmount:{ type: Number, default: 0 },
  total:    { type: Number, required: true },
}, { _id: false })

const PurchaseSchema = new mongoose.Schema({
  referenceNo:   { type: String, required: true, unique: true },
  supplier:      { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  warehouse:     { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:         [PurchaseItemSchema],
  subtotal:      { type: Number, required: true, min: 0 },
  taxAmount:     { type: Number, default: 0 },
  shippingCost:  { type: Number, default: 0 },
  grandTotal:    { type: Number, required: true, min: 0 },
  paidAmount:    { type: Number, default: 0 },
  dueAmount:     { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['paid','unpaid','partial'], default: 'unpaid' },
  paymentMethod: { type: String, default: 'cash' },
  documentType:  { type: String, enum: ['purchase_order','purchase'], default: 'purchase' },
  purchaseType:  { type: String, enum: ['regular','expense'], default: 'regular' },
  voucherType:   { type: mongoose.Schema.Types.ObjectId, ref: 'VoucherType', default: null },
  status:        { type: String, enum: ['ordered','received','partial','cancelled'], default: 'ordered' },
  note:          { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

PurchaseSchema.pre('save', function (next) {
  this.dueAmount = Math.max(0, this.grandTotal - this.paidAmount)
  if (this.paidAmount <= 0)                         this.paymentStatus = 'unpaid'
  else if (this.paidAmount >= this.grandTotal)       this.paymentStatus = 'paid'
  else                                               this.paymentStatus = 'partial'
  next()
})

module.exports = mongoose.model('Purchase', PurchaseSchema)
