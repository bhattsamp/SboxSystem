/**
 * AC Demo Seed — Full lifecycle demo
 *
 * Flow:  Master Data → Products → Product Distribution
 *        → Purchase (Samsung 12 + Haier 15 units)
 *        → Sale (Samsung 5 + Haier 6 units)
 *        → Purchase Return (Samsung 2 units back to supplier)
 *        → Sales Return / Credit Note (Haier 1 unit from customer)
 *
 * Run:  node src/seeds/acDemo.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const colors   = require('colors')

const connectDB = require('../config/db')

const { Category, Brand, Unit, Tax, Warehouse, VoucherType } = require('../models/Category')
const { Customer, Supplier }   = require('../models/Customer')
const Product                  = require('../models/Product')
const ProductDistribution      = require('../models/ProductDistribution')
const Stock                    = require('../models/Stock')
const Purchase                 = require('../models/Purchase')
const Sale                     = require('../models/Sale')
const PurchaseReturn           = require('../models/PurchaseReturn')
const SaleReturn               = require('../models/SaleReturn')
const User                     = require('../models/User')

// ── helpers ───────────────────────────────────────────────────
const pad   = (n, len = 6) => String(n).padStart(len, '0')
const money = (n) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const step = (msg) => console.log(`\n${'─'.repeat(55)}`.gray + `\n  ${msg}`.cyan.bold)
const ok   = (msg) => console.log(`  ✅  ${msg}`.green)
const info = (msg) => console.log(`  ℹ   ${msg}`.yellow)

// ── main ──────────────────────────────────────────────────────
async function run() {
  await connectDB()
  console.log('\n🌱  AC DEMO SEED — Full Lifecycle'.cyan.bold)

  // ────────────────────────────────────────────────────────────
  step('1 / 10  MASTER DATA')
  // ────────────────────────────────────────────────────────────

  // Admin user (must exist)
  const admin = await User.findOne({ role: 'admin' })
  if (!admin) {
    console.error('  ❌  No admin user found. Run the main seed first: node src/seeds/index.js'.red)
    process.exit(1)
  }
  ok(`Admin user: ${admin.email}`)

  // Warehouse
  let warehouse = await Warehouse.findOne({ name: 'Main Warehouse' })
  if (!warehouse) warehouse = await Warehouse.create({ name: 'Main Warehouse', email: 'main@store.com', phone: '+91 99000 11000', address: 'Mumbai, India' })
  ok(`Warehouse: ${warehouse.name}`)

  // Tax — GST 18%
  let tax18 = await Tax.findOne({ name: 'GST 18%' })
  if (!tax18) tax18 = await Tax.create({ name: 'GST 18%', rate: 18 })
  ok(`Tax: ${tax18.name} @ ${tax18.rate}%`)

  // Unit
  let unitPcs = await Unit.findOne({ name: 'Piece' })
  if (!unitPcs) unitPcs = await Unit.create({ name: 'Piece', shortName: 'Pcs' })
  ok(`Unit: ${unitPcs.name}`)

  // Parent Category — Electronics
  let parentCat = await Category.findOne({ name: 'Electronics', parentCategory: null })
  if (!parentCat) parentCat = await Category.create({ name: 'Electronics', description: 'Electronic devices and appliances' })
  ok(`Parent Category: ${parentCat.name}`)

  // Sub Category — Air Conditioner
  let acCat = await Category.findOne({ name: 'Air Conditioner', parentCategory: parentCat._id })
  if (!acCat) acCat = await Category.create({ name: 'Air Conditioner', description: 'Split and window air conditioners', parentCategory: parentCat._id })
  ok(`Sub Category: ${acCat.name}  (parent → ${parentCat.name})`)

  // Brands
  let brandSamsung = await Brand.findOne({ name: 'Samsung' })
  if (!brandSamsung) brandSamsung = await Brand.create({ name: 'Samsung', description: 'Samsung Electronics' })

  let brandHaier = await Brand.findOne({ name: 'Haier' })
  if (!brandHaier) brandHaier = await Brand.create({ name: 'Haier', description: 'Haier India Appliances' })
  ok(`Brands: Samsung, Haier`)

  // Suppliers
  let supSamsung = await Supplier.findOne({ email: 'supply@samsung-india.com' })
  if (!supSamsung) supSamsung = await Supplier.create({ name: 'Samsung Electronics India', email: 'supply@samsung-india.com', phone: '+91 98001 11000', address: 'Noida, UP' })

  let supHaier = await Supplier.findOne({ email: 'supply@haier-india.com' })
  if (!supHaier) supHaier = await Supplier.create({ name: 'Haier India Appliances', email: 'supply@haier-india.com', phone: '+91 98002 22000', address: 'Pune, MH' })
  ok(`Suppliers: ${supSamsung.name}, ${supHaier.name}`)

  // Customer
  let customer = await Customer.findOne({ email: 'purchase@techsolutions.com' })
  if (!customer) customer = await Customer.create({ name: 'Tech Solutions Pvt Ltd', email: 'purchase@techsolutions.com', phone: '+91 98003 33000', address: 'Chennai, TN' })
  ok(`Customer: ${customer.name}`)

  // Voucher Types
  let vtCashSale = await VoucherType.findOne({ name: 'Cash Sale' })
  if (!vtCashSale) vtCashSale = await VoucherType.create({ name: 'Cash Sale', module: 'sales', prefix: 'CS', isDefault: true })

  let vtStdPO = await VoucherType.findOne({ name: 'Standard Purchase' })
  if (!vtStdPO) vtStdPO = await VoucherType.create({ name: 'Standard Purchase', module: 'purchase', prefix: 'SPO', isDefault: true })
  ok(`Voucher Types: Cash Sale, Standard Purchase`)


  // ────────────────────────────────────────────────────────────
  step('2 / 10  PRODUCT MASTER')
  // ────────────────────────────────────────────────────────────

  // Samsung AC
  let prodSamsung = await Product.findOne({ name: 'Samsung 1.5 Ton Inverter AC' })
  if (!prodSamsung) {
    prodSamsung = await Product.create({
      name: 'Samsung 1.5 Ton Inverter AC',
      description: 'Samsung 1.5 Ton 5 Star Wi-Fi Inverter Split Air Conditioner with Auto Clean',
      category: acCat._id,
      brand: brandSamsung._id,
      unit: unitPcs._id,
      alertQuantity: 3,
      isActive: true,
    })
  }
  ok(`Product: ${prodSamsung.name}`)

  // Haier AC
  let prodHaier = await Product.findOne({ name: 'Haier 1.5 Ton Inverter AC' })
  if (!prodHaier) {
    prodHaier = await Product.create({
      name: 'Haier 1.5 Ton Inverter AC',
      description: 'Haier 1.5 Ton 3 Star Inverter Split Air Conditioner with Self Clean Technology',
      category: acCat._id,
      brand: brandHaier._id,
      unit: unitPcs._id,
      alertQuantity: 3,
      isActive: true,
    })
  }
  ok(`Product: ${prodHaier.name}`)


  // ────────────────────────────────────────────────────────────
  step('3 / 10  PRODUCT DISTRIBUTION (SKU / PRICING / BARCODE)')
  // ────────────────────────────────────────────────────────────

  let distSamsung = await ProductDistribution.findOne({ sku: 'AC-SAM-1T5-001' })
  if (!distSamsung) {
    distSamsung = await ProductDistribution.create({
      product: prodSamsung._id,
      warehouse: warehouse._id,
      sku: 'AC-SAM-1T5-001',
      barcode: '8901234567100',
      barcodeSymbology: 'EAN13',
      purchasePrice: 35000,
      salePrice: 42000,
      mrp: 45000,
      taxRate: 18,
      tax: tax18._id,
      openingStock: 0,
    })
    ok(`Distribution: ${distSamsung.sku}  |  Purchase: ${money(35000)}  |  Sale: ${money(42000)}  |  MRP: ${money(45000)}`)
  } else {
    info(`Distribution already exists: ${distSamsung.sku}`)
  }

  let distHaier = await ProductDistribution.findOne({ sku: 'AC-HAI-1T5-001' })
  if (!distHaier) {
    distHaier = await ProductDistribution.create({
      product: prodHaier._id,
      warehouse: warehouse._id,
      sku: 'AC-HAI-1T5-001',
      barcode: '8901234567101',
      barcodeSymbology: 'EAN13',
      purchasePrice: 28000,
      salePrice: 34000,
      mrp: 38000,
      taxRate: 18,
      tax: tax18._id,
      openingStock: 0,
    })
    ok(`Distribution: ${distHaier.sku}  |  Purchase: ${money(28000)}  |  Sale: ${money(34000)}  |  MRP: ${money(38000)}`)
  } else {
    info(`Distribution already exists: ${distHaier.sku}`)
  }


  // ────────────────────────────────────────────────────────────
  step('4 / 10  PURCHASE  (Samsung ×12 + Haier ×15)')
  // ────────────────────────────────────────────────────────────

  let purchase = await Purchase.findOne({ referenceNo: 'PO-AC-000001' })
  if (!purchase) {
    // ── line item calculations ──────────────────────────────
    const samTaxableAmt = 12 * 35000                                // 420,000
    const samTaxAmt     = (samTaxableAmt * 18) / 100               //  75,600
    const samTotal      = samTaxableAmt + samTaxAmt                 // 495,600

    const haiTaxableAmt = 15 * 28000                                // 420,000
    const haiTaxAmt     = (haiTaxableAmt * 18) / 100               //  75,600
    const haiTotal      = haiTaxableAmt + haiTaxAmt                 // 495,600

    const subtotal   = samTaxableAmt + haiTaxableAmt               // 840,000
    const taxAmount  = samTaxAmt + haiTaxAmt                       // 151,200
    const grandTotal = subtotal + taxAmount                         // 991,200

    purchase = await Purchase.create({
      referenceNo: 'PO-AC-000001',
      supplier: supSamsung._id,               // primary supplier
      warehouse: warehouse._id,
      voucherType: vtStdPO._id,
      documentType: 'purchase',
      purchaseType: 'regular',
      status: 'received',                     // received → triggers stock add
      paymentMethod: 'Bank Transfer',
      paidAmount: grandTotal,                 // fully paid
      items: [
        {
          product: prodSamsung._id,
          name: 'Samsung 1.5 Ton Inverter AC',
          sku: 'AC-SAM-1T5-001',
          quantity: 12,
          unitCost: 35000,
          taxRate: 18,
          taxAmount: samTaxAmt,
          total: samTotal,
        },
        {
          product: prodHaier._id,
          name: 'Haier 1.5 Ton Inverter AC',
          sku: 'AC-HAI-1T5-001',
          quantity: 15,
          unitCost: 28000,
          taxRate: 18,
          taxAmount: haiTaxAmt,
          total: haiTotal,
        },
      ],
      subtotal,
      taxAmount,
      grandTotal,
      note: 'Initial bulk purchase — Samsung 12 units + Haier 15 units',
      createdBy: admin._id,
    })

    // Add stock manually (controller does this when status=received via API)
    await Stock.adjust(prodSamsung._id, warehouse._id, 12)
    await Stock.adjust(prodHaier._id,   warehouse._id, 15)

    ok(`Purchase created: ${purchase.referenceNo}`)
    ok(`Samsung AC  ×12 @ ${money(35000)} + 18% GST = ${money(samTotal)}`)
    ok(`Haier AC    ×15 @ ${money(28000)} + 18% GST = ${money(haiTotal)}`)
    ok(`Grand Total: ${money(grandTotal)}  (Fully Paid via Bank Transfer)`)
  } else {
    info(`Purchase already exists: ${purchase.referenceNo}`)
  }

  // Stock check after purchase
  const stockSamAfterPurch = await Stock.getQty(prodSamsung._id, warehouse._id)
  const stockHaiAfterPurch = await Stock.getQty(prodHaier._id,   warehouse._id)
  info(`Stock after purchase  →  Samsung: ${stockSamAfterPurch} pcs  |  Haier: ${stockHaiAfterPurch} pcs`)


  // ────────────────────────────────────────────────────────────
  step('5 / 10  SALE  (Samsung ×5 + Haier ×6  →  Customer)')
  // ────────────────────────────────────────────────────────────

  let sale = await Sale.findOne({ invoiceNo: 'INV-AC-000001' })
  if (!sale) {
    // Verify stock is sufficient
    const samStock = await Stock.getQty(prodSamsung._id, warehouse._id)
    const haiStock = await Stock.getQty(prodHaier._id,   warehouse._id)

    if (samStock < 5 || haiStock < 6) {
      console.error(`  ❌  Insufficient stock for sale. Samsung: ${samStock}, Haier: ${haiStock}`.red)
      process.exit(1)
    }

    // ── line item calculations ──────────────────────────────
    const samSaleNet  = 5 * 42000                                  // 210,000
    const samSaleTax  = (samSaleNet * 18) / 100                   //  37,800
    const samSaleTotal= samSaleNet + samSaleTax                    // 247,800

    const haiSaleNet  = 6 * 34000                                  // 204,000
    const haiSaleTax  = (haiSaleNet * 18) / 100                   //  36,720
    const haiSaleTotal= haiSaleNet + haiSaleTax                    // 240,720

    const subtotal   = samSaleNet + haiSaleNet                    // 414,000
    const taxAmount  = samSaleTax + haiSaleTax                    //  74,520
    const grandTotal = subtotal + taxAmount                        // 488,520

    sale = await Sale.create({
      invoiceNo: 'INV-AC-000001',
      customer: customer._id,
      warehouse: warehouse._id,
      voucherType: vtCashSale._id,
      saleType: 'retail',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      paidAmount: grandTotal,
      items: [
        {
          product: prodSamsung._id,
          name: 'Samsung 1.5 Ton Inverter AC',
          sku: 'AC-SAM-1T5-001',
          quantity: 5,
          unitPrice: 42000,
          discount: 0,
          discountType: 'fixed',
          taxRate: 18,
          taxAmount: samSaleTax,
          subtotal: samSaleNet,
          total: samSaleTotal,
        },
        {
          product: prodHaier._id,
          name: 'Haier 1.5 Ton Inverter AC',
          sku: 'AC-HAI-1T5-001',
          quantity: 6,
          unitPrice: 34000,
          discount: 0,
          discountType: 'fixed',
          taxRate: 18,
          taxAmount: haiSaleTax,
          subtotal: haiSaleNet,
          total: haiSaleTotal,
        },
      ],
      subtotal,
      taxAmount,
      grandTotal,
      note: 'Bulk sale to Tech Solutions Pvt Ltd',
      terms: 'Payment within 30 days',
      createdBy: admin._id,
    })

    // Deduct stock
    await Stock.adjust(prodSamsung._id, warehouse._id, -5)
    await Stock.adjust(prodHaier._id,   warehouse._id, -6)

    ok(`Sale / Invoice created: ${sale.invoiceNo}`)
    ok(`Samsung AC  ×5 @ ${money(42000)} + 18% GST = ${money(samSaleTotal)}`)
    ok(`Haier AC    ×6 @ ${money(34000)} + 18% GST = ${money(haiSaleTotal)}`)
    ok(`Grand Total: ${money(grandTotal)}  (Customer: ${customer.name})`)
  } else {
    info(`Sale already exists: ${sale.invoiceNo}`)
  }

  const stockSamAfterSale = await Stock.getQty(prodSamsung._id, warehouse._id)
  const stockHaiAfterSale = await Stock.getQty(prodHaier._id,   warehouse._id)
  info(`Stock after sale  →  Samsung: ${stockSamAfterSale} pcs  |  Haier: ${stockHaiAfterSale} pcs`)


  // ────────────────────────────────────────────────────────────
  step('6 / 10  PURCHASE RETURN  (Samsung ×2 — Defective Units)')
  // ────────────────────────────────────────────────────────────

  let purchaseReturn = await PurchaseReturn.findOne({ referenceNo: 'PRET-AC-000001' })
  if (!purchaseReturn) {
    const retQty   = 2
    const retCost  = 35000
    const retTotal = retQty * retCost   // 70,000

    purchaseReturn = await PurchaseReturn.create({
      referenceNo: 'PRET-AC-000001',
      purchase: purchase._id,
      supplier: supSamsung._id,
      warehouse: warehouse._id,
      items: [
        {
          product: prodSamsung._id,
          name: 'Samsung 1.5 Ton Inverter AC',
          sku: 'AC-SAM-1T5-001',
          quantity: retQty,
          unitCost: retCost,
          total: retTotal,
        },
      ],
      totalAmount: retTotal,
      reason: 'Defective units — compressor noise reported during QC inspection',
      note: `Returning 2 of 12 purchased Samsung ACs. Ref: ${purchase.referenceNo}`,
      createdBy: admin._id,
    })

    // Stock leaves warehouse back to supplier
    await Stock.adjust(prodSamsung._id, warehouse._id, -retQty)

    ok(`Purchase Return created: ${purchaseReturn.referenceNo}`)
    ok(`Samsung AC  ×2 @ ${money(retCost)} = ${money(retTotal)}  (Supplier: ${supSamsung.name})`)
    ok(`Reason: ${purchaseReturn.reason}`)
  } else {
    info(`Purchase return already exists: ${purchaseReturn.referenceNo}`)
  }

  const stockSamAfterPRet = await Stock.getQty(prodSamsung._id, warehouse._id)
  info(`Stock after purchase return  →  Samsung: ${stockSamAfterPRet} pcs`)


  // ────────────────────────────────────────────────────────────
  step('7 / 10  SALES RETURN / CREDIT NOTE  (Haier ×1 — Customer Return)')
  // ────────────────────────────────────────────────────────────

  let saleReturn = await SaleReturn.findOne({ referenceNo: 'SRET-AC-000001' })
  if (!saleReturn) {
    const sretQty   = 1
    const sretPrice = 34000
    const sretTotal = sretQty * sretPrice    // 34,000

    saleReturn = await SaleReturn.create({
      referenceNo: 'SRET-AC-000001',
      sale: sale._id,
      customer: customer._id,
      warehouse: warehouse._id,
      items: [
        {
          product: prodHaier._id,
          name: 'Haier 1.5 Ton Inverter AC',
          sku: 'AC-HAI-1T5-001',
          quantity: sretQty,
          unitPrice: sretPrice,
          total: sretTotal,
        },
      ],
      totalAmount: sretTotal,
      reason: 'Customer reported installation issue — returning 1 unit for replacement',
      note: `Credit note against Invoice: ${sale.invoiceNo}`,
      createdBy: admin._id,
    })

    // Stock returns from customer to warehouse
    await Stock.adjust(prodHaier._id, warehouse._id, sretQty)

    ok(`Sales Return / Credit Note created: ${saleReturn.referenceNo}`)
    ok(`Haier AC  ×1 @ ${money(sretPrice)} = ${money(sretTotal)}  (Customer: ${customer.name})`)
    ok(`Reason: ${saleReturn.reason}`)
  } else {
    info(`Sale return already exists: ${saleReturn.referenceNo}`)
  }

  const stockHaiAfterSRet = await Stock.getQty(prodHaier._id, warehouse._id)
  info(`Stock after sales return  →  Haier: ${stockHaiAfterSRet} pcs`)


  // ────────────────────────────────────────────────────────────
  step('8 / 10  FINAL STOCK SUMMARY')
  // ────────────────────────────────────────────────────────────

  const finalSamStock = await Stock.getQty(prodSamsung._id, warehouse._id)
  const finalHaiStock = await Stock.getQty(prodHaier._id,   warehouse._id)

  console.log(`
  ┌──────────────────────────────────────────────────────┐
  │              FINAL STOCK POSITION                    │
  ├─────────────────────────────────┬────────────────────┤
  │  Product                        │  Qty  │  Explanation │
  ├─────────────────────────────────┼────────────────────┤
  │  Samsung 1.5T Inverter AC       │  ${String(finalSamStock).padEnd(3)} pcs  │  12 in − 5 sold − 2 ret
  │  Haier 1.5T Inverter AC         │  ${String(finalHaiStock).padEnd(3)} pcs  │  15 in − 6 sold + 1 ret
  └─────────────────────────────────┴────────────────────┘`.cyan)


  // ────────────────────────────────────────────────────────────
  step('9 / 10  TRANSACTION SUMMARY')
  // ────────────────────────────────────────────────────────────

  console.log(`
  ${'MASTERS'.bold}
  ─ Parent Category : Electronics
  ─ Sub Category    : Air Conditioner
  ─ Brands          : Samsung, Haier
  ─ Suppliers       : Samsung Electronics India, Haier India Appliances
  ─ Customer        : Tech Solutions Pvt Ltd
  ─ Voucher Types   : Cash Sale (Sales), Standard Purchase (Purchase)
  ─ Tax             : GST 18%

  ${'PRODUCT MASTER'.bold}
  ─ Samsung 1.5 Ton Inverter AC  (SKU: AC-SAM-1T5-001)
  ─ Haier 1.5 Ton Inverter AC    (SKU: AC-HAI-1T5-001)

  ${'PRODUCT DISTRIBUTION'.bold}
  ─ Samsung → Purchase ₹35,000  │  Sale ₹42,000  │  MRP ₹45,000  │  GST 18%
  ─ Haier   → Purchase ₹28,000  │  Sale ₹34,000  │  MRP ₹38,000  │  GST 18%

  ${'PURCHASE  [PO-AC-000001]'.bold}
  ─ Samsung ×12 @ ₹35,000 + 18% GST = ₹4,95,600
  ─ Haier   ×15 @ ₹28,000 + 18% GST = ₹4,95,600
  ─ Grand Total: ₹9,91,200  │  Status: Received  │  Paid via Bank Transfer

  ${'SALE  [INV-AC-000001]'.bold}
  ─ Samsung ×5 @ ₹42,000 + 18% GST = ₹2,47,800
  ─ Haier   ×6 @ ₹34,000 + 18% GST = ₹2,40,720
  ─ Grand Total: ₹4,88,520  │  Customer: Tech Solutions Pvt Ltd

  ${'PURCHASE RETURN  [PRET-AC-000001]'.bold}
  ─ Samsung ×2 @ ₹35,000 = ₹70,000  │  Reason: Defective units (compressor noise)

  ${'SALES RETURN / CREDIT NOTE  [SRET-AC-000001]'.bold}
  ─ Haier ×1 @ ₹34,000 = ₹34,000  │  Reason: Customer installation issue

  ${'FINAL STOCK'.bold}
  ─ Samsung AC : ${finalSamStock} pcs  (12 purchased − 5 sold − 2 returned to supplier)
  ─ Haier AC   : ${finalHaiStock} pcs  (15 purchased − 6 sold + 1 returned by customer)
`.white)


  // ────────────────────────────────────────────────────────────
  step('10 / 10  DONE')
  // ────────────────────────────────────────────────────────────
  console.log('\n  🎉  AC Demo data created successfully!\n'.green.bold)
  process.exit(0)
}

run().catch(err => {
  console.error(`\n  ❌  Error: ${err.message}`.red)
  console.error(err)
  process.exit(1)
})
