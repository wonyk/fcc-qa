let mongoose = require('mongoose')
let Schema = mongoose.Schema

let replySchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1
    },
    delete_password: {
      type: String,
      required: true,
      minlength: 1
    },
    reported: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'created_on'
    }
  }
)

module.exports = mongoose.model('Reply', replySchema)
