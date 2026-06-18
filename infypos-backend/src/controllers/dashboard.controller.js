const Sale     = require('../models/Sale')
const Purchase = require('../models/Purchase')
const Product  = require('../models/Product')
const Stock    = require('../models/Stock')
const { Customer } = require('../models/Customer')

exports.getStats = async (req, res) => {
  const now       = new Date()
  const todayStart= new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart= new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalSales, totalPurchases, totalProducts, totalOrders,
    todaySales, monthSales, lowStockCount, totalCustomers,
    recentSales,
  ] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Purchase.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Product.countDocuments({ isActive: true }),
    Sale.countDocuments(),
    Sale.aggregate([{ $match: { createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Sale.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Product.countDocuments({ isActive: true }).then(async () => {
      const products = await Product.find({ isActive: true }).select('_id alertQuantity')
      let count = 0
      for (const p of products) {
        const stocks = await Stock.find({ product: p._id })
        const qty = stocks.reduce((s, st) => s + st.quantity, 0)
        if (qty <= p.alertQuantity) count++
      }
      return count
    }),
    Customer.countDocuments(),
    Sale.find().sort('-createdAt').limit(5).populate('customer', 'name'),
  ])

  res.json({
    success: true,
    data: {
      totalSales:      totalSales[0]?.total   || 0,
      totalPurchases:  totalPurchases[0]?.total|| 0,
      totalProducts,
      totalOrders,
      totalCustomers,
      todaySales:      todaySales[0]?.total    || 0,
      monthSales:      monthSales[0]?.total    || 0,
      lowStockCount,
      recentSales,
    }
  })
}

exports.getSalesChart = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear()

  const salesData    = await Sale.aggregate([
    { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year+1}-01-01`) } } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$grandTotal' } } },
    { $sort: { '_id': 1 } },
  ])
  const purchaseData = await Purchase.aggregate([
    { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year+1}-01-01`) } } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$grandTotal' } } },
    { $sort: { '_id': 1 } },
  ])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const chart  = months.map((month, i) => {
    const mo   = i + 1
    const sale = salesData.find(s => s._id === mo)
    const pur  = purchaseData.find(p => p._id === mo)
    return { month, sales: sale?.total || 0, purchases: pur?.total || 0, profit: (sale?.total||0) - (pur?.total||0) }
  })

  res.json({ success: true, data: chart })
}
