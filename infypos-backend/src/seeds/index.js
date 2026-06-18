require('dotenv').config()
const mongoose  = require('mongoose')
const bcrypt    = require('bcryptjs')
const colors    = require('colors')

// Models
const User      = require('../models/User')
const { Category, Brand, Unit, BaseUnit, VariationAttribute, PaymentMethod, Tax, Warehouse } = require('../models/Category')
const Product   = require('../models/Product')
const Stock     = require('../models/Stock')
const { Customer, Supplier } = require('../models/Customer')
const Sale      = require('../models/Sale')
const Purchase  = require('../models/Purchase')
const { Expense, ExpenseCategory, Setting } = require('../models/Expense')

const connectDB = require('../config/db')

const fresh = process.argv.includes('--fresh')

const seed = async () => {
  await connectDB()
  console.log('🌱 Seeding database...'.yellow.bold)

  if (fresh) {
    console.log('🗑  Dropping existing data...'.red)
    await Promise.all([
      User.deleteMany(), Category.deleteMany(), Brand.deleteMany(), Unit.deleteMany(),
      BaseUnit.deleteMany(), VariationAttribute.deleteMany(), PaymentMethod.deleteMany(),
      Tax.deleteMany(), Warehouse.deleteMany(), Product.deleteMany(), Stock.deleteMany(),
      Customer.deleteMany(), Supplier.deleteMany(), Sale.deleteMany(), Purchase.deleteMany(),
      Expense.deleteMany(), ExpenseCategory.deleteMany(), Setting.deleteMany(),
    ])
  }

  // ── Settings ──────────────────────────────────────────────
  const existSetting = await Setting.findOne()
  if (!existSetting) {
    await Setting.create({
      companyName: 'SBox System Demo Store', email: 'admin@sboxsystem.com',
      phone: '+1 555-0100', address: '123 Business St, New York, NY 10001',
      currency: 'USD', currencySymbol: '$', invoicePrefix: 'INV',
      taxEnabled: true, defaultTaxRate: 10, lowStockAlert: 5,
      invoiceFooter: 'Thank you for your business!',
    })
    console.log('✅ Settings seeded'.green)
  }

  // ── Warehouses ────────────────────────────────────────────
  let [mainWH, secWH] = await Promise.all([
    Warehouse.findOne({ name: 'Main Warehouse' }),
    Warehouse.findOne({ name: 'Secondary Warehouse' }),
  ])
  if (!mainWH) mainWH = await Warehouse.create({ name: 'Main Warehouse', email: 'main@store.com', phone: '+1 555-1000', address: '123 Storage St, New York' })
  if (!secWH)  secWH  = await Warehouse.create({ name: 'Secondary Warehouse', email: 'secondary@store.com', phone: '+1 555-2000', address: '456 Depot Ave, Los Angeles' })
  console.log('✅ Warehouses seeded'.green)

  // ── Users ─────────────────────────────────────────────────
  let adminUser = await User.findOne({ email: 'admin@sboxsystem.com' })
  if (!adminUser) {
    adminUser = await User.create({ name: 'Admin User', email: 'admin@sboxsystem.com', password: '123456', role: 'admin', warehouse: mainWH._id, isActive: true })
    await User.create({ name: 'Store Manager', email: 'manager@sboxsystem.com', password: '123456', role: 'manager', warehouse: mainWH._id, isActive: true })
    await User.create({ name: 'Cashier One',   email: 'cashier@sboxsystem.com',  password: '123456', role: 'cashier', warehouse: mainWH._id, isActive: true })
    console.log('✅ Users seeded (admin@sboxsystem.com / 123456)'.green)
  }

  // ── Categories ────────────────────────────────────────────
  const catData = [
    { name: 'Electronics',       description: 'Electronic devices and accessories' },
    { name: 'Clothing',          description: 'Fashion and apparel' },
    { name: 'Books',             description: 'Books and educational materials' },
    { name: 'Food & Beverages',  description: 'Consumable items' },
    { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Home & Kitchen',    description: 'Home appliances and kitchenware' },
  ]
  const cats = {}
  for (const c of catData) {
    let cat = await Category.findOne({ name: c.name })
    if (!cat) cat = await Category.create(c)
    cats[c.name] = cat
  }
  console.log('✅ Categories seeded'.green)

  // ── Brands ────────────────────────────────────────────────
  const brdData = ['Apple','Samsung','Sony','Nike','Dell','Adidas','LG','HP']
  const brands  = {}
  for (const name of brdData) {
    let b = await Brand.findOne({ name })
    if (!b) b = await Brand.create({ name })
    brands[name] = b
  }
  console.log('✅ Brands seeded'.green)

  // ── Units ─────────────────────────────────────────────────
  const unitData = [
    { name:'Piece',    shortName:'Pcs' },
    { name:'Box',      shortName:'Box' },
    { name:'Kilogram', shortName:'Kg'  },
    { name:'Litre',    shortName:'L'   },
    { name:'Dozen',    shortName:'Dz'  },
  ]
  const units = {}
  for (const u of unitData) {
    let unit = await Unit.findOne({ name: u.name })
    if (!unit) unit = await Unit.create(u)
    units[u.name] = unit
  }
  console.log('✅ Units seeded'.green)

  // ── Base Units ────────────────────────────────────────────
  const baseUnitData = [
    { name:'Quantity', shortName:'Qty' },
    { name:'Weight',   shortName:'Kg'  },
    { name:'Volume',   shortName:'L'   },
  ]
  for (const bu of baseUnitData) {
    if (!await BaseUnit.findOne({ name: bu.name })) await BaseUnit.create(bu)
  }
  console.log('✅ Base units seeded'.green)

  // ── Variation Attributes ────────────────────────────────────
  const varAttrData = [
    { name:'Color', values:['Red','Blue','Green','Black','White'] },
    { name:'Size',  values:['S','M','L','XL','XXL'] },
  ]
  for (const va of varAttrData) {
    if (!await VariationAttribute.findOne({ name: va.name })) await VariationAttribute.create(va)
  }
  console.log('✅ Variation attributes seeded'.green)

  // ── Payment Methods ──────────────────────────────────────────
  const payMethData = ['Cash','Card','Bank Transfer','Cheque']
  for (const name of payMethData) {
    if (!await PaymentMethod.findOne({ name })) await PaymentMethod.create({ name })
  }
  console.log('✅ Payment methods seeded'.green)

  // ── Expense Categories ───────────────────────────────────────
  const expCatData = [
    { name:'Rent',      description:'Monthly rent expenses' },
    { name:'Utilities', description:'Electricity, water, internet' },
    { name:'Salaries',  description:'Staff salaries and wages' },
    { name:'Marketing', description:'Advertising and promotions' },
  ]
  for (const ec of expCatData) {
    if (!await ExpenseCategory.findOne({ name: ec.name })) await ExpenseCategory.create(ec)
  }
  console.log('✅ Expense categories seeded'.green)

  // ── Tax ───────────────────────────────────────────────────
  let tax = await Tax.findOne({ name: 'GST 10%' })
  if (!tax) tax = await Tax.create({ name: 'GST 10%', rate: 10 })

  // ── Products ──────────────────────────────────────────────
  const productData = [
    { name:'Apple iPhone 15 Pro',    sku:'APL-00123', barcode:'8901234567890', barcodeSymbology:'EAN13', category:'Electronics', brand:'Apple',   purchasePrice:750,  salePrice:999,   alertQuantity:5,  stock:{ main:20, sec:5  } },
    { name:'Samsung Galaxy S24',     sku:'SAM-00456', barcode:'1234567890123', barcodeSymbology:'EAN13', category:'Electronics', brand:'Samsung', purchasePrice:600,  salePrice:799,   alertQuantity:5,  stock:{ main:15, sec:8  } },
    { name:'Sony WH-1000XM5',        sku:'SNY-00789', barcode:'2345678901234', barcodeSymbology:'CODE128',category:'Electronics', brand:'Sony',   purchasePrice:250,  salePrice:349,   alertQuantity:3,  stock:{ main:3,  sec:0  } },
    { name:'Nike Air Max 270',        sku:'NK-00321',  barcode:'3456789012345', barcodeSymbology:'CODE128',category:'Clothing',    brand:'Nike',   purchasePrice:70,   salePrice:129,   alertQuantity:10, stock:{ main:0,  sec:5  } },
    { name:'Adidas Ultraboost 22',    sku:'ADB-00654', barcode:'4567890123456', barcodeSymbology:'CODE128',category:'Clothing',    brand:'Adidas', purchasePrice:100,  salePrice:159,   alertQuantity:8,  stock:{ main:12, sec:3  } },
    { name:'Dell XPS 15 Laptop',      sku:'DEL-00987', barcode:'5678901234567', barcodeSymbology:'CODE128',category:'Electronics', brand:'Dell',   purchasePrice:1200, salePrice:1499,  alertQuantity:2,  stock:{ main:8,  sec:0  } },
    { name:'The Alchemist (Book)',     sku:'BK-00111',  barcode:'6789012345678', barcodeSymbology:'CODE128',category:'Books',       brand:null,     purchasePrice:8,    salePrice:14.99, alertQuantity:10, stock:{ main:50, sec:20 } },
    { name:'Wireless Earbuds Pro',     sku:'WEP-00222', barcode:'7890123456789', barcodeSymbology:'CODE128',category:'Electronics', brand:'Sony',   purchasePrice:80,   salePrice:149,   alertQuantity:5,  stock:{ main:25, sec:10 } },
    { name:'Mechanical Keyboard',      sku:'KB-00333',  barcode:'8901234567891', barcodeSymbology:'CODE128',category:'Electronics', brand:null,     purchasePrice:50,   salePrice:89,    alertQuantity:5,  stock:{ main:18, sec:0  } },
    { name:'USB-C Hub 7-in-1',         sku:'USB-00444', barcode:'9012345678901', barcodeSymbology:'CODE128',category:'Electronics', brand:null,     purchasePrice:22,   salePrice:45,    alertQuantity:10, stock:{ main:30, sec:15 } },
    { name:'Yoga Mat Premium',          sku:'YM-00555',  barcode:'0123456789012', barcodeSymbology:'CODE128',category:'Sports & Outdoors', brand:null, purchasePrice:18, salePrice:39,  alertQuantity:5,  stock:{ main:22, sec:8  } },
    { name:'Coffee Mug XL',             sku:'CM-00666',  barcode:'1234567890124', barcodeSymbology:'CODE128',category:'Home & Kitchen', brand:null, purchasePrice:8,  salePrice:19.99, alertQuantity:15, stock:{ main:45, sec:20 } },
  ]

  for (const pd of productData) {
    let product = await Product.findOne({ sku: pd.sku })
    if (!product) {
      product = await Product.create({
        name: pd.name, sku: pd.sku, barcode: pd.barcode, barcodeSymbology: pd.barcodeSymbology,
        category: cats[pd.category]._id, brand: pd.brand ? brands[pd.brand]?._id : null,
        unit: units['Piece']._id, purchasePrice: pd.purchasePrice, salePrice: pd.salePrice,
        alertQuantity: pd.alertQuantity, isActive: true,
      })
      // Seed stock
      await Stock.findOneAndUpdate({ product: product._id, warehouse: mainWH._id }, { $inc: { quantity: pd.stock.main } }, { upsert: true })
      await Stock.findOneAndUpdate({ product: product._id, warehouse: secWH._id  }, { $inc: { quantity: pd.stock.sec  } }, { upsert: true })
    }
  }
  console.log('✅ Products & stock seeded'.green)

  // ── Customers ─────────────────────────────────────────────
  const custData = [
    { name:'John Doe',       email:'john@example.com',    phone:'+1 555-0100', address:'New York, USA' },
    { name:'Jane Smith',     email:'jane@example.com',    phone:'+1 555-0200', address:'Los Angeles, USA' },
    { name:'Robert Johnson', email:'robert@example.com',  phone:'+1 555-0300', address:'Chicago, USA' },
    { name:'Emily Davis',    email:'emily@example.com',   phone:'+1 555-0400', address:'Houston, USA' },
    { name:'Michael Chen',   email:'michael@example.com', phone:'+1 555-0500', address:'Seattle, USA' },
  ]
  for (const c of custData) {
    if (!await Customer.findOne({ email: c.email })) await Customer.create(c)
  }
  console.log('✅ Customers seeded'.green)

  // ── Suppliers ─────────────────────────────────────────────
  const supData = [
    { name:'TechWorld Suppliers', email:'tech@techworld.com',    phone:'+1 555-1000', address:'Silicon Valley, CA' },
    { name:'Fashion Hub',          email:'contact@fashionhub.com',phone:'+1 555-2000', address:'New York, NY' },
    { name:'Book World',           email:'books@bookworld.com',   phone:'+1 555-3000', address:'Boston, MA' },
    { name:'Sports Direct',        email:'info@sportsdirect.com', phone:'+1 555-4000', address:'Chicago, IL' },
  ]
  for (const s of supData) {
    if (!await Supplier.findOne({ email: s.email })) await Supplier.create(s)
  }
  console.log('✅ Suppliers seeded'.green)

  // ── Sample sales ──────────────────────────────────────────
  const salesCount = await Sale.countDocuments()
  if (salesCount === 0) {
    const products = await Product.find().limit(5)
    const customer = await Customer.findOne()
    for (let i = 0; i < 10; i++) {
      const p1 = products[i % products.length]
      const p2 = products[(i + 1) % products.length]
      const grandTotal = p1.salePrice + p2.salePrice * 2
      await Sale.create({
        invoiceNo: `INV-${String(i + 1).padStart(6, '0')}`,
        customer: i % 3 === 0 ? customer._id : null,
        warehouse: mainWH._id,
        items: [
          { product: p1._id, name: p1.name, sku: p1.sku, quantity: 1, unitPrice: p1.salePrice, subtotal: p1.salePrice, total: p1.salePrice },
          { product: p2._id, name: p2.name, sku: p2.sku, quantity: 2, unitPrice: p2.salePrice, subtotal: p2.salePrice * 2, total: p2.salePrice * 2 },
        ],
        subtotal: grandTotal, grandTotal, paidAmount: i % 4 === 0 ? grandTotal / 2 : grandTotal,
        paymentMethod: i % 2 === 0 ? 'cash' : 'card',
        status: 'completed', createdBy: adminUser._id,
        createdAt: new Date(Date.now() - i * 86400000 * 2),
      })
    }
    console.log('✅ Sample sales seeded'.green)
  }

  // ── Sample expenses ───────────────────────────────────────
  const expCount = await Expense.countDocuments()
  if (expCount === 0) {
    await Expense.insertMany([
      { title:'Monthly Rent',    category:'Rent',      amount:2500, date:new Date('2024-01-01'), createdBy: adminUser._id },
      { title:'Electricity Bill',category:'Utilities', amount:380,  date:new Date('2024-01-05'), createdBy: adminUser._id },
      { title:'Staff Salaries',  category:'Salaries',  amount:8500, date:new Date('2024-01-31'), createdBy: adminUser._id },
      { title:'Facebook Ads',    category:'Marketing', amount:650,  date:new Date('2024-01-10'), createdBy: adminUser._id },
    ])
    console.log('✅ Sample expenses seeded'.green)
  }

  console.log('\n🎉 Database seeded successfully!'.green.bold)
  console.log('─────────────────────────────────'.gray)
  console.log('  Admin:   admin@sboxsystem.com / 123456'.cyan)
  console.log('  Manager: manager@sboxsystem.com / 123456'.cyan)
  console.log('  Cashier: cashier@sboxsystem.com / 123456'.cyan)
  console.log('─────────────────────────────────\n'.gray)
  process.exit(0)
}

seed().catch(err => { console.error(err.message.red); process.exit(1) })
