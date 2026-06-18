const express = require('express')
const router  = express.Router()
const { protect, adminOnly, authorize } = require('../middleware/auth')

// ── Controllers / factories ───────────────────────────────────
const createCRUD  = require('../controllers/crud.controller')
const categoryCtrl= require('../controllers/category.controller')
const langCtrl    = require('../controllers/language.controller')
const productCtrl      = require('../controllers/product.controller')
const distCtrl         = require('../controllers/productDistribution.controller')
const saleCtrl    = require('../controllers/sale.controller')
const purchaseCtrl= require('../controllers/purchase.controller')
const stockCtrl   = require('../controllers/stock.controller')
const dashCtrl    = require('../controllers/dashboard.controller')
const reportCtrl  = require('../controllers/report.controller')
const settingCtrl = require('../controllers/setting.controller')
const userCtrl    = require('../controllers/user.controller')
const adjustmentCtrl     = require('../controllers/adjustment.controller')
const transferCtrl       = require('../controllers/transfer.controller')
const quotationCtrl      = require('../controllers/quotation.controller')
const purchaseReturnCtrl = require('../controllers/purchaseReturn.controller')
const saleReturnCtrl     = require('../controllers/saleReturn.controller')
const holdCtrl           = require('../controllers/hold.controller')
const salesOrderCtrl     = require('../controllers/salesOrder.controller')
const deliveryNoteCtrl   = require('../controllers/deliveryNote.controller')
const grnCtrl            = require('../controllers/grn.controller')

// ── Models ────────────────────────────────────────────────────
const { Category, Brand, Unit, BaseUnit, VariationAttribute, PaymentMethod, Tax, Branch, Warehouse, VoucherType } = require('../models/Category')
const { Customer, Supplier } = require('../models/Customer')
const { Expense, ExpenseCategory, Notification } = require('../models/Expense')
const { productUpload, brandUpload, settingUpload } = require('../config/multer')

// ── CRUD factories ────────────────────────────────────────────
// catCRUD removed — using dedicated categoryCtrl with hierarchy support
const brdCRUD     = createCRUD(Brand,     { label:'Brand',     searchFields:['name'] })
const unitCRUD    = createCRUD(Unit,      { label:'Unit',      searchFields:['name','shortName'] })
const baseUnitCRUD= createCRUD(BaseUnit,  { label:'Base Unit', searchFields:['name','shortName'] })
const varAttrCRUD = createCRUD(VariationAttribute, { label:'Variation Attribute', searchFields:['name'] })
const payMethCRUD = createCRUD(PaymentMethod, { label:'Payment Method', searchFields:['name'] })
const expCatCRUD  = createCRUD(ExpenseCategory, { label:'Expense Category', searchFields:['name'] })
const taxCRUD    = createCRUD(Tax,      { label:'Tax',      searchFields:['name'] })
const branchCRUD = createCRUD(Branch,  { label:'Branch',   searchFields:['name','code'] })
const whCRUD     = createCRUD(Warehouse, { label:'Warehouse', searchFields:['name'], populate: { path: 'branch', select: 'name code' } })
const custCRUD = createCRUD(Customer,  { label:'Customer',  searchFields:['name','email','phone'] })
const supCRUD  = createCRUD(Supplier,  { label:'Supplier',  searchFields:['name','email','phone'] })
const expCRUD  = createCRUD(Expense,   { label:'Expense',   searchFields:['title','category'] })
const vtCRUD   = createCRUD(VoucherType, { label:'Voucher Type', searchFields:['name','prefix'] })

// ── Languages ─────────────────────────────────────────────────
router.get('/languages',                    protect, langCtrl.getAll)
router.post('/languages',                   protect, authorize('admin','manager'), langCtrl.create)
router.get('/languages/:id',                protect, langCtrl.getOne)
router.put('/languages/:id',                protect, authorize('admin','manager'), langCtrl.update)
router.delete('/languages/:id',             protect, adminOnly, langCtrl.remove)
router.patch('/languages/:id/toggle',       protect, authorize('admin','manager'), langCtrl.toggleStatus)
router.get('/languages/:id/translations',   protect, langCtrl.getTranslations)
router.put('/languages/:id/translations',   protect, authorize('admin','manager'), langCtrl.updateTranslations)

// ── Auth ──────────────────────────────────────────────────────
router.use('/auth', require('./auth.routes'))

// ── Dashboard ─────────────────────────────────────────────────
router.get('/dashboard/stats',       protect, dashCtrl.getStats)
router.get('/dashboard/sales-chart', protect, dashCtrl.getSalesChart)

