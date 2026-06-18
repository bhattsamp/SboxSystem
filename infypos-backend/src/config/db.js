const mongoose = require('mongoose')
const colors   = require('colors')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold)
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`.red.bold)
    process.exit(1)
  }
}

module.exports = connectDB
