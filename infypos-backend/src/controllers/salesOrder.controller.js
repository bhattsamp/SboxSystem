const SalesOrder = require('../models/SalesOrder')

const pad = (n, len = 4) => String(n).padStart(len, '0')

async function nextOrderNo() {
  const last = await SalesOrder.findOne({}, { orderNo: 1 }).sort({ createdAt: -1 })
  if (!last) return `SO-${pad(1)}`
  const num = parseInt(last.orderNo.replace(/\D/g, '') || '0', 10)
  return `SO-${pad(num + 1)}`
}

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer } = req.query
    const filter = {}
    if (status)   filter.status   = status
    if (customer) filter.customer = customer

    const [items, total] = await Promise.all([
      SalesOrder.find(filter)
        .populate('customer', 'name phone')
        .populate('warehouse', 'name')
        .populate('voucherType', 'name prefix')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      SalesOrder.countDocuments(filter),
    ])
    res.json({ data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const item = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('warehouse', 'name')
      .populate('voucherType', 'name prefix')
      .populate('quotation', 'quotationNo')
      .populate('items.product', 'name image')
    if (!item) return res.status(404).json({ message: 'Sales order not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const orderNo = await nextOrderNo()
    const order = await SalesOrder.create({ ...req.body, orderNo, createdBy: req.user._id })
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!order) return res.status(404).json({ message: 'Sales order not found' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ message: 'Sales order not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ message: 'Sales order not found' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
