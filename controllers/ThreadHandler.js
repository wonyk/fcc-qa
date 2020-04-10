const Board = require('../schemas/BoardSchema')
const Thread = require('../schemas/ThreadSchema')
const Reply = require('../schemas/ReplySchema')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const saltRounds = 10

module.exports.createThread = async function (req, res, next) {
  const { board } = req.params
  const { text, delete_password } = req.body
  if (!text || !delete_password) {
    return next('Missing required fields: text and delete_password')
  }
  try {
    let password_hash = await bcrypt.hash(delete_password, saltRounds)
    let newThread = new Thread({
      text,
      rootBoard: board,
      delete_password: password_hash,
      replies: []
    })
    const details = await newThread.save()
    // Update the Board Schema once the thread is saved successfully
    await Board.findOneAndUpdate(
      { title: board },
      {
        $push: {
          threads: details._id
        }
      },
      {
        upsert: true
      }
    )
    res.json({
      _id: details._id,
      text: details.text,
      created_on: details.created_on,
      bumped_on: details.bumped_on
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.reportThread = async function (req, res, next) {
  const { board } = req.params
  const { thread_id } = req.body
  if (!thread_id || !mongoose.Types.ObjectId.isValid(thread_id)) {
    return next('Invalid thread_id')
  }
  try {
    await Thread.findOneAndUpdate(
      {
        _id: thread_id,
        rootBoard: board
      },
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

module.exports.deleteThread = async function (req, res, next) {
  const { board } = req.params
  const { thread_id, delete_password } = req.body
  if (!thread_id || !delete_password) {
    return next('Missing required fields: thread_id, delete_password')
  }
  if (!mongoose.Types.ObjectId.isValid(thread_id)) {
    return next('Invalid thread_id')
  }
  try {
    const threadDetails = await Thread.findById(
      thread_id,
      'delete_password replies rootBoard',
      {
        lean: true
      }
    )
    if (!threadDetails || threadDetails.rootBoard !== board) {
      throw 'Thread not found'
    }
    const result = await bcrypt.compare(
      delete_password,
      threadDetails.delete_password
    )
    if (!result) {
      return res.status(401).send('incorrect password')
    } else {
      await Reply.deleteMany({
        _id: {
          $in: threadDetails.replies
        }
      })
      await Thread.findByIdAndDelete(thread_id)
      await Board.findOneAndUpdate(
        {
          title: board
        },
        {
          $pull: {
            threads: thread_id
          }
        }
      )
      res.send('delete success')
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getRecentThreads = async function (req, res, next) {
  const { board } = req.params
  try {
    const boardDetails = await Board.aggregate([
      { $match: { title: board } },
      {
        $lookup: {
          from: 'threads',
          let: { threadIds: '$threads' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$threadIds']
                }
              }
            },
            {
              $project: {
                text: 1,
                replies: {
                  $slice: ['$replies', -3]
                },
                bumped_on: 1,
                created_on: 1
              }
            },
            {
              $sort: { bumped_on: -1 }
            },
            {
              $limit: 10
            },
            {
              $lookup: {
                from: 'replies',
                let: { repliesId: '$replies' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$repliesId']
                      }
                    }
                  },
                  {
                    $sort: {
                      created_on: -1
                    }
                  },
                  {
                    $project: {
                      reported: 0,
                      delete_password: 0,
                      updatedAt: 0,
                      __v: 0
                    }
                  }
                ],
                as: 'replies'
              }
            }
          ],
          as: 'threads'
        }
      },
      {
        $project: {
          title: 0,
          __v: 0
        }
      }
    ])
    if (boardDetails.length === 0) {
      return res.json({
        _id: '',
        threads: []
      })
    }
    res.json(boardDetails[0])
  } catch (err) {
    console.error(err)
    next(err)
  }
}
