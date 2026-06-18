const mongoose = require('mongoose')

// ── Category ──────────────────────────────────────────────────
const CategorySchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  slug:           { type: String },
  description:    { type: String, default: '' },
  image:          { type: String, default: '' },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true })

CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = this.name.toLowerCase().replace(/\s+/g, '-')
  next()
})

// ── Brand ─────────────────────────────────────────────────────
const BrandSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  logo:        { type: String, default: '' },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

// ── Base Unit ─────────────────────────────────────────────────
const BaseUnitSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, unique: true },
  shortName: { type: String, required: true, trim: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

// ── Unit ──────────────────────────────────────────────────────
const UnitSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  shortName:   { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  baseUnit:        { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUnit', default: null },
  conversionFactor:{ type: Number, default: 1, min: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

// ── Variation Attribute ──────────────────────────────────────
const VariationAttributeSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, unique: true },
  values:   { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ── Payment Method ────────────────────────────────────────────
const PaymentMethodSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ── Tax Rate ──────────────────────────────────────────────────
const TaxSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  rate:     { type: Number, required: true, min: 0, max: 100 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ── Voucher Type ──────────────────────────────────────────────
const VoucherTypeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  module:    { type: String, enum: ['sales', 'purchase'], required: true },
  prefix:    { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

// ── Branch ────────────────────────────────────────────────────
const BranchSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, unique: true },
  code:     { type: String, default: '', trim: true },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  address:  { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ── Warehouse ─────────────────────────────────────────────────
const WarehouseSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, unique: true },
  branch:   { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  address:  { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = {
  Category:           mongoose.model('Category',           CategorySchema),
  VoucherType:        mongoose.model('VoucherType',        VoucherTypeSchema),
  Brand:              mongoose.model('Brand',              BrandSchema),
  Unit:               mongoose.model('Unit',               UnitSchema),
  BaseUnit:           mongoose.model('BaseUnit',           BaseUnitSchema),
  VariationAttribute: mongoose.model('VariationAttribute', VariationAttributeSchema),
  PaymentMethod:      mongoose.model('PaymentMethod',      PaymentMethodSchema),
  Tax:                mongoose.model('Tax',                TaxSchema),
  Branch:             mongoose.model('Branch',             BranchSchema),
  Warehouse:          mongoose.model('Warehouse',          WarehouseSchema),
}
