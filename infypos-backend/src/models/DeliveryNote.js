const mongoose = require('mongoose')

const DNItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:         { type: String, required: true },
  sku:          { type: String, default: '' },
  orderedQty:   { type: Number, default: 0 },
  deliveredQty: { type: Number, required: true, min: 0 },
}, { _id: false })

const DeliveryNoteSchema = new mongoose.Schema({
  deliveryNo:      { type: String, required: true, unique: true },
  sale:            { type: mongoose.Schema.Types.ObjectId, ref: 'Sale',       default: null },
  salesOrder:      { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', default: null },
  customer:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer',   default: null },
  warehouse:       { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse',  required: true },
  items:           [DNItemSchema],
  deliveryDate:    { type: Date, default: Date.now },
  deliveryAddress: { type: String, default: '' },
  status:          { type: String, enum: ['draft','dispatched','delivered','cancelled'], default: 'draft' },
  note:            { type: String, default: '' },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('DeliveryNote', DeliveryNoteSchema)
