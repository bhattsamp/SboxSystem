require('dotenv').config()
require('express-async-errors')
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const path       = require('path')
const http       = require('http')
const { Server } = require('socket.io')
const colors     = require('colors')

const connectDB    = require('./config/db')
const routes       = require('./routes/index')
const errorHandler = require('./middleware/error')

// Connect DB
connectDB()

const app    = express()
const server = http.createServer(app)

// ── Socket.io ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
})
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`.dim)
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`.dim))
})
app.set('io', io)

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Rate limiting
app.use('/api', rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max:       parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message:   { success: false, message: 'Too many requests, please try again later.' },
}))

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── API Routes ─────────────────────────────────────────────────
app.use('/api', routes)

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SBox System API is running',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// ── 404 handler ────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ── Error handler ──────────────────────────────────────────────
app.use(errorHandler)

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log('\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'.cyan)
  console.log(`  SBox System API Server`.white.bold)
  console.log(`  Port  : ${PORT}`.cyan)
  console.log(`  Mode  : ${process.env.NODE_ENV}`.cyan)
  console.log(`  Health: http://localhost:${PORT}/api/health`.cyan)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'.cyan)
})

module.exports = { app, server }
