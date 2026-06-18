const mongoose = require('mongoose')

// ── Expense ───────────────────────────────────────────────────
const ExpenseSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  category:  { type: String, required: true },
  amount:    { type: Number, required: true, min: 0 },
  date:      { type: Date,   required: true },
  note:      { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

// ── Expense Category ──────────────────────────────────────────
const ExpenseCategorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

// ── Notification ──────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['info','success','warning','error'], default: 'info' },
  read:    { type: Boolean, default: false },
  link:    { type: String, default: '' },
}, { timestamps: true })

// ── App Settings (singleton) ──────────────────────────────────
const SettingSchema = new mongoose.Schema({
  companyName:      { type: String, default: 'SBox System Store' },
  companyLogo:      { type: String, default: '' },
  address:          { type: String, default: '' },
  phone:            { type: String, default: '' },
  email:            { type: String, default: '' },
  website:          { type: String, default: '' },
  currency:         { type: String, default: 'USD' },
  currencySymbol:   { type: String, default: '$' },
  currencyPosition: { type: String, enum: ['before','after'], default: 'before' },
  timezone:         { type: String, default: 'America/New_York' },
  taxEnabled:       { type: Boolean, default: false },
  defaultTaxRate:   { type: Number, default: 0 },
  invoicePrefix:    { type: String, default: 'INV' },
  invoiceFooter:    { type: String, default: 'Thank you for your business!' },
  invoiceTerms:     { type: String, default: '' },
  lowStockAlert:    { type: Number, default: 5 },
  allowNegativeStock: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = {
  Expense:         mongoose.model('Expense',         ExpenseSchema),
  ExpenseCategory: mongoose.model('ExpenseCategory', ExpenseCategorySchema),
  Notification:    mongoose.model('Notification',    NotificationSchema),
  Setting:         mongoose.model('Setting',         SettingSchema),
}
