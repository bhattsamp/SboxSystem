const mongoose = require('mongoose')

const SaleItemSchema = new mongoose.Schema({
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

const PaymentSchema = new mongoose.Schema({
  amount:    { type: Number, required: true, min: 0 },
  method:    { type: String, default: 'cash' },
  reference: { type: String, default: '' },
  date:      { type: Date, default: Date.now },
  note:      { type: String, default: '' },
})

const SaleSchema = new mongoose.Schema({
  invoiceNo:     { type: String, required: true, unique: true },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  warehouse:     { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items:         [SaleItemSchema],
  subtotal:      { type: Number, required: true, min: 0 },
  discountAmount:{ type: Number, default: 0 },
  taxAmount:     { type: Number, default: 0 },
  shippingCost:  { type: Number, default: 0 },
  grandTotal:    { type: Number, required: true, min: 0 },
  paidAmount:    { type: Number, default: 0 },
  dueAmount:     { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['paid','unpaid','partial'], default: 'unpaid' },
  paymentMethod: { type: String, default: 'cash' },
  payments:      [PaymentSchema],
  saleType:      { type: String, enum: ['retail','cash'], default: 'retail' },
  voucherType:   { type: mongoose.Schema.Types.ObjectId, ref: 'VoucherType', default: null },
  status:        { type: String, enum: ['completed','pending','cancelled','returned'], default: 'completed' },
  note:          { type: String, default: '' },
  terms:         { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

// Auto-calculate payment status before save
SaleSchema.pre('save', function (next) {
  this.dueAmount = Math.max(0, this.grandTotal - this.paidAmount)
  if (this.paidAmount <= 0)                         this.paymentStatus = 'unpaid'
  else if (this.paidAmount >= this.grandTotal)       this.paymentStatus = 'paid'
  else                                               this.paymentStatus = 'partial'
  next()
})

module.exports = mongoose.model('Sale', SaleSchema)
