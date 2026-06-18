const mongoose = require('mongoose')

const ProductDistributionSchema = new mongoose.Schema({
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product',   required: true },
  warehouse:        { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  sku:              { type: String, required: true, unique: true, trim: true, uppercase: true },
  barcode:          { type: String, default: '' },
  barcodeSymbology: { type: String, enum: ['CODE128','CODE39','EAN13','EAN8','UPCA','UPCE','ITF14'], default: 'CODE128' },
  purchasePrice:    { type: Number, required: true, min: 0 },
  salePrice:        { type: Number, required: true, min: 0 },
  mrp:              { type: Number, default: 0 },
  taxRate:          { type: Number, default: 0, min: 0, max: 100 },
  tax:              { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', default: null },
  openingStock:     { type: Number, default: 0, min: 0 },
  alternateUnit:    { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
  alternateUnitFactor: { type: Number, default: 1, min: 0.0001 },
  isActive:         { type: Boolean, default: true },
}, { timestamps: true })

// One product can only be distributed once per warehouse
ProductDistributionSchema.index({ product: 1, warehouse: 1 }, { unique: true })

module.exports = mongoose.model('ProductDistribution', ProductDistributionSchema)
