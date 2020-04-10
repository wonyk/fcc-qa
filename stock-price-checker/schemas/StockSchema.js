const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StockSchema = new Schema({
  ticker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true
  },
  likes: {
    type: Number,
    default: 0
  },
  ips: {
    type: [String],
    index: true
  }
})

module.exports = mongoose.model('Stock', StockSchema)