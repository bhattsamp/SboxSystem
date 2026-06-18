/**
 * freshSeed.js — Wipes the DB and seeds all 124+ products + full transaction data
 * Run: node src/seeds/freshSeed.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const colors   = require('colors')

const connectDB = require('../config/db')

// ── Models ────────────────────────────────────────────────────
const User              = require('../models/User')
const { Category, Brand, Unit, BaseUnit, VariationAttribute,
        PaymentMethod, Tax, Warehouse, VoucherType } = require('../models/Category')
const { Customer, Supplier }  = require('../models/Customer')
const { Expense, ExpenseCategory, Setting, Notification } = require('../models/Expense')
const Product           = require('../models/Product')
const ProductDistribution = require('../models/ProductDistribution')
const Stock             = require('../models/Stock')
const Purchase          = require('../models/Purchase')
const PurchaseReturn    = require('../models/PurchaseReturn')
const Sale              = require('../models/Sale')
const SaleReturn        = require('../models/SaleReturn')
const SalesOrder        = require('../models/SalesOrder')
const DeliveryNote      = require('../models/DeliveryNote')
const GoodsReceiptNote  = require('../models/GoodsReceiptNote')
const Quotation         = require('../models/Quotation')
const Adjustment        = require('../models/Adjustment')
const Transfer          = require('../models/Transfer')
const Hold              = require('../models/Hold')
const Language          = require('../models/Language')

const ok   = (m) => console.log(`  ✅  ${m}`.green)
const step = (m) => console.log(`\n${'─'.repeat(60)}\n  ${m}`.cyan.bold)

// ── PRODUCT CATALOG ───────────────────────────────────────────
// Format per item: { name, sku, purchase, sale, mrp, stock, alert, description? }
// taxRate: 10 default unless overridden on category
const CATALOG = {
  'Air Conditioners': {
    parent: 'Electronics', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'AC 12000 MSAF24-12CRDN1',  sku: 'AC-12K-001',  purchase: 780,  sale: 1050, mrp: 1150, stock: 15, alert: 3 },
      { name: 'AC 18000 MSAF24-18CRDN1',  sku: 'AC-18K-001',  purchase: 1100, sale: 1450, mrp: 1600, stock: 12, alert: 3 },
      { name: 'AC 24000 MSAF-24CRDN1',    sku: 'AC-24K-001',  purchase: 1400, sale: 1900, mrp: 2100, stock: 10, alert: 2 },
      { name: 'AC Stand 24-MFPA 24CRDN1', sku: 'AC-ST24-001', purchase: 1800, sale: 2400, mrp: 2700, stock: 8,  alert: 2 },
    ],
  },
  'Amplifiers': {
    parent: 'Electronics', brand: 'RS Brand', unit: 'Piece', tax: 10,
    items: [
      { name: 'Amplifier A2000 2-Way',    sku: 'AMP-A2K-001',  purchase: 220, sale: 350,  mrp: 380,  stock: 10, alert: 2 },
      { name: 'Amplifier A3000 2-Way',    sku: 'AMP-A3K-001',  purchase: 310, sale: 480,  mrp: 520,  stock: 10, alert: 2 },
      { name: 'Amplifier B18 4-Way',      sku: 'AMP-B18-001',  purchase: 420, sale: 650,  mrp: 720,  stock: 8,  alert: 2 },
      { name: 'Amplifier T08 Processor',  sku: 'AMP-T08-001',  purchase: 580, sale: 880,  mrp: 960,  stock: 6,  alert: 2 },
      { name: 'Power Amplifier RS 2000',  sku: 'AMP-RS2K-001', purchase: 490, sale: 750,  mrp: 820,  stock: 8,  alert: 2 },
      { name: 'Power Sequencer RS 128',   sku: 'AMP-PS128-001',purchase: 140, sale: 230,  mrp: 260,  stock: 12, alert: 3 },
    ],
  },
  'Barbeque Machines': {
    parent: 'Home & Kitchen', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Barbeque GG1',  sku: 'BBQ-GG1-001',  purchase: 85,  sale: 130, mrp: 150, stock: 15, alert: 3 },
      { name: 'Barbeque GG10', sku: 'BBQ-GG10-001', purchase: 150, sale: 230, mrp: 260, stock: 12, alert: 3 },
      { name: 'Barbeque GG11', sku: 'BBQ-GG11-001', purchase: 220, sale: 340, mrp: 380, stock: 10, alert: 2 },
    ],
  },
  'Batteries': {
    parent: 'Automotive', brand: 'MF Batteries', unit: 'Piece', tax: 10,
    items: [
      { name: 'Car Battery MF N-40',              sku: 'BAT-N40-001',    purchase: 95,   sale: 145,  mrp: 160,  stock: 20, alert: 5 },
      { name: 'Car Battery MF N-50',              sku: 'BAT-N50-001',    purchase: 110,  sale: 165,  mrp: 185,  stock: 20, alert: 5 },
      { name: 'Car Battery MF N-70',              sku: 'BAT-N70-001',    purchase: 140,  sale: 210,  mrp: 235,  stock: 18, alert: 5 },
      { name: 'Car Battery MF N-75',              sku: 'BAT-N75-001',    purchase: 155,  sale: 230,  mrp: 260,  stock: 18, alert: 5 },
      { name: 'Lithium Ion Battery 10KWH 48V200AH',sku: 'BAT-LI10K-001', purchase: 1250, sale: 1850, mrp: 2000, stock: 5,  alert: 1 },
      { name: 'Lithium Ion Battery 5KWH 48V200AH', sku: 'BAT-LI5K-001',  purchase: 680,  sale: 1000, mrp: 1100, stock: 8,  alert: 2 },
      { name: 'Battery MF-DIN55',                 sku: 'BAT-DIN55-001',  purchase: 115,  sale: 175,  mrp: 195,  stock: 20, alert: 5 },
      { name: 'Battery MF-DIN75',                 sku: 'BAT-DIN75-001',  purchase: 150,  sale: 225,  mrp: 250,  stock: 18, alert: 5 },
      { name: 'Battery N120',                     sku: 'BAT-N120-001',   purchase: 220,  sale: 330,  mrp: 370,  stock: 15, alert: 4 },
      { name: 'Battery N150',                     sku: 'BAT-N150-001',   purchase: 280,  sale: 420,  mrp: 465,  stock: 12, alert: 3 },
      { name: 'Battery N200',                     sku: 'BAT-N200-001',   purchase: 350,  sale: 530,  mrp: 590,  stock: 10, alert: 3 },
    ],
  },
  'Battery Chargers': {
    parent: 'Automotive', brand: 'MA Chargers', unit: 'Piece', tax: 10,
    items: [
      { name: 'MA 1210A – 10A',       sku: 'CHG-MA10A-001',  purchase: 22,  sale: 35,  mrp: 40,  stock: 25, alert: 5 },
      { name: 'MA 1220A – 20A',       sku: 'CHG-MA20A-001',  purchase: 34,  sale: 52,  mrp: 58,  stock: 20, alert: 5 },
      { name: 'MA 1230A – 30A',       sku: 'CHG-MA30A-001',  purchase: 50,  sale: 76,  mrp: 85,  stock: 18, alert: 4 },
      { name: 'MA 1240A – 40A',       sku: 'CHG-MA40A-001',  purchase: 70,  sale: 105, mrp: 118, stock: 15, alert: 4 },
      { name: 'MA 1250A – 50A',       sku: 'CHG-MA50A-001',  purchase: 90,  sale: 135, mrp: 152, stock: 12, alert: 3 },
      { name: 'E-Bike Charger (FOC)', sku: 'CHG-EBIKE-001',  purchase: 0,   sale: 0,   mrp: 0,   stock: 20, alert: 5 },
    ],
  },
  'Bluetooth Speakers': {
    parent: 'Electronics', brand: 'RS Brand', unit: 'Piece', tax: 10,
    items: [
      { name: 'Bluetooth Speaker RS 411', sku: 'SPK-RS411-001', purchase: 42,  sale: 65,  mrp: 75,  stock: 20, alert: 5 },
      { name: 'Bluetooth Speaker RS 422', sku: 'SPK-RS422-001', purchase: 58,  sale: 88,  mrp: 100, stock: 20, alert: 5 },
      { name: 'Bluetooth Speaker RS 433', sku: 'SPK-RS433-001', purchase: 78,  sale: 118, mrp: 135, stock: 18, alert: 4 },
      { name: 'Bluetooth Speaker RS 444', sku: 'SPK-RS444-001', purchase: 98,  sale: 148, mrp: 170, stock: 15, alert: 4 },
      { name: 'Bluetooth Speaker RS 455', sku: 'SPK-RS455-001', purchase: 128, sale: 192, mrp: 220, stock: 12, alert: 3 },
      { name: 'Bluetooth Speaker RS 488', sku: 'SPK-RS488-001', purchase: 155, sale: 235, mrp: 268, stock: 12, alert: 3 },
    ],
  },
  'Borewell Machinery Parts': {
    parent: 'Construction', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Air Compressor',       sku: 'BWM-AIRC-001',  purchase: 680, sale: 1050, mrp: 1180, stock: 5, alert: 1 },
      { name: 'Drill Rig & Drill Pipe',sku: 'BWM-DRILL-001', purchase: 1250,sale: 1900, mrp: 2100, stock: 3, alert: 1 },
      { name: 'Drill Tools',           sku: 'BWM-TOOLS-001', purchase: 145, sale: 225,  mrp: 250,  stock: 10,alert: 2 },
      { name: 'Hose Pipe',             sku: 'BWM-HOSE-001',  purchase: 55,  sale: 85,   mrp: 95,   stock: 20,alert: 5 },
    ],
  },
  'Building Material': {
    parent: 'Construction', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Plywood Sheet',         sku: 'BLD-PLY-001',   purchase: 32,  sale: 50,   mrp: 58,   stock: 50, alert: 10 },
      { name: 'Sofa 2.1M',             sku: 'BLD-SF21M-001', purchase: 680, sale: 1050, mrp: 1180, stock: 5,  alert: 1  },
      { name: 'Sofa 2 Seats 1.2M',     sku: 'BLD-SF12M-001', purchase: 490, sale: 750,  mrp: 850,  stock: 6,  alert: 1  },
      { name: 'Sofa 3 Seats 2M',       sku: 'BLD-SF2M-001',  purchase: 600, sale: 920,  mrp: 1050, stock: 5,  alert: 1  },
    ],
  },
  'Bulbs & Lights': {
    parent: 'Electronics', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Emergency Bulb 9W',         sku: 'BLB-EM9W-001',  purchase: 7,  sale: 12,  mrp: 14,  stock: 80, alert: 15 },
      { name: 'Emergency Bulb 12W',        sku: 'BLB-EM12W-001', purchase: 9,  sale: 14,  mrp: 17,  stock: 80, alert: 15 },
      { name: 'Emergency Bulb 15W',        sku: 'BLB-EM15W-001', purchase: 11, sale: 18,  mrp: 21,  stock: 80, alert: 15 },
      { name: 'Rechargeable Bulb 20W',     sku: 'BLB-RC20W-001', purchase: 13, sale: 20,  mrp: 24,  stock: 60, alert: 12 },
      { name: 'Rechargeable Bulb 40W',     sku: 'BLB-RC40W-001', purchase: 18, sale: 28,  mrp: 32,  stock: 60, alert: 12 },
      { name: 'Rechargeable Bulb 60W',     sku: 'BLB-RC60W-001', purchase: 24, sale: 38,  mrp: 44,  stock: 50, alert: 10 },
      { name: 'Rechargeable Bulb 80W',     sku: 'BLB-RC80W-001', purchase: 30, sale: 46,  mrp: 54,  stock: 50, alert: 10 },
      { name: 'Rechargeable Light 50W',    sku: 'BLB-RL50W-001', purchase: 42, sale: 65,  mrp: 75,  stock: 40, alert: 8  },
      { name: 'Rechargeable Light 300W',   sku: 'BLB-RL300W-001',purchase: 120,sale: 185, mrp: 210, stock: 25, alert: 5  },
    ],
  },
  'Cables': {
    parent: 'Electronics', brand: 'RR Brand', unit: 'Roll', tax: 10,
    items: [
      { name: 'RR 1.5X1C Black Roll',          sku: 'CAB-RR15BK-001', purchase: 50,  sale: 78,  mrp: 88,  stock: 30, alert: 5 },
      { name: 'RR 2.5X3C Flex White',          sku: 'CAB-RR25FW-001', purchase: 88,  sale: 135, mrp: 152, stock: 25, alert: 5 },
      { name: 'RR 2.5X3C Flex White Cable Roll',sku: 'CAB-RR25FWR-001',purchase: 78,  sale: 120, mrp: 135, stock: 25, alert: 5 },
      { name: 'RR 1.5X3C White Roll',          sku: 'CAB-RR15WH-001', purchase: 62,  sale: 95,  mrp: 108, stock: 30, alert: 5 },
      { name: 'RR 1.5X1C Red Roll',            sku: 'CAB-RR15RD-001', purchase: 50,  sale: 78,  mrp: 88,  stock: 30, alert: 5 },
    ],
  },
  'Car Accessories': {
    parent: 'Automotive', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Automobile Tyre',           sku: 'CAR-TYRE-001',  purchase: 220, sale: 340, mrp: 380, stock: 20, alert: 4 },
      { name: 'Cleaning Clothes (FOC)',     sku: 'CAR-CLTH-001',  purchase: 0,   sale: 0,   mrp: 0,   stock: 50, alert: 10 },
      { name: 'Rechargeable Fan',           sku: 'CAR-FAN-001',   purchase: 34,  sale: 52,  mrp: 60,  stock: 25, alert: 5  },
      { name: 'Car Mount 32 MCH',           sku: 'CAR-MNT-001',   purchase: 16,  sale: 26,  mrp: 30,  stock: 30, alert: 6  },
      { name: 'Car Vacuum Cleaner 1',       sku: 'CAR-VAC1-001',  purchase: 50,  sale: 78,  mrp: 88,  stock: 20, alert: 4  },
      { name: 'Car Vacuum Cleaner 2',       sku: 'CAR-VAC2-001',  purchase: 70,  sale: 108, mrp: 122, stock: 18, alert: 4  },
      { name: 'Car Wash Spray',             sku: 'CAR-WASH-001',  purchase: 10,  sale: 18,  mrp: 22,  stock: 40, alert: 8  },
      { name: 'Water Gun Sprayer',          sku: 'CAR-WGUN-001',  purchase: 16,  sale: 26,  mrp: 30,  stock: 35, alert: 7  },
    ],
  },
  'CCTV Cameras': {
    parent: 'Electronics', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'CCTV Model 360 Fish Eye',         sku: 'CCTV-360FE-001',  purchase: 98,  sale: 152, mrp: 172, stock: 15, alert: 3 },
      { name: 'CCTV Model Bullet',               sku: 'CCTV-BUL-001',    purchase: 72,  sale: 110, mrp: 125, stock: 20, alert: 4 },
      { name: 'CCTV Model Bullet 360 Fish Eye',  sku: 'CCTV-BUL360-001', purchase: 115, sale: 175, mrp: 200, stock: 12, alert: 3 },
      { name: 'IP Cam P77',                      sku: 'CCTV-IPP77-001',  purchase: 80,  sale: 125, mrp: 142, stock: 15, alert: 3 },
      { name: 'IP Cam VN',                       sku: 'CCTV-IPVN-001',   purchase: 85,  sale: 132, mrp: 150, stock: 15, alert: 3 },
    ],
  },
  'Charging Cables': {
    parent: 'Electronics', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Multi Cable Car',          sku: 'CC-MCAR-001',  purchase: 8,  sale: 14, mrp: 17, stock: 50, alert: 10 },
      { name: 'Multi Cable Double',       sku: 'CC-MDBL-001',  purchase: 9,  sale: 16, mrp: 19, stock: 50, alert: 10 },
      { name: 'Multi Cable Multi',        sku: 'CC-MMUL-001',  purchase: 11, sale: 18, mrp: 22, stock: 50, alert: 10 },
      { name: 'Multi Cable Single 2A',    sku: 'CC-MSN2A-001', purchase: 7,  sale: 12, mrp: 15, stock: 60, alert: 12 },
      { name: 'Charge Plug Car',          sku: 'CC-PCAR-001',  purchase: 6,  sale: 10, mrp: 12, stock: 50, alert: 10 },
      { name: 'Charge Plug Double',       sku: 'CC-PDBL-001',  purchase: 7,  sale: 12, mrp: 14, stock: 50, alert: 10 },
      { name: 'Charge Plug Multi',        sku: 'CC-PMUL-001',  purchase: 8,  sale: 14, mrp: 16, stock: 50, alert: 10 },
      { name: 'Charge Plug Single 2A',    sku: 'CC-PSN2A-001', purchase: 5,  sale: 9,  mrp: 11, stock: 60, alert: 12 },
    ],
  },
  'Coffee Makers': {
    parent: 'Home & Kitchen', brand: 'Elekom', unit: 'Piece', tax: 10,
    items: [
      { name: 'Coffee Maker EK 207 (Elekom)',  sku: 'COF-EK207-001',  purchase: 42,  sale: 65,  mrp: 75,  stock: 12, alert: 3 },
      { name: 'Coffee Maker EK 506 (Elekom)',  sku: 'COF-EK506-001',  purchase: 78,  sale: 120, mrp: 138, stock: 10, alert: 3 },
      { name: 'Coffee Maker EK 6870 (Elekom)', sku: 'COF-EK6870-001', purchase: 118, sale: 182, mrp: 208, stock: 8,  alert: 2 },
      { name: 'Coffee Maker RS 506 2026',      sku: 'COF-RS506-001',  purchase: 92,  sale: 142, mrp: 162, stock: 8,  alert: 2 },
      { name: 'Espresso Coffee Maker',         sku: 'COF-ESP-001',    purchase: 225, sale: 348, mrp: 395, stock: 5,  alert: 1 },
    ],
  },
  'DVD Players': {
    parent: 'Electronics', brand: 'RS Brand', unit: 'Piece', tax: 10,
    items: [
      { name: 'DVD Player RS-531',    sku: 'DVD-RS531-001', purchase: 98,  sale: 152, mrp: 172, stock: 10, alert: 2 },
      { name: 'DVD Player RS-KM-2',   sku: 'DVD-RSKM2-001', purchase: 120, sale: 185, mrp: 210, stock: 10, alert: 2 },
      { name: 'DVD Player RS-KM-3',   sku: 'DVD-RSKM3-001', purchase: 145, sale: 225, mrp: 255, stock: 8,  alert: 2 },
      { name: 'DVD Player RS-KM-9',   sku: 'DVD-RSKM9-001', purchase: 185, sale: 285, mrp: 325, stock: 8,  alert: 2 },
    ],
  },
  'Earphones': {
    parent: 'Electronics', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Earphone 895B',    sku: 'EAR-895B-001', purchase: 22, sale: 35,  mrp: 42,  stock: 30, alert: 6 },
      { name: 'Earphone A3',      sku: 'EAR-A3-001',   purchase: 35, sale: 55,  mrp: 65,  stock: 30, alert: 6 },
      { name: 'Earphone All',     sku: 'EAR-ALL-001',  purchase: 14, sale: 22,  mrp: 28,  stock: 40, alert: 8 },
    ],
  },
  'Electric Bikes': {
    parent: 'Automotive', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Electric Bike Colourful Horse',    sku: 'EBK-CLH-001',  purchase: 1250, sale: 1850, mrp: 2100, stock: 5, alert: 1 },
      { name: 'Electric Bike Dalishen (Hercules)',sku: 'EBK-DAL-001',  purchase: 1550, sale: 2250, mrp: 2500, stock: 5, alert: 1 },
      { name: 'Electric Bike Free Wind',          sku: 'EBK-FWN-001',  purchase: 1050, sale: 1550, mrp: 1750, stock: 5, alert: 1 },
      { name: 'Electric Bike Golden Eagle',       sku: 'EBK-GEA-001',  purchase: 1450, sale: 2100, mrp: 2400, stock: 4, alert: 1 },
      { name: 'Electric Bike Huanying',           sku: 'EBK-HUY-001',  purchase: 1180, sale: 1720, mrp: 1950, stock: 5, alert: 1 },
      { name: 'Electric Bike Kuzhan',             sku: 'EBK-KUZ-001',  purchase: 1320, sale: 1920, mrp: 2180, stock: 4, alert: 1 },
      { name: 'Electric Bike Mini Ice Cream Yellow',sku:'EBK-MIN-001',  purchase: 980,  sale: 1450, mrp: 1650, stock: 6, alert: 1 },
      { name: 'Electric Bike Modern (Mo Deng)',   sku: 'EBK-MOD-001',  purchase: 1650, sale: 2400, mrp: 2700, stock: 4, alert: 1 },
    ],
  },
  'Electric Beauty Products': {
    parent: 'Personal Care', brand: 'Elekom', unit: 'Piece', tax: 10,
    items: [
      { name: 'Hair Straightener EK-106',    sku: 'EBT-EK106-001',   purchase: 22, sale: 35,  mrp: 42,  stock: 20, alert: 4 },
      { name: 'Hair Clipper EK-1118',        sku: 'EBT-EK1118-001',  purchase: 16, sale: 28,  mrp: 32,  stock: 25, alert: 5 },
      { name: 'Hair Straightener EK-1633',   sku: 'EBT-EK1633-001',  purchase: 34, sale: 52,  mrp: 60,  stock: 18, alert: 4 },
      { name: 'Hair Straightener EK-1634',   sku: 'EBT-EK1634-001',  purchase: 38, sale: 58,  mrp: 68,  stock: 18, alert: 4 },
      { name: 'Hair Dryer EK-644',           sku: 'EBT-EK644-001',   purchase: 28, sale: 44,  mrp: 52,  stock: 20, alert: 4 },
      { name: 'Hair Dryer EK-6600',          sku: 'EBT-EK6600-001',  purchase: 42, sale: 65,  mrp: 75,  stock: 18, alert: 4 },
      { name: 'Hair Dryer EK-6600W',         sku: 'EBT-EK6600W-001', purchase: 44, sale: 68,  mrp: 78,  stock: 18, alert: 4 },
      { name: 'Hair Dryer EK-6608',          sku: 'EBT-EK6608-001',  purchase: 50, sale: 78,  mrp: 90,  stock: 15, alert: 3 },
      { name: 'Hair Dryer EK-6609',          sku: 'EBT-EK6609-001',  purchase: 56, sale: 86,  mrp: 98,  stock: 15, alert: 3 },
      { name: 'Hair Dryer EK-669',           sku: 'EBT-EK669-001',   purchase: 34, sale: 52,  mrp: 60,  stock: 20, alert: 4 },
      { name: 'Hair Dryer EK-8210',          sku: 'EBT-EK8210-001',  purchase: 70, sale: 108, mrp: 125, stock: 12, alert: 3 },
      { name: 'Hair Dryer EK-8210W',         sku: 'EBT-EK8210W-001', purchase: 78, sale: 120, mrp: 138, stock: 12, alert: 3 },
    ],
  },
  'Electric Kettles': {
    parent: 'Home & Kitchen', brand: 'Generic', unit: 'Piece', tax: 10,
    items: [
      { name: 'Electric Kettle AP-KT315', sku: 'EKT-APKT-001', purchase: 22, sale: 35,  mrp: 42,  stock: 20, alert: 4 },
      { name: 'Electric Kettle A-Plus 1951',sku:'EKT-AP51-001', purchase: 28, sale: 44,  mrp: 52,  stock: 20, alert: 4 },
      { name: 'Electric Kettle KK304A',   sku: 'EKT-KK30-001', purchase: 25, sale: 40,  mrp: 46,  stock: 20, alert: 4 },
      { name: 'Electric Kettle KK802A',   sku: 'EKT-KK80-001', purchase: 34, sale: 52,  mrp: 60,  stock: 18, alert: 4 },
      { name: 'Electric Kettle MEN438WA', sku: 'EKT-MEN-001',  purchase: 30, sale: 48,  mrp: 55,  stock: 20, alert: 4 },
      { name: 'Electric Kettle MRK-3252', sku: 'EKT-MRK-001',  purchase: 36, sale: 56,  mrp: 65,  stock: 18, alert: 4 },
      { name: 'Electric Kettle PR-202',   sku: 'EKT-PR-001',   purchase: 20, sale: 32,  mrp: 38,  stock: 22, alert: 5 },
      { name: 'Electric Kettle RS-K280',  sku: 'EKT-RSK-001',  purchase: 26, sale: 42,  mrp: 48,  stock: 20, alert: 4 },
    ],
  },
  'Electric Rice Cookers': {
    parent: 'Home & Kitchen', brand: 'RS Brand', unit: 'Piece', tax: 10,
    items: [
      { name: 'Electric Rice Cooker 1.8L',     sku: 'ERC-18L-001',  purchase: 34, sale: 52,  mrp: 60,  stock: 20, alert: 4 },
      { name: 'Electric Rice Cooker RS AK 2.2L',sku:'ERC-AK22-001', purchase: 42, sale: 65,  mrp: 75,  stock: 18, alert: 4 },
      { name: 'Electric Rice Cooker RS AK 2.8L',sku:'ERC-AK28-001', purchase: 50, sale: 78,  mrp: 90,  stock: 15, alert: 3 },
      { name: 'Electric Rice Cooker RS 601C',  sku: 'ERC-601C-001', purchase: 70, sale: 108, mrp: 125, stock: 12, alert: 3 },
    ],
  },
}

// ── MAIN ──────────────────────────────────────────────────────
async function run() {
  await connectDB()
  console.log('\n🌱  FRESH SEED — Full Product Catalog + All Modules\n'.cyan.bold)

  // ── PHASE 1: WIPE ─────────────────────────────────────────
  step('PHASE 1 — Wiping existing data')
  await Promise.all([
    User.deleteMany(), Category.deleteMany(), Brand.deleteMany(),
    Unit.deleteMany(), BaseUnit.deleteMany(), VariationAttribute.deleteMany(),
    PaymentMethod.deleteMany(), Tax.deleteMany(), Warehouse.deleteMany(),
    VoucherType.deleteMany(), Customer.deleteMany(), Supplier.deleteMany(),
    Expense.deleteMany(), ExpenseCategory.deleteMany(), Setting.deleteMany(),
    Notification.deleteMany(), Product.deleteMany(), ProductDistribution.deleteMany(),
    Stock.deleteMany(), Purchase.deleteMany(), PurchaseReturn.deleteMany(),
    Sale.deleteMany(), SaleReturn.deleteMany(), SalesOrder.deleteMany(),
    DeliveryNote.deleteMany(), GoodsReceiptNote.deleteMany(),
    Quotation.deleteMany(), Adjustment.deleteMany(), Transfer.deleteMany(),
    Hold.deleteMany(), Language.deleteMany(),
  ])
  ok('All collections cleared')

  // ── PHASE 2: SETTINGS ─────────────────────────────────────
  step('PHASE 2 — Settings')
  await Setting.create({
    companyName: 'InfyPOS Demo Store', email: 'admin@infypos.com',
    phone: '+1 555-0100', address: '123 Business Avenue, New York, NY 10001',
    currency: 'USD', currencySymbol: '$', invoicePrefix: 'INV',
    taxEnabled: true, defaultTaxRate: 10, lowStockAlert: 5,
    invoiceFooter: 'Thank you for your business! All goods sold are subject to our return policy.',
  })
  ok('Settings created')

  // ── PHASE 3: WAREHOUSES ───────────────────────────────────
  step('PHASE 3 — Warehouses')
  const mainWH = await Warehouse.create({ name: 'Main Warehouse',      email: 'main@infypos.com',      phone: '+1 555-1000', address: '123 Storage Street, New York, NY' })
  const secWH  = await Warehouse.create({ name: 'Secondary Warehouse', email: 'secondary@infypos.com', phone: '+1 555-2000', address: '456 Depot Avenue, Los Angeles, CA' })
  ok('Warehouses: Main, Secondary')

  // ── PHASE 4: USERS ────────────────────────────────────────
  step('PHASE 4 — Users')
  const admin   = await User.create({ name: 'Admin User',    email: 'admin@infypos.com',   password: '123456', role: 'admin',   warehouse: mainWH._id, isActive: true })
  await User.create({ name: 'Store Manager', email: 'manager@infypos.com',  password: '123456', role: 'manager', warehouse: mainWH._id, isActive: true })
  await User.create({ name: 'Cashier One',   email: 'cashier@infypos.com',  password: '123456', role: 'cashier', warehouse: mainWH._id, isActive: true })
  ok('Users: admin@infypos.com / manager@infypos.com / cashier@infypos.com  (pass: 123456)')

  // ── PHASE 5: MASTERS ─────────────────────────────────────
  step('PHASE 5 — Tax, Units, Base Units, Payment Methods')
  const tax10 = await Tax.create({ name: 'GST 10%', rate: 10 })
  const tax18 = await Tax.create({ name: 'GST 18%', rate: 18 })
  const tax5  = await Tax.create({ name: 'GST 5%',  rate: 5  })

  const unitPcs  = await Unit.create({ name: 'Piece',    shortName: 'Pcs' })
  const unitRoll = await Unit.create({ name: 'Roll',     shortName: 'Roll' })
  const unitBox  = await Unit.create({ name: 'Box',      shortName: 'Box'  })
  const unitKg   = await Unit.create({ name: 'Kilogram', shortName: 'Kg'   })
  const unitLt   = await Unit.create({ name: 'Litre',    shortName: 'L'    })

  const units = { Piece: unitPcs, Roll: unitRoll, Box: unitBox, Kilogram: unitKg, Litre: unitLt }

  await BaseUnit.insertMany([
    { name: 'Quantity', shortName: 'Qty' },
    { name: 'Weight',   shortName: 'Kg'  },
    { name: 'Volume',   shortName: 'L'   },
  ])

  await PaymentMethod.insertMany([
    { name: 'Cash' }, { name: 'Card' }, { name: 'Bank Transfer' }, { name: 'Cheque' },
  ])

  await VariationAttribute.insertMany([
    { name: 'Color', values: ['Black', 'White', 'Silver', 'Red', 'Blue'] },
    { name: 'Size',  values: ['S', 'M', 'L', 'XL', 'XXL'] },
  ])

  ok('Tax rates, units, base units, payment methods, variations')

  // ── PHASE 6: VOUCHER TYPES ────────────────────────────────
  step('PHASE 6 — Voucher Types')
  const vtCashSale   = await VoucherType.create({ name: 'Cash Sale',         module: 'sales',    prefix: 'CS',  isDefault: true  })
  const vtCreditSale = await VoucherType.create({ name: 'Credit Sale',       module: 'sales',    prefix: 'CRS', isDefault: false })
  const vtRetailSale = await VoucherType.create({ name: 'Retail Sale',       module: 'sales',    prefix: 'RS',  isDefault: false })
  const vtStdPO      = await VoucherType.create({ name: 'Standard Purchase', module: 'purchase', prefix: 'SPO', isDefault: true  })
  const vtImpPO      = await VoucherType.create({ name: 'Import Purchase',   module: 'purchase', prefix: 'IPO', isDefault: false })
  ok('Voucher Types: Cash Sale, Credit Sale, Retail Sale, Standard Purchase, Import Purchase')

  // ── PHASE 7: CATEGORIES ───────────────────────────────────
  step('PHASE 7 — Categories (Parent → Sub)')
  const parentNames = ['Electronics', 'Home & Kitchen', 'Automotive', 'Construction', 'Personal Care']
  const parentCats  = {}
  for (const name of parentNames) {
    parentCats[name] = await Category.create({ name, description: `${name} products` })
  }

  const subCats = {}
  for (const [subName, cfg] of Object.entries(CATALOG)) {
    subCats[subName] = await Category.create({
      name: subName,
      description: `${subName} products`,
      parentCategory: parentCats[cfg.parent]._id,
    })
  }
  ok(`${parentNames.length} parent + ${Object.keys(CATALOG).length} sub categories`)

  // ── PHASE 8: BRANDS ──────────────────────────────────────
  step('PHASE 8 — Brands')
  const brandNames = ['Generic', 'RS Brand', 'MF Batteries', 'MA Chargers', 'Elekom', 'RR Brand', 'Samsung', 'Haier', 'LG', 'Sony']
  const brands = {}
  for (const name of brandNames) {
    brands[name] = await Brand.create({ name, description: `${name} products` })
  }
  ok(`${brandNames.length} brands`)

  // ── PHASE 9: EXPENSE CATEGORIES ───────────────────────────
  step('PHASE 9 — Expense Categories')
  await ExpenseCategory.insertMany([
    { name: 'Rent',       description: 'Office / shop rent' },
    { name: 'Utilities',  description: 'Electricity, water, internet' },
    { name: 'Salaries',   description: 'Staff salaries' },
    { name: 'Marketing',  description: 'Ads and promotions' },
    { name: 'Transport',  description: 'Delivery and logistics' },
  ])
  ok('Expense categories')

  // ── PHASE 10: CUSTOMERS & SUPPLIERS ──────────────────────
  step('PHASE 10 — Customers & Suppliers')
  const customers = await Customer.insertMany([
    { name: 'John Enterprises',   email: 'john@enterprises.com',   phone: '+1 555-3001', address: 'New York, USA',      openingBalance: 0 },
    { name: 'Star Electronics',   email: 'star@electronics.com',   phone: '+1 555-3002', address: 'Los Angeles, USA',   openingBalance: 0 },
    { name: 'City Tech Store',    email: 'city@techstore.com',     phone: '+1 555-3003', address: 'Chicago, USA',       openingBalance: 0 },
    { name: 'Home Solutions Ltd', email: 'home@solutions.com',     phone: '+1 555-3004', address: 'Houston, USA',       openingBalance: 0 },
    { name: 'Modern Trade Hub',   email: 'modern@tradehub.com',    phone: '+1 555-3005', address: 'Seattle, USA',       openingBalance: 0 },
  ])

  const suppliers = await Supplier.insertMany([
    { name: 'Tech Electronics Suppliers', email: 'tech@electronics.com',   phone: '+1 555-4001', address: 'Silicon Valley, CA' },
    { name: 'Home Appliance World',        email: 'info@applianceworld.com', phone: '+1 555-4002', address: 'Dallas, TX'          },
    { name: 'Auto Parts Hub',              email: 'auto@partshub.com',       phone: '+1 555-4003', address: 'Detroit, MI'         },
    { name: 'Building Supplies Co',        email: 'build@supplies.com',      phone: '+1 555-4004', address: 'Denver, CO'          },
    { name: 'General Trading LLC',         email: 'trade@generalllc.com',    phone: '+1 555-4005', address: 'Miami, FL'           },
  ])
  ok(`${customers.length} customers, ${suppliers.length} suppliers`)

  // ── PHASE 11: LANGUAGE ────────────────────────────────────
  step('PHASE 11 — Language')
  await Language.create({ name: 'English', isoCode: 'en', isActive: true, translations: { labels: {}, messages: {}, errors: {}, success: {} } })
  ok('Default English language')

  // ── PHASE 12: PRODUCTS + DISTRIBUTIONS ───────────────────
  step('PHASE 12 — Products & Product Distributions')

  const productMap = {}  // catKey|sku → { product, dist }

  for (const [catKey, cfg] of Object.entries(CATALOG)) {
    const cat   = subCats[catKey]
    const brand = brands[cfg.brand] || brands['Generic']
    const unit  = units[cfg.unit]   || units['Piece']

    for (const item of cfg.items) {
      const product = await Product.create({
        name:          item.name,
        description:   item.description || `${item.name} — quality product`,
        category:      cat._id,
        brand:         brand._id,
        unit:          unit._id,
        alertQuantity: item.alert,
        isActive:      true,
      })

      const dist = await ProductDistribution.create({
        product:          product._id,
        warehouse:        mainWH._id,
        sku:              item.sku,
        barcode:          `BC${item.sku.replace(/-/g, '')}`,
        barcodeSymbology: 'CODE128',
        purchasePrice:    item.purchase,
        salePrice:        item.sale,
        mrp:              item.mrp,
        taxRate:          cfg.tax,
        tax:              tax10._id,
        openingStock:     0,
      })

      // Add initial stock to Main Warehouse
      if (item.stock > 0) {
        await Stock.adjust(product._id, mainWH._id, item.stock)
      }

      productMap[item.sku] = { product, dist }
    }
  }

  const totalProducts = Object.keys(productMap).length
  ok(`${totalProducts} products + distributions + initial stock`)

  // ── Helper: get prod/dist by SKU ─────────────────────────
  const p = (sku) => productMap[sku]

  // ── PHASE 13: PURCHASES (status=received → stock already in) ─
  step('PHASE 13 — Purchases')

  const buildPurchaseItems = (skuQtyList) =>
    skuQtyList.map(([sku, qty]) => {
      const { product, dist } = p(sku)
      const subtotal  = qty * dist.purchasePrice
      const taxAmount = (subtotal * dist.taxRate) / 100
      return { product: product._id, name: product.name, sku: dist.sku, quantity: qty, unitCost: dist.purchasePrice, taxRate: dist.taxRate, taxAmount, total: subtotal + taxAmount }
    })

  const calcPurchaseTotals = (items) => {
    const subtotal   = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const taxAmount  = items.reduce((s, i) => s + i.taxAmount, 0)
    const grandTotal = subtotal + taxAmount
    return { subtotal, taxAmount, grandTotal }
  }

  // Purchase 1: AC + Amplifiers from Tech Electronics
  const pur1Items = buildPurchaseItems([
    ['AC-12K-001', 5], ['AC-18K-001', 4], ['AC-24K-001', 3], ['AMP-A2K-001', 5], ['AMP-A3K-001', 5],
  ])
  const pur1Totals = calcPurchaseTotals(pur1Items)
  const pur1 = await Purchase.create({
    referenceNo: 'PO-000001', supplier: suppliers[0]._id, warehouse: mainWH._id,
    voucherType: vtStdPO._id, documentType: 'purchase', purchaseType: 'regular',
    status: 'received', paymentMethod: 'Bank Transfer', paidAmount: pur1Totals.grandTotal,
    items: pur1Items, ...pur1Totals, note: 'AC units and amplifiers — initial stock purchase',
    createdBy: admin._id, createdAt: new Date(Date.now() - 30 * 86400000),
  })
  for (const it of pur1Items) await Stock.adjust(it.product, mainWH._id, it.quantity)
  ok(`Purchase PO-000001: ${pur1Items.length} item types from Tech Electronics`)

  // Purchase 2: Batteries + Chargers from Auto Parts Hub
  const pur2Items = buildPurchaseItems([
    ['BAT-N40-001', 10], ['BAT-N50-001', 10], ['BAT-N70-001', 8], ['CHG-MA10A-001', 15], ['CHG-MA20A-001', 12], ['CHG-MA30A-001', 10],
  ])
  const pur2Totals = calcPurchaseTotals(pur2Items)
  const pur2 = await Purchase.create({
    referenceNo: 'PO-000002', supplier: suppliers[2]._id, warehouse: mainWH._id,
    voucherType: vtStdPO._id, documentType: 'purchase', purchaseType: 'regular',
    status: 'received', paymentMethod: 'Cheque', paidAmount: pur2Totals.grandTotal,
    items: pur2Items, ...pur2Totals, note: 'Batteries and chargers stock replenishment',
    createdBy: admin._id, createdAt: new Date(Date.now() - 25 * 86400000),
  })
  for (const it of pur2Items) await Stock.adjust(it.product, mainWH._id, it.quantity)
  ok(`Purchase PO-000002: ${pur2Items.length} item types from Auto Parts Hub`)

  // Purchase 3: Home appliances
  const pur3Items = buildPurchaseItems([
    ['COF-EK207-001', 8], ['COF-EK506-001', 6], ['EKT-APKT-001', 10], ['EKT-KK30-001', 10], ['ERC-18L-001', 8], ['ERC-AK22-001', 6],
  ])
  const pur3Totals = calcPurchaseTotals(pur3Items)
  const pur3 = await Purchase.create({
    referenceNo: 'PO-000003', supplier: suppliers[1]._id, warehouse: mainWH._id,
    voucherType: vtStdPO._id, documentType: 'purchase', purchaseType: 'regular',
    status: 'received', paymentMethod: 'Bank Transfer', paidAmount: pur3Totals.grandTotal / 2,
    items: pur3Items, ...pur3Totals, note: 'Home appliances for retail shelf',
    createdBy: admin._id, createdAt: new Date(Date.now() - 20 * 86400000),
  })
  for (const it of pur3Items) await Stock.adjust(it.product, mainWH._id, it.quantity)
  ok(`Purchase PO-000003: ${pur3Items.length} item types from Home Appliance World`)

  // ── PHASE 14: PURCHASE ORDERS (documentType=purchase_order) ─
  step('PHASE 14 — Purchase Orders')

  const po1Items = buildPurchaseItems([
    ['CCTV-360FE-001', 10], ['CCTV-BUL-001', 15], ['CCTV-IPVN-001', 8],
  ])
  const po1Totals = calcPurchaseTotals(po1Items)
  const po1 = await Purchase.create({
    referenceNo: 'PO-ORDER-001', supplier: suppliers[4]._id, warehouse: mainWH._id,
    voucherType: vtStdPO._id, documentType: 'purchase_order', purchaseType: 'regular',
    status: 'ordered', paymentMethod: 'Bank Transfer', paidAmount: 0,
    items: po1Items, ...po1Totals, note: 'CCTV camera order — awaiting delivery',
    createdBy: admin._id, createdAt: new Date(Date.now() - 10 * 86400000),
  })
  ok(`Purchase Order PO-ORDER-001: CCTV cameras`)

  const po2Items = buildPurchaseItems([
    ['BBQ-GG1-001', 10], ['BBQ-GG10-001', 8], ['BLD-PLY-001', 20], ['BLD-SF21M-001', 3],
  ])
  const po2Totals = calcPurchaseTotals(po2Items)
  const po2 = await Purchase.create({
    referenceNo: 'PO-ORDER-002', supplier: suppliers[3]._id, warehouse: mainWH._id,
    voucherType: vtStdPO._id, documentType: 'purchase_order', purchaseType: 'regular',
    status: 'ordered', paymentMethod: 'Cheque', paidAmount: 0,
    items: po2Items, ...po2Totals, note: 'Barbeque and building materials order',
    createdBy: admin._id, createdAt: new Date(Date.now() - 8 * 86400000),
  })
  ok(`Purchase Order PO-ORDER-002: Barbeque + Building Materials`)

  // ── PHASE 15: GRN (Goods Receipt Notes) ───────────────────
  step('PHASE 15 — Goods Receipt Notes (GRN)')

  const grn1 = await GoodsReceiptNote.create({
    grnNo: 'GRN-000001', purchase: po1._id, supplier: suppliers[4]._id, warehouse: mainWH._id,
    items: [
      { product: p('CCTV-360FE-001').product._id, name: p('CCTV-360FE-001').product.name, sku: 'CCTV-360FE-001', orderedQty: 10, receivedQty: 10, unitCost: 98, total: 980 },
      { product: p('CCTV-BUL-001').product._id,   name: p('CCTV-BUL-001').product.name,   sku: 'CCTV-BUL-001',  orderedQty: 15, receivedQty: 12, unitCost: 72, total: 864 },
    ],
    receivedDate: new Date(Date.now() - 5 * 86400000),
    grandTotal: 980 + 864, status: 'partial',
    note: 'CCTV-BUL-001: 12 of 15 received. 3 units pending delivery.',
    createdBy: admin._id,
  })
  ok('GRN-000001: CCTV cameras (partial receipt)')

  const grn2 = await GoodsReceiptNote.create({
    grnNo: 'GRN-000002', purchase: po2._id, supplier: suppliers[3]._id, warehouse: mainWH._id,
    items: [
      { product: p('BBQ-GG1-001').product._id,  name: p('BBQ-GG1-001').product.name,  sku: 'BBQ-GG1-001',  orderedQty: 10, receivedQty: 10, unitCost: 85, total: 850 },
      { product: p('BLD-PLY-001').product._id,  name: p('BLD-PLY-001').product.name,  sku: 'BLD-PLY-001',  orderedQty: 20, receivedQty: 20, unitCost: 32, total: 640 },
    ],
    receivedDate: new Date(Date.now() - 3 * 86400000),
    grandTotal: 850 + 640, status: 'complete',
    note: 'Barbeque GG1 and Plywood fully received.',
    createdBy: admin._id,
  })
  ok('GRN-000002: Barbeque + Plywood (complete)')

  // ── PHASE 16: PURCHASE RETURNS ────────────────────────────
  step('PHASE 16 — Purchase Returns')

  // Return 2 AC 12K (defective)
  const pr1 = await PurchaseReturn.create({
    referenceNo: 'PRET-000001', purchase: pur1._id, supplier: suppliers[0]._id, warehouse: mainWH._id,
    items: [{ product: p('AC-12K-001').product._id, name: p('AC-12K-001').product.name, sku: 'AC-12K-001', quantity: 2, unitCost: 780, total: 1560 }],
    totalAmount: 1560, reason: 'Defective units — compressor failure during QC',
    note: 'Debit note raised against PO-000001', createdBy: admin._id,
    createdAt: new Date(Date.now() - 22 * 86400000),
  })
  await Stock.adjust(p('AC-12K-001').product._id, mainWH._id, -2)
  ok('Purchase Return PRET-000001: 2 × AC 12K (defective)')

  // Return 3 batteries N-40 (wrong spec)
  const pr2 = await PurchaseReturn.create({
    referenceNo: 'PRET-000002', purchase: pur2._id, supplier: suppliers[2]._id, warehouse: mainWH._id,
    items: [{ product: p('BAT-N40-001').product._id, name: p('BAT-N40-001').product.name, sku: 'BAT-N40-001', quantity: 3, unitCost: 95, total: 285 }],
    totalAmount: 285, reason: 'Wrong specification supplied — N-40 instead of N-45',
    note: 'Debit note against PO-000002', createdBy: admin._id,
    createdAt: new Date(Date.now() - 18 * 86400000),
  })
  await Stock.adjust(p('BAT-N40-001').product._id, mainWH._id, -3)
  ok('Purchase Return PRET-000002: 3 × Battery N-40 (wrong spec)')

  // ── PHASE 17: SALES ───────────────────────────────────────
  step('PHASE 17 — Sales (Invoices)')

  const buildSaleItems = (skuQtyList) =>
    skuQtyList.map(([sku, qty]) => {
      const { product, dist } = p(sku)
      const subtotal  = qty * dist.salePrice
      const taxAmount = (subtotal * dist.taxRate) / 100
      return { product: product._id, name: product.name, sku: dist.sku, quantity: qty, unitPrice: dist.salePrice, discount: 0, discountType: 'fixed', taxRate: dist.taxRate, taxAmount, subtotal, total: subtotal + taxAmount }
    })

  const calcSaleTotals = (items) => {
    const subtotal   = items.reduce((s, i) => s + i.subtotal, 0)
    const taxAmount  = items.reduce((s, i) => s + i.taxAmount, 0)
    const grandTotal = subtotal + taxAmount
    return { subtotal, taxAmount, grandTotal }
  }

  // Sale 1: ACs + Amplifiers to John Enterprises
  const sal1Items = buildSaleItems([['AC-12K-001', 3], ['AC-18K-001', 2], ['AMP-A2K-001', 3]])
  const sal1Totals = calcSaleTotals(sal1Items)
  const sal1 = await Sale.create({
    invoiceNo: 'INV-000001', customer: customers[0]._id, warehouse: mainWH._id,
    voucherType: vtCashSale._id, saleType: 'retail',
    status: 'completed', paymentMethod: 'Bank Transfer', paidAmount: sal1Totals.grandTotal,
    items: sal1Items, ...sal1Totals, note: 'Bulk AC + Amplifier order for retail store',
    createdBy: admin._id, createdAt: new Date(Date.now() - 15 * 86400000),
  })
  for (const it of sal1Items) await Stock.adjust(it.product, mainWH._id, -it.quantity)
  ok(`Sale INV-000001: ACs + Amplifiers → John Enterprises`)

  // Sale 2: Batteries + Chargers to City Tech
  const sal2Items = buildSaleItems([['BAT-N50-001', 5], ['BAT-N70-001', 4], ['CHG-MA10A-001', 8]])
  const sal2Totals = calcSaleTotals(sal2Items)
  const sal2 = await Sale.create({
    invoiceNo: 'INV-000002', customer: customers[2]._id, warehouse: mainWH._id,
    voucherType: vtCreditSale._id, saleType: 'cash',
    status: 'completed', paymentMethod: 'Cash', paidAmount: sal2Totals.grandTotal / 2,
    items: sal2Items, ...sal2Totals, note: 'Battery and charger stock for resale',
    createdBy: admin._id, createdAt: new Date(Date.now() - 12 * 86400000),
  })
  for (const it of sal2Items) await Stock.adjust(it.product, mainWH._id, -it.quantity)
  ok(`Sale INV-000002: Batteries + Chargers → City Tech Store`)

  // Sale 3: Coffee + Kettles + Rice Cookers to Home Solutions
  const sal3Items = buildSaleItems([['COF-EK207-001', 4], ['EKT-APKT-001', 6], ['ERC-18L-001', 4]])
  const sal3Totals = calcSaleTotals(sal3Items)
  const sal3 = await Sale.create({
    invoiceNo: 'INV-000003', customer: customers[3]._id, warehouse: mainWH._id,
    voucherType: vtRetailSale._id, saleType: 'retail',
    status: 'completed', paymentMethod: 'Card', paidAmount: sal3Totals.grandTotal,
    items: sal3Items, ...sal3Totals, note: 'Home appliances retail order',
    createdBy: admin._id, createdAt: new Date(Date.now() - 8 * 86400000),
  })
  for (const it of sal3Items) await Stock.adjust(it.product, mainWH._id, -it.quantity)
  ok(`Sale INV-000003: Coffee Makers + Kettles + Rice Cookers → Home Solutions`)

  // ── PHASE 18: SALES ORDERS ────────────────────────────────
  step('PHASE 18 — Sales Orders')

  const so1Items = buildSaleItems([['CCTV-360FE-001', 5], ['CCTV-BUL-001', 8], ['CCTV-IPVN-001', 4]])
  const so1Totals = calcSaleTotals(so1Items)
  const so1 = await SalesOrder.create({
    orderNo: 'SO-000001', customer: customers[1]._id, warehouse: mainWH._id,
    voucherType: vtCashSale._id, saleType: 'retail',
    status: 'confirmed', items: so1Items, ...so1Totals,
    note: 'CCTV security system order for Star Electronics showroom',
    terms: 'Delivery within 7 working days', createdBy: admin._id,
    createdAt: new Date(Date.now() - 6 * 86400000),
  })
  ok('Sales Order SO-000001: CCTV cameras → Star Electronics')

  const so2Items = buildSaleItems([['EBK-CLH-001', 2], ['EBK-DAL-001', 2], ['EBK-FWN-001', 3], ['DVD-RS531-001', 5]])
  const so2Totals = calcSaleTotals(so2Items)
  const so2 = await SalesOrder.create({
    orderNo: 'SO-000002', customer: customers[4]._id, warehouse: mainWH._id,
    voucherType: vtCreditSale._id, saleType: 'retail',
    status: 'processing', items: so2Items, ...so2Totals,
    note: 'Electric bikes and DVD players for showroom display',
    terms: '50% advance, balance on delivery', createdBy: admin._id,
    createdAt: new Date(Date.now() - 4 * 86400000),
  })
  ok('Sales Order SO-000002: Electric Bikes + DVDs → Modern Trade Hub')

  // ── PHASE 19: DELIVERY NOTES ──────────────────────────────
  step('PHASE 19 — Delivery Notes')

  const dn1 = await DeliveryNote.create({
    deliveryNo: 'DN-000001', sale: sal1._id, salesOrder: so1._id,
    customer: customers[1]._id, warehouse: mainWH._id,
    items: [
      { product: p('CCTV-360FE-001').product._id, name: p('CCTV-360FE-001').product.name, sku: 'CCTV-360FE-001', orderedQty: 5, deliveredQty: 5 },
      { product: p('CCTV-BUL-001').product._id,   name: p('CCTV-BUL-001').product.name,   sku: 'CCTV-BUL-001',  orderedQty: 8, deliveredQty: 6 },
    ],
    deliveryDate: new Date(Date.now() - 2 * 86400000),
    deliveryAddress: '789 Electronics Mall, Los Angeles, CA',
    status: 'delivered', note: 'CCTV-BUL: 2 units pending next delivery.',
    createdBy: admin._id,
  })
  ok('Delivery Note DN-000001: CCTV cameras (partial) → Star Electronics')

  const dn2 = await DeliveryNote.create({
    deliveryNo: 'DN-000002', salesOrder: so2._id,
    customer: customers[4]._id, warehouse: mainWH._id,
    items: [
      { product: p('EBK-CLH-001').product._id, name: p('EBK-CLH-001').product.name, sku: 'EBK-CLH-001', orderedQty: 2, deliveredQty: 2 },
      { product: p('EBK-DAL-001').product._id, name: p('EBK-DAL-001').product.name, sku: 'EBK-DAL-001', orderedQty: 2, deliveredQty: 2 },
    ],
    deliveryDate: new Date(),
    deliveryAddress: '321 Trade Center, Seattle, WA',
    status: 'dispatched', note: 'First batch — remaining bikes pending.',
    createdBy: admin._id,
  })
  ok('Delivery Note DN-000002: Electric Bikes → Modern Trade Hub')

  // ── PHASE 20: SALES RETURNS ───────────────────────────────
  step('PHASE 20 — Sales Returns / Credit Notes')

  const sr1 = await SaleReturn.create({
    referenceNo: 'SRET-000001', sale: sal1._id, customer: customers[0]._id, warehouse: mainWH._id,
    items: [{ product: p('AC-12K-001').product._id, name: p('AC-12K-001').product.name, sku: 'AC-12K-001', quantity: 1, unitPrice: 1050, total: 1050 }],
    totalAmount: 1050, reason: 'Customer reported fault — unit not cooling properly',
    note: 'Credit note issued against INV-000001', createdBy: admin._id,
    createdAt: new Date(Date.now() - 10 * 86400000),
  })
  await Stock.adjust(p('AC-12K-001').product._id, mainWH._id, 1)
  ok('Sales Return SRET-000001: 1 × AC 12K → John Enterprises')

  const sr2 = await SaleReturn.create({
    referenceNo: 'SRET-000002', sale: sal2._id, customer: customers[2]._id, warehouse: mainWH._id,
    items: [{ product: p('BAT-N50-001').product._id, name: p('BAT-N50-001').product.name, sku: 'BAT-N50-001', quantity: 2, unitPrice: 165, total: 330 }],
    totalAmount: 330, reason: 'Batteries delivered with packaging damage',
    note: 'Credit note issued against INV-000002', createdBy: admin._id,
    createdAt: new Date(Date.now() - 7 * 86400000),
  })
  await Stock.adjust(p('BAT-N50-001').product._id, mainWH._id, 2)
  ok('Sales Return SRET-000002: 2 × Battery N-50 → City Tech Store')

  // ── PHASE 21: QUOTATIONS ──────────────────────────────────
  step('PHASE 21 — Quotations')

  const buildQuoteItems = (skuQtyList) =>
    skuQtyList.map(([sku, qty]) => {
      const { product, dist } = p(sku)
      const subtotal  = qty * dist.salePrice
      const taxAmount = (subtotal * dist.taxRate) / 100
      return { product: product._id, name: product.name, sku: dist.sku, quantity: qty, unitPrice: dist.salePrice, discount: 0, discountType: 'fixed', taxRate: dist.taxRate, taxAmount, subtotal, total: subtotal + taxAmount }
    })

  const qt1Items = buildQuoteItems([['BLD-PLY-001', 30], ['BLD-SF21M-001', 2], ['BLD-SF12M-001', 3]])
  const qt1Totals = calcSaleTotals(qt1Items)
  await Quotation.create({
    quotationNo: 'QT-000001', customer: customers[3]._id, warehouse: mainWH._id,
    items: qt1Items, ...qt1Totals,
    status: 'sent', validUntil: new Date(Date.now() + 30 * 86400000),
    note: 'Quotation for renovation project materials',
    terms: 'Prices valid for 30 days from quotation date', createdBy: admin._id,
    createdAt: new Date(Date.now() - 5 * 86400000),
  })
  ok('Quotation QT-000001: Building Materials → Home Solutions')

  const qt2Items = buildQuoteItems([['EBK-CLH-001', 5], ['EBK-FWN-001', 5], ['EBK-MIN-001', 3]])
  const qt2Totals = calcSaleTotals(qt2Items)
  await Quotation.create({
    quotationNo: 'QT-000002', customer: customers[4]._id, warehouse: mainWH._id,
    items: qt2Items, ...qt2Totals,
    status: 'accepted', validUntil: new Date(Date.now() + 15 * 86400000),
    note: 'Electric bike fleet order quotation',
    terms: 'Bulk discount applied — 30 day credit', createdBy: admin._id,
    createdAt: new Date(Date.now() - 3 * 86400000),
  })
  ok('Quotation QT-000002: Electric Bikes → Modern Trade Hub')

  // ── PHASE 22: HOLDS ───────────────────────────────────────
  step('PHASE 22 — Holds')

  await Hold.create({
    holdNo: 'HOLD-000001', warehouse: mainWH._id, customer: customers[0]._id,
    items: [
      { product: p('SPK-RS411-001').product._id, name: p('SPK-RS411-001').product.name, sku: 'SPK-RS411-001', quantity: 2, unitPrice: 65, taxRate: 10 },
      { product: p('SPK-RS422-001').product._id, name: p('SPK-RS422-001').product.name, sku: 'SPK-RS422-001', quantity: 1, unitPrice: 88, taxRate: 10 },
    ],
    discount: 5, discountType: 'percent',
    note: 'Customer will collect tomorrow — held for John Enterprises', createdBy: admin._id,
    createdAt: new Date(Date.now() - 1 * 86400000),
  })
  ok('Hold HOLD-000001: Bluetooth Speakers → John Enterprises')

  await Hold.create({
    holdNo: 'HOLD-000002', warehouse: mainWH._id, customer: customers[2]._id,
    items: [
      { product: p('EAR-895B-001').product._id, name: p('EAR-895B-001').product.name, sku: 'EAR-895B-001', quantity: 3, unitPrice: 35, taxRate: 10 },
      { product: p('EAR-A3-001').product._id,   name: p('EAR-A3-001').product.name,   sku: 'EAR-A3-001',   quantity: 2, unitPrice: 55, taxRate: 10 },
    ],
    discount: 0, discountType: 'fixed',
    note: 'Earphone order on hold — awaiting customer payment confirmation', createdBy: admin._id,
    createdAt: new Date(),
  })
  ok('Hold HOLD-000002: Earphones → City Tech Store')

  // ── PHASE 23: ADJUSTMENTS ─────────────────────────────────
  step('PHASE 23 — Stock Adjustments')

  await Adjustment.create({
    referenceNo: 'ADJ-000001', warehouse: mainWH._id,
    items: [
      { product: p('EAR-ALL-001').product._id, name: p('EAR-ALL-001').product.name, sku: 'EAR-ALL-001', type: 'subtraction', quantity: 2, unitCost: 14 },
      { product: p('ERC-601C-001').product._id,name: p('ERC-601C-001').product.name, sku: 'ERC-601C-001',type: 'addition',    quantity: 3, unitCost: 70 },
    ],
    totalAmount: 2 * 14 + 3 * 70, reason: 'Physical stock count discrepancy correction',
    note: 'Monthly stock audit — 2 earphones lost, 3 rice cookers found extra',
    createdBy: admin._id,
  })
  await Stock.adjust(p('EAR-ALL-001').product._id,  mainWH._id, -2)
  await Stock.adjust(p('ERC-601C-001').product._id, mainWH._id,  3)
  ok('Adjustment ADJ-000001: Earphone -2, Rice Cooker +3')

  // ── PHASE 24: TRANSFERS ───────────────────────────────────
  step('PHASE 24 — Stock Transfers')

  await Transfer.create({
    referenceNo: 'TRF-000001', fromWarehouse: mainWH._id, toWarehouse: secWH._id,
    items: [
      { product: p('SPK-RS433-001').product._id, name: p('SPK-RS433-001').product.name, sku: 'SPK-RS433-001', quantity: 3, unitCost: 78 },
      { product: p('SPK-RS444-001').product._id, name: p('SPK-RS444-001').product.name, sku: 'SPK-RS444-001', quantity: 3, unitCost: 98 },
    ],
    totalAmount: 3 * 78 + 3 * 98, reason: 'Replenishing secondary warehouse speakers stock',
    note: 'Transfer for LA branch', status: 'completed', createdBy: admin._id,
  })
  await Stock.adjust(p('SPK-RS433-001').product._id, mainWH._id,  -3)
  await Stock.adjust(p('SPK-RS433-001').product._id, secWH._id,    3)
  await Stock.adjust(p('SPK-RS444-001').product._id, mainWH._id,  -3)
  await Stock.adjust(p('SPK-RS444-001').product._id, secWH._id,    3)
  ok('Transfer TRF-000001: Bluetooth Speakers → Secondary Warehouse')

  // ── PHASE 25: EXPENSES ────────────────────────────────────
  step('PHASE 25 — Expenses')

  await Expense.insertMany([
    { title: 'Monthly Shop Rent',  category: 'Rent',      amount: 3200, date: new Date(Date.now() - 30 * 86400000), createdBy: admin._id },
    { title: 'Electricity Bill',   category: 'Utilities', amount: 480,  date: new Date(Date.now() - 25 * 86400000), createdBy: admin._id },
    { title: 'Staff Salaries',     category: 'Salaries',  amount: 9500, date: new Date(Date.now() - 28 * 86400000), createdBy: admin._id },
    { title: 'Google Ads Campaign',category: 'Marketing', amount: 750,  date: new Date(Date.now() - 15 * 86400000), createdBy: admin._id },
    { title: 'Delivery Van Fuel',  category: 'Transport', amount: 280,  date: new Date(Date.now() - 5  * 86400000), createdBy: admin._id },
  ])
  ok('5 expenses across all categories')

  // ── DONE ──────────────────────────────────────────────────
  step('DONE — SUMMARY')
  console.log(`
  ${'┌────────────────────────────────────────────────────────────┐'.gray}
  ${'│'.gray}${'  DATABASE SEEDED SUCCESSFULLY — INFYPOS DEMO             '.white}${'│'.gray}
  ${'├────────────────────────────┬───────────────────────────────┤'.gray}
  ${'│'.gray}  Products (all catalog)   ${'│'.gray}  ${totalProducts} products across 20 categories     ${'│'.gray}
  ${'│'.gray}  Product Distributions    ${'│'.gray}  ${totalProducts} with full pricing + stock          ${'│'.gray}
  ${'│'.gray}  Purchases                ${'│'.gray}  3 completed + 2 purchase orders          ${'│'.gray}
  ${'│'.gray}  GRN                      ${'│'.gray}  2 receipts (1 partial, 1 complete)       ${'│'.gray}
  ${'│'.gray}  Purchase Returns         ${'│'.gray}  2 debit notes                            ${'│'.gray}
  ${'│'.gray}  Sales / Invoices         ${'│'.gray}  3 invoices (INV-000001 to 000003)        ${'│'.gray}
  ${'│'.gray}  Sales Orders             ${'│'.gray}  2 orders (confirmed, processing)         ${'│'.gray}
  ${'│'.gray}  Delivery Notes           ${'│'.gray}  2 notes (1 delivered, 1 dispatched)      ${'│'.gray}
  ${'│'.gray}  Sales Returns            ${'│'.gray}  2 credit notes                           ${'│'.gray}
  ${'│'.gray}  Quotations               ${'│'.gray}  2 (sent, accepted)                       ${'│'.gray}
  ${'│'.gray}  Holds                    ${'│'.gray}  2 hold receipts                          ${'│'.gray}
  ${'│'.gray}  Adjustments              ${'│'.gray}  1 stock correction                       ${'│'.gray}
  ${'│'.gray}  Transfers                ${'│'.gray}  1 warehouse transfer                     ${'│'.gray}
  ${'│'.gray}  Expenses                 ${'│'.gray}  5 across 5 categories                    ${'│'.gray}
  ${'├────────────────────────────┴───────────────────────────────┤'.gray}
  ${'│'.gray}  ${'Login: admin@infypos.com / 123456'.yellow}                         ${'│'.gray}
  ${'└────────────────────────────────────────────────────────────┘'.gray}
`.white)

  process.exit(0)
}

run().catch(err => {
  console.error(`\n  ❌  ${err.message}`.red)
  console.error(err.stack)
  process.exit(1)
})
