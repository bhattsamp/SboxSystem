const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String },
  description:   { type: String, default: '' },
  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand:         { type: mongoose.Schema.Types.ObjectId, ref: 'Brand',    default: null },
  unit:          { type: mongoose.Schema.Types.ObjectId, ref: 'Unit',     required: true },
  image:         { type: String, default: '' },
  alertQuantity: { type: Number, default: 5, min: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = this.name.toLowerCase().replace(/\s+/g, '-')
  next()
})

// Virtual stock (populated separately)
ProductSchema.virtual('stock', { ref: 'Stock', localField: '_id', foreignField: 'product' })

module.exports = mongoose.model('Product', ProductSchema)
