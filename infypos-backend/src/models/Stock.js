const mongoose = require('mongoose')

const StockSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product',   required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity:  { type: Number, default: 0 },
}, { timestamps: true })

StockSchema.index({ product: 1, warehouse: 1 }, { unique: true })

// Helper: adjust stock
StockSchema.statics.adjust = async function (productId, warehouseId, qty) {
  const stock = await this.findOneAndUpdate(
    { product: productId, warehouse: warehouseId },
    { $inc: { quantity: qty } },
    { new: true, upsert: true }
  )
  return stock
}

// Helper: get quantity
StockSchema.statics.getQty = async function (productId, warehouseId) {
  const s = await this.findOne({ product: productId, warehouse: warehouseId })
  return s ? s.quantity : 0
}

module.exports = mongoose.model('Stock', StockSchema)
