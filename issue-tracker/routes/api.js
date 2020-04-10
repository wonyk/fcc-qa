/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict'

let expect = require('chai').expect
let mongoose = require('mongoose')
require('dotenv').config()
let ObjectId = require('mongoose').Types.ObjectId
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Mongoose connected successfully')
  })

mongoose.connection.on('error', err => {
  console.err(err)
})

mongoose.set('debug', true)
let Schema = mongoose.Schema

const options = {
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'updated_on'
  },
  minimize: false
}

const issueSchema = new Schema(
  {
    project: {
      type: String,
      required: true,
      index: true
    },
    issue_title: {
      type: String,
      required: true,
      index: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_by: {
      type: String,
      required: true,
      index: true
    },
    assigned_to: {
      type: String,
      index: true,
      default: ''
    },
    status_text: {
      type: String,
      index: true,
      default: ''
    },
    open: {
      type: Boolean,
      default: true,
      enum: [true, false]
    }
  },
  options
)

let Issue = mongoose.model('Issue', issueSchema)

module.exports = function(app) {
  app
    .route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project
      const { _id, open } = req.query
      const acceptableFields = [
        'issue_title',
        'issue_text',
        'created_by',
        'assigned_to',
        'status_text'
      ]
      let query = {}
      acceptableFields.forEach(field => {
        // Regex for a search of "similar" results
        if (req.query[field]) query[field] = new RegExp(req.query[field], 'i')
      })

      if (_id) {
        if (!ObjectId.isValid(_id)) {
          return res.status(400).json({ error: 'Please provide a valid _id' })
        }
        query._id = _id
      }
      if (open) {
        if (open !== 'false' && open !== 'true') {
          return res
            .status(400)
            .json({ error: "Please provide a valid value for 'open'" })
        }
        query.open = open
      }

      Issue.find(
        {
          ...query,
          project
        },
        '-__v',
        {
          lean: true,
          sort: {
            updated_on: -1
          }
        },
        (err, issues) => {
          if (err) {
            console.error(err)
            return res.status(500).json({
              error: 'There is an issue with the query. Please try again.'
            })
          }
          res.json(issues)
        }
      )
    })

    .post(function(req, res) {
      let project = req.params.project
      let {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body
      if (!issue_title || !issue_text || !created_by) {
        return res
          .status(400)
          .json({ error: 'Please provide all the required fields' })
      }
      const post_issue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      })
      post_issue.save((err, issue) => {
        if (err) {
          console.err(err)
          return res
            .status(400)
            .json({ error: 'Something went wrong. Please try again later ' })
        }
        let { __v, project, ...filteredIssue } = issue.toObject()
        res.json(filteredIssue)
      })
    })

    .put(function(req, res) {
      let project = req.params.project
      let {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body
      if (Object.keys(req.body).length === 0) {
        return res.json('no updated field sent')
      }
      if (!_id || !ObjectId.isValid(_id)) {
        return res.status(400).json('could not update ' + _id)
      }
      Issue.findOneAndUpdate(
        {
          project,
          _id
        },
        {
          issue_title: issue_title ? issue_title : undefined,
          issue_text: issue_text ? issue_text : undefined,
          created_by: created_by ? created_by : undefined,
          assigned_to: assigned_to ? assigned_to : undefined,
          status_text: status_text ? status_text : undefined,
          open,
          $inc: {
            __v: 1
          }
        },
        {
          new: true,
          omitUndefined: true,
          lean: true,
          fields: '-__v -project',
          runValidators: true
        },
        (err, newIssue) => {
          if (err) {
            console.error(err)
            if (err.name === 'ValidationError') {
              return res.status(400).json('could not update ' + _id)
            }
            return res.status(500).json('could not update ' + _id)
          }
          res.json('successfully updated ' + _id)
        }
      )
    })

    .delete(function(req, res) {
      let project = req.params.project
      let { _id } = req.body
      if (!_id) {
        return res.status(400).json('_id error')
      }
      if (!ObjectId.isValid(_id)) {
        return res.status(400).json('could not delete ' + _id)
      }
      Issue.findOneAndDelete(
        {
          _id,
          project
        },
        (err, deleted) => {
          if (err) {
            console.log(err)
            return res.status(500).json('could not delete ' + _id)
          }
          res.json('deleted ' + _id)
        }
      )
    })
}
