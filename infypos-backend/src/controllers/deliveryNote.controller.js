const DeliveryNote = require('../models/DeliveryNote')

const pad = (n, len = 4) => String(n).padStart(len, '0')

async function nextDeliveryNo() {
  const last = await DeliveryNote.findOne({}, { deliveryNo: 1 }).sort({ createdAt: -1 })
  if (!last) return `DN-${pad(1)}`
  const num = parseInt(last.deliveryNo.replace(/\D/g, '') || '0', 10)
  return `DN-${pad(num + 1)}`
}

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer } = req.query
    const filter = {}
    if (status)   filter.status   = status
    if (customer) filter.customer = customer

    const [items, total] = await Promise.all([
      DeliveryNote.find(filter)
        .populate('customer', 'name phone')
        .populate('warehouse', 'name')
        .populate('salesOrder', 'orderNo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      DeliveryNote.countDocuments(filter),
    ])
    res.json({ data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const item = await DeliveryNote.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate('warehouse', 'name')
      .populate('salesOrder', 'orderNo grandTotal')
      .populate('sale', 'invoiceNo')
      .populate('items.product', 'name image')
    if (!item) return res.status(404).json({ message: 'Delivery note not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const deliveryNo = await nextDeliveryNo()
    const note = await DeliveryNote.create({ ...req.body, deliveryNo, createdBy: req.user._id })
    res.status(201).json(note)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const note = await DeliveryNote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!note) return res.status(404).json({ message: 'Delivery note not found' })
    res.json(note)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const note = await DeliveryNote.findByIdAndDelete(req.params.id)
    if (!note) return res.status(404).json({ message: 'Delivery note not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const note = await DeliveryNote.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!note) return res.status(404).json({ message: 'Delivery note not found' })
    res.json(note)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