// ── Products (Master) ─────────────────────────────────────────
router.get('/products',          protect,           productCtrl.getAll)
router.get('/products/:id',      protect,           productCtrl.getOne)
router.post('/products',         protect, authorize('admin','manager'), productUpload.single('image'), productCtrl.create)
router.put('/products/:id',      protect, authorize('admin','manager'), productUpload.single('image'), productCtrl.update)
router.delete('/products/:id',   protect, adminOnly, productCtrl.remove)
router.get('/products/:id/stock',protect, productCtrl.getStock)

// ── Product Distribution ──────────────────────────────────────
router.get('/product-distributions',       protect, distCtrl.getAll)
router.post('/product-distributions',      protect, authorize('admin','manager'), distCtrl.create)
router.get('/product-distributions/:id',   protect, distCtrl.getOne)
router.put('/product-distributions/:id',   protect, authorize('admin','manager'), distCtrl.update)
router.delete('/product-distributions/:id',protect, adminOnly, distCtrl.remove)

// ── Categories ────────────────────────────────────────────────
router.get('/categories/tree',     protect, categoryCtrl.getTree)
router.route('/categories').get(protect, categoryCtrl.getAll).post(protect, authorize('admin','manager'), categoryCtrl.create)
router.route('/categories/:id').get(protect, categoryCtrl.getOne).put(protect, authorize('admin','manager'), categoryCtrl.update).delete(protect, adminOnly, categoryCtrl.remove)

// ── Brands ────────────────────────────────────────────────────
router.route('/brands').get(protect, brdCRUD.getAll).post(protect, authorize('admin','manager'), brandUpload.single('logo'), brdCRUD.create)
router.route('/brands/:id').get(protect, brdCRUD.getOne).put(protect, authorize('admin','manager'), brandUpload.single('logo'), brdCRUD.update).delete(protect, adminOnly, brdCRUD.remove)

// ── Units ─────────────────────────────────────────────────────
router.route('/units').get(protect, unitCRUD.getAll).post(protect, authorize('admin','manager'), unitCRUD.create)
router.route('/units/:id').get(protect, unitCRUD.getOne).put(protect, authorize('admin','manager'), unitCRUD.update).delete(protect, adminOnly, unitCRUD.remove)

// ── Base Units ────────────────────────────────────────────────
router.route('/base-units').get(protect, baseUnitCRUD.getAll).post(protect, authorize('admin','manager'), baseUnitCRUD.create)
router.route('/base-units/:id').get(protect, baseUnitCRUD.getOne).put(protect, authorize('admin','manager'), baseUnitCRUD.update).delete(protect, adminOnly, baseUnitCRUD.remove)

// ── Variation Attributes ──────────────────────────────────────
router.route('/variation-attributes').get(protect, varAttrCRUD.getAll).post(protect, authorize('admin','manager'), varAttrCRUD.create)
router.route('/variation-attributes/:id').get(protect, varAttrCRUD.getOne).put(protect, authorize('admin','manager'), varAttrCRUD.update).delete(protect, adminOnly, varAttrCRUD.remove)

// ── Payment Methods ───────────────────────────────────────────
router.route('/payment-methods').get(protect, payMethCRUD.getAll).post(protect, authorize('admin','manager'), payMethCRUD.create)
router.route('/payment-methods/:id').get(protect, payMethCRUD.getOne).put(protect, authorize('admin','manager'), payMethCRUD.update).delete(protect, adminOnly, payMethCRUD.remove)

// ── Taxes ─────────────────────────────────────────────────────
router.route('/taxes').get(protect, taxCRUD.getAll).post(protect, adminOnly, taxCRUD.create)
router.route('/taxes/:id').get(protect, taxCRUD.getOne).put(protect, adminOnly, taxCRUD.update).delete(protect, adminOnly, taxCRUD.remove)

// ── Branches ──────────────────────────────────────────────────
router.route('/branches').get(protect, branchCRUD.getAll).post(protect, adminOnly, branchCRUD.create)
router.route('/branches/:id').get(protect, branchCRUD.getOne).put(protect, adminOnly, branchCRUD.update).delete(protect, adminOnly, branchCRUD.remove)

// ── Warehouses ────────────────────────────────────────────────
router.route('/warehouses').get(protect, whCRUD.getAll).post(protect, adminOnly, whCRUD.create)
router.route('/warehouses/:id').get(protect, whCRUD.getOne).put(protect, adminOnly, whCRUD.update).delete(protect, adminOnly, whCRUD.remove)

// ── Customers ─────────────────────────────────────────────────
router.route('/customers').get(protect, custCRUD.getAll).post(protect, custCRUD.create)
router.route('/customers/:id').get(protect, custCRUD.getOne).put(protect, custCRUD.update).delete(protect, authorize('admin','manager'), custCRUD.remove)

