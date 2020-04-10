const Thread = require('../schemas/ThreadSchema')
const Reply = require('../schemas/ReplySchema')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const saltRounds = 10

module.exports.createReply = async function (req, res, next) {
  const { board } = req.params
  const { text, delete_password, thread_id } = req.body
  if (!text || !delete_password || !thread_id) {
    return next('Missing required fields: text, delete_password, thread_id')
  }

  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return next('Invalid thread_id')
  }

  try {
    // Ensure the board and thread exist before saving the reply
    const threadExist = await Thread.findById(thread_id)
      .select('_id rootBoard')
      .lean()
    if (!threadExist || threadExist.rootBoard !== board) {
      throw 'Thread not found'
    }
    const password_hash = await bcrypt.hash(delete_password, saltRounds)
    // Create new reply
    const newReply = new Reply({
      text,
      delete_password: password_hash
    })
    const details = await newReply.save()
    // Update thread by putting newer comments to the top
    await Thread.findByIdAndUpdate(
      thread_id,
      {
        $push: {
          replies: details._id
        },
        bumped_on: details.created_on
      },
      {
        timestamps: false
      }
    )
    res.json({
      _id: details._id,
      text: details.text,
      created_on: details.created_on
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.reportReply = async function (req, res, next) {
  const { board } = req.params
  const { thread_id, reply_id } = req.body
  if (!thread_id || !reply_id) {
    return next('Missing required fields: thread_id, reply_id')
  }
  if (
    !mongoose.Types.ObjectId.isValid(thread_id) ||
    !mongoose.Types.ObjectId.isValid(reply_id)
  ) {
    return next('Invalid thread_id or reply_id')
  }

  try {
    const thread = await Thread.findOne({
      _id: thread_id,
      replies: reply_id
    })
      .select('_id rootBoard')
      .lean()
    if (!thread || thread.rootBoard !== board) {
      throw 'Thread or Reply not found'
    }
    await Reply.findByIdAndUpdate(
      reply_id,
      {
        reported: true
      },
      {
        timestamps: false
      }
    )
    res.send('success')
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.deleteReply = async function (req, res, next) {
  const { board } = req.params
  const { thread_id, reply_id, delete_password } = req.body
  if (!thread_id || !reply_id || !delete_password) {
    return next('Missing required fields: thread_id, reply_id, delete_password')
  }

  if (
    !mongoose.Types.ObjectId.isValid(thread_id) ||
    !mongoose.Types.ObjectId.isValid(reply_id)
  ) {
    return next('Invalid thread_id or reply_id')
  }

  try {
    const details = await Thread.findOne(
      {
        _id: thread_id,
        replies: reply_id
      },
      '_id rootBoard',
      {
        lean: true
      }
    )
    if (!details || details.rootBoard !== board) {
      throw 'Thread or Reply not found'
    }
    const reply = await Reply.findById(reply_id)
    const result = await bcrypt.compare(delete_password, reply.delete_password)
    if (!result) {
      return res.status(401).send('incorrect password')
    } else {
      await Reply.findByIdAndUpdate(
        reply_id,
        {
          text: "['Deleted']"
        },
        {
          timestamps: false
        }
      )
      res.send('success')
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getThreadDetails = async function (req, res, next) {
  const { board } = req.params
  const { thread_id } = req.query
  if (!thread_id) {
    return next('Missing required fields: thread_id')
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return next('Invalid thread_id')
  }
  try {
    const fullThread = await Thread.findById(
      thread_id,
      '-delete_password -reported -__v',
      {
        lean: true,
        populate: {
          path: 'replies',
          select: '-delete_password -reported -__v -updatedAt'
        }
      }
    )
    if (!fullThread || fullThread.rootBoard !== board) {
      throw 'Thread not found'
    }
    let { rootBoard, ...editedThread } = fullThread
    res.json(editedThread)
  } catch (err) {
    console.error(err)
    next(err)
  }
}
