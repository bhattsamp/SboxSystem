const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.env.UPLOAD_PATH || './uploads', folder)
      fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase()
      const name = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
      cb(null, name)
    },
  })

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024

exports.productUpload  = multer({ storage: createStorage('products'),  fileFilter: imageFilter, limits: { fileSize: maxSize } })
exports.brandUpload    = multer({ storage: createStorage('brands'),    fileFilter: imageFilter, limits: { fileSize: maxSize } })
exports.settingUpload  = multer({ storage: createStorage('settings'),  fileFilter: imageFilter, limits: { fileSize: maxSize } })
exports.avatarUpload   = multer({ storage: createStorage('avatars'),   fileFilter: imageFilter, limits: { fileSize: maxSize } })