// ── Suppliers ─────────────────────────────────────────────────
router.route('/suppliers').get(protect, supCRUD.getAll).post(protect, authorize('admin','manager'), supCRUD.create)
router.route('/suppliers/:id').get(protect, supCRUD.getOne).put(protect, authorize('admin','manager'), supCRUD.update).delete(protect, adminOnly, supCRUD.remove)

// ── Sales ─────────────────────────────────────────────────────
router.get('/sales',            protect, saleCtrl.getAll)
router.get('/sales/:id',        protect, saleCtrl.getOne)
router.post('/sales',           protect, saleCtrl.create)
router.put('/sales/:id',        protect, authorize('admin','manager'), saleCtrl.update)
router.delete('/sales/:id',     protect, adminOnly, saleCtrl.remove)
router.post('/sales/:id/payment', protect, saleCtrl.addPayment)

// ── Purchases ─────────────────────────────────────────────────
router.get('/purchases',              protect, purchaseCtrl.getAll)
router.get('/purchases/:id',          protect, purchaseCtrl.getOne)
router.post('/purchases',             protect, authorize('admin','manager'), purchaseCtrl.create)
router.put('/purchases/:id',          protect, authorize('admin','manager'), purchaseCtrl.update)
router.delete('/purchases/:id',       protect, adminOnly, purchaseCtrl.remove)
router.post('/purchases/:id/payment', protect, purchaseCtrl.addPayment)

// ── Stock ─────────────────────────────────────────────────────
router.get('/stock',             protect, stockCtrl.getAll)
router.post('/stock/adjust',     protect, authorize('admin','manager'), stockCtrl.adjust)
router.post('/stock/transfer',   protect, authorize('admin','manager'), stockCtrl.transfer)
router.get('/stock/low-stock',   protect, stockCtrl.getLowStock)

// ── Expenses ──────────────────────────────────────────────────
router.route('/expenses').get(protect, expCRUD.getAll).post(protect, expCRUD.create)
router.route('/expenses/:id').get(protect, expCRUD.getOne).put(protect, expCRUD.update).delete(protect, expCRUD.remove)

// ── Expense Categories ────────────────────────────────────────
router.route('/expense-categories').get(protect, expCatCRUD.getAll).post(protect, authorize('admin','manager'), expCatCRUD.create)
router.route('/expense-categories/:id').get(protect, expCatCRUD.getOne).put(protect, authorize('admin','manager'), expCatCRUD.update).delete(protect, adminOnly, expCatCRUD.remove)

// ── Adjustments ───────────────────────────────────────────────
router.get('/adjustments',          protect, adjustmentCtrl.getAll)
router.get('/adjustments/:id',      protect, adjustmentCtrl.getOne)
router.post('/adjustments',         protect, authorize('admin','manager'), adjustmentCtrl.create)
router.delete('/adjustments/:id',   protect, adminOnly, adjustmentCtrl.remove)

// ── Transfers ─────────────────────────────────────────────────
router.get('/transfers',            protect, transferCtrl.getAll)
router.get('/transfers/:id',        protect, transferCtrl.getOne)
router.post('/transfers',           protect, authorize('admin','manager'), transferCtrl.create)
router.delete('/transfers/:id',     protect, adminOnly, transferCtrl.remove)

// ── Quotations ────────────────────────────────────────────────
router.get('/quotations',           protect, quotationCtrl.getAll)
router.get('/quotations/:id',       protect, quotationCtrl.getOne)
router.post('/quotations',          protect, quotationCtrl.create)
router.put('/quotations/:id',       protect, quotationCtrl.update)
router.delete('/quotations/:id',    protect, adminOnly, quotationCtrl.remove)
router.post('/quotations/:id/convert', protect, quotationCtrl.convertToSale)

// ── Purchase Returns ──────────────────────────────────────────
router.get('/purchase-returns',         protect, purchaseReturnCtrl.getAll)
router.get('/purchase-returns/:id',     protect, purchaseReturnCtrl.getOne)
router.post('/purchase-returns',        protect, authorize('admin','manager'), purchaseReturnCtrl.create)
router.delete('/purchase-returns/:id',  protect, adminOnly, purchaseReturnCtrl.remove)

// ── Sale Returns ──────────────────────────────────────────────
router.get('/sale-returns',         protect, saleReturnCtrl.getAll)
router.get('/sale-returns/:id',     protect, saleReturnCtrl.getOne)
router.post('/sale-returns',        protect, saleReturnCtrl.create)
router.delete('/sale-returns/:id',  protect, adminOnly, saleReturnCtrl.remove)

