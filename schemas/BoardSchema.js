let mongoose = require('mongoose')
let Schema = mongoose.Schema

let boardSchema = new Schema({
  title: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  threads: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Thread'
    }
  ]
})

boardSchema.index({ title: 1, threads: 1 })

module.exports = mongoose.model('Board', boardSchema)
