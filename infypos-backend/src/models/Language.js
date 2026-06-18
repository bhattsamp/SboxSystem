const mongoose = require('mongoose')

const LanguageSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  isoCode:  { type: String, required: true, trim: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  translations: {
    labels:   { type: Object, default: {} },
    messages: { type: Object, default: {} },
    errors:   { type: Object, default: {} },
    success:  { type: Object, default: {} },
  },
}, { timestamps: true })

module.exports = mongoose.model('Language', LanguageSchema)
