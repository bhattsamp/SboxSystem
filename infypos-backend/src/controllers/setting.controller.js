const { Setting } = require('../models/Expense')
const { sendSuccess } = require('../utils/helpers')
const path = require('path')
const fs   = require('fs')

// GET settings (singleton)
exports.get = async (req, res) => {
  let setting = await Setting.findOne()
  if (!setting) setting = await Setting.create({})
  sendSuccess(res, setting)
}

// UPDATE settings
exports.update = async (req, res) => {
  const data = { ...req.body }
  if (req.file) {
    data.companyLogo = `/uploads/settings/${req.file.filename}`
    const old = await Setting.findOne()
    if (old?.companyLogo) {
      const p = path.join(__dirname, '../../', old.companyLogo)
      if (fs.existsSync(p)) fs.unlinkSync(p)
    }
  }
  const setting = await Setting.findOneAndUpdate({}, data, { new: true, upsert: true, runValidators: true })
  sendSuccess(res, setting, 'Settings updated')
}
