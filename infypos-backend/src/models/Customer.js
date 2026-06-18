const mongoose = require('mongoose')

// ── Customer ──────────────────────────────────────────────────
const CustomerSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, default: '', lowercase: true },
  phone:          { type: String, default: '' },
  address:        { type: String, default: '' },
  city:           { type: String, default: '' },
  country:        { type: String, default: '' },
  taxNumber:      { type: String, default: '' },
  totalPurchased: { type: Number, default: 0 },
  outstanding:    { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true })

// ── Supplier ──────────────────────────────────────────────────
const SupplierSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, default: '', lowercase: true },
  phone:     { type: String, default: '' },
  address:   { type: String, default: '' },
  company:   { type: String, default: '' },
  taxNumber: { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

module.exports = {
  Customer: mongoose.model('Customer', CustomerSchema),
  Supplier: mongoose.model('Supplier', SupplierSchema),
}
