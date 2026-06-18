const GoodsReceiptNote = require('../models/GoodsReceiptNote')
const Stock = require('../models/Stock')

const pad = (n, len = 4) => String(n).padStart(len, '0')

async function nextGrnNo() {
  const last = await GoodsReceiptNote.findOne({}, { grnNo: 1 }).sort({ createdAt: -1 })
  if (!last) return `GRN-${pad(1)}`
  const num = parseInt(last.grnNo.replace(/\D/g, '') || '0', 10)
  return `GRN-${pad(num + 1)}`
}

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, supplier } = req.query
    const filter = {}
    if (status)   filter.status   = status
    if (supplier) filter.supplier = supplier

    const [items, total] = await Promise.all([
      GoodsReceiptNote.find(filter)
        .populate('supplier', 'name phone')
        .populate('warehouse', 'name')
        .populate('purchase', 'referenceNo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      GoodsReceiptNote.countDocuments(filter),
    ])
    res.json({ data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const item = await GoodsReceiptNote.findById(req.params.id)
      .populate('supplier', 'name phone email')
      .populate('warehouse', 'name')
      .populate('purchase', 'referenceNo grandTotal')
      .populate('items.product', 'name image')
    if (!item) return res.status(404).json({ message: 'GRN not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const grnNo = await nextGrnNo()
    const grn = await GoodsReceiptNote.create({ ...req.body, grnNo, createdBy: req.user._id })
    res.status(201).json(grn)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const grn = await GoodsReceiptNote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!grn) return res.status(404).json({ message: 'GRN not found' })
    res.json(grn)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const grn = await GoodsReceiptNote.findByIdAndDelete(req.params.id)
    if (!grn) return res.status(404).json({ message: 'GRN not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// When marking GRN as complete, update stock for each received item
exports.complete = async (req, res) => {
  try {
    const grn = await GoodsReceiptNote.findById(req.params.id)
    if (!grn) return res.status(404).json({ message: 'GRN not found' })
    if (grn.status === 'complete') return res.status(400).json({ message: 'GRN already completed' })
    if (grn.status === 'cancelled') return res.status(400).json({ message: 'Cannot complete a cancelled GRN' })

    for (const item of grn.items) {
      if (!item.product || item.receivedQty <= 0) continue
      await Stock.findOneAndUpdate(
        { product: item.product, warehouse: grn.warehouse },
        { $inc: { quantity: item.receivedQty } },
        { upsert: true }
      )
    }

    grn.status = 'complete'
    await grn.save()
    res.json(grn)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
