let mongoose = require('mongoose')
let Schema = mongoose.Schema

let bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    comments: [String]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Book', bookSchema)