// ── Holds ─────────────────────────────────────────────────────
router.get('/holds',         protect, holdCtrl.getAll)
router.get('/holds/:id',     protect, holdCtrl.getOne)
router.post('/holds',        protect, holdCtrl.create)
router.delete('/holds/:id',  protect, holdCtrl.remove)

// ── Voucher Types ─────────────────────────────────────────────
router.route('/voucher-types').get(protect, vtCRUD.getAll).post(protect, authorize('admin','manager'), vtCRUD.create)
router.route('/voucher-types/:id').get(protect, vtCRUD.getOne).put(protect, authorize('admin','manager'), vtCRUD.update).delete(protect, adminOnly, vtCRUD.remove)

// ── Sales Orders ──────────────────────────────────────────────
router.get('/sales-orders',                  protect, salesOrderCtrl.getAll)
router.get('/sales-orders/:id',              protect, salesOrderCtrl.getOne)
router.post('/sales-orders',                 protect, authorize('admin','manager'), salesOrderCtrl.create)
router.put('/sales-orders/:id',              protect, authorize('admin','manager'), salesOrderCtrl.update)
router.delete('/sales-orders/:id',           protect, adminOnly, salesOrderCtrl.remove)
router.patch('/sales-orders/:id/status',     protect, authorize('admin','manager'), salesOrderCtrl.updateStatus)

// ── Delivery Notes ────────────────────────────────────────────
router.get('/delivery-notes',                protect, deliveryNoteCtrl.getAll)
router.get('/delivery-notes/:id',            protect, deliveryNoteCtrl.getOne)
router.post('/delivery-notes',               protect, authorize('admin','manager'), deliveryNoteCtrl.create)
router.put('/delivery-notes/:id',            protect, authorize('admin','manager'), deliveryNoteCtrl.update)
router.delete('/delivery-notes/:id',         protect, adminOnly, deliveryNoteCtrl.remove)
router.patch('/delivery-notes/:id/status',   protect, authorize('admin','manager'), deliveryNoteCtrl.updateStatus)

// ── Goods Receipt Notes (GRN) ─────────────────────────────────
router.get('/grn',                           protect, grnCtrl.getAll)
router.get('/grn/:id',                       protect, grnCtrl.getOne)
router.post('/grn',                          protect, authorize('admin','manager'), grnCtrl.create)
router.put('/grn/:id',                       protect, authorize('admin','manager'), grnCtrl.update)
router.delete('/grn/:id',                    protect, adminOnly, grnCtrl.remove)
router.patch('/grn/:id/complete',            protect, authorize('admin','manager'), grnCtrl.complete)

// ── Reports ───────────────────────────────────────────────────
router.get('/reports/sales',        protect, reportCtrl.getSalesReport)
router.get('/reports/purchases',    protect, reportCtrl.getPurchaseReport)
router.get('/reports/stock',        protect, reportCtrl.getStockReport)
router.get('/reports/profit-loss',  protect, reportCtrl.getProfitLoss)

// ── Settings ──────────────────────────────────────────────────
router.get('/settings',  protect, settingCtrl.get)
router.put('/settings',  protect, adminOnly, settingUpload.single('companyLogo'), settingCtrl.update)

// ── Users ─────────────────────────────────────────────────────
router.get('/users',               protect, adminOnly, userCtrl.getAll)
router.get('/users/:id',           protect, adminOnly, userCtrl.getOne)
router.post('/users',              protect, adminOnly, userCtrl.create)
router.put('/users/:id',           protect, adminOnly, userCtrl.update)
router.delete('/users/:id',        protect, adminOnly, userCtrl.remove)
router.patch('/users/:id/toggle-status', protect, adminOnly, userCtrl.toggleStatus)

// ── Notifications ─────────────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
  const notes = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20)
  res.json({ success: true, data: notes })
})
router.put('/notifications/:id/read', protect, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true })
  res.json({ success: true, message: 'Marked as read' })
})
router.put('/notifications/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true })
  res.json({ success: true, message: 'All marked as read' })
})

// ── Barcode ───────────────────────────────────────────────────
const Product = require('../models/Product')
router.get('/barcode/products', protect, async (req, res) => {
  const { warehouse, search='' } = req.query
  const query = { isActive: true }
  if (search) query.$or = [{ name: { $regex: search, $options:'i' } }, { sku: { $regex: search, $options:'i' } }]
  const products = await Product.find(query).select('name sku barcode barcodeSymbology salePrice').limit(100)
  res.json({ success: true, data: products })
})

module.exports = router
