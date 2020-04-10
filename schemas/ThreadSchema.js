let mongoose = require('mongoose')
let Schema = mongoose.Schema

let threadSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1
    },
    reported: {
      type: Boolean,
      required: true,
      default: false
    },
    delete_password: {
      type: String,
      required: true,
      minlength: 1
    },
    rootBoard: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reply'
      }
    ]
  },
  {
    timestamps: {
      createdAt: 'created_on',
      updatedAt: 'bumped_on'
    }
  }
)

threadSchema.index({ bumped_on: -1 })
threadSchema.index({ _id: 1, replies: 1 })

module.exports = mongoose.model('Thread', threadSchema)
