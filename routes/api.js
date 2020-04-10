/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict'

var expect = require('chai').expect
var mongoose = require('mongoose')
let Book = require('../schema/BookSchema')
mongoose.connect(
  process.env.NODE_ENV === 'test' ? process.env.DB_TEST : process.env.DB,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
)

mongoose.connection.on('error', err => {
  console.error(err)
})

mongoose.set('debug', true)

module.exports = function(app) {
  app
    .route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({})
        .sort('-createdAt')
        .lean()
        .exec((err, books) => {
          if (err) {
            console.error(err)
            return res.status(500).json('Server error')
          }
          let bookArray = books.map(book => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length
            }
          })
          res.json(bookArray)
        })
    })

    .post(function(req, res) {
      let { title } = req.body
      if (!title) {
        return res.status(400).json('missing title')
      }
      //response will contain new book object including atleast _id and title
      let newBook = new Book({
        title
      })
      newBook.save((err, book) => {
        if (err) {
          console.error(err)
          return res.status(500).json('Server error')
        }
        res.json({
          title: book.title,
          _id: book._id
        })
      })
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, err => {
        if (err) {
          console.error(err)
          return res.status(500).json('Server error')
        }
        res.json('complete delete successful')
      })
    })

  app
    .route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!mongoose.isValidObjectId(bookid)) {
        return res.status(404).json('no book exists')
      }
      Book.findById(
        bookid,
        '-__v -createdAt -updatedAt',
        { lean: true },
        (err, book) => {
          if (err) {
            console.error(err)
            return res.status(500).json('Server error')
          }
          if (!book) {
            return res.status(404).json('no book exists')
          }
          return res.json(book)
        }
      )
    })

    .post(function(req, res) {
      let bookid = req.params.id
      let comment = req.body.comment
      //json res format same as .get
      if (!mongoose.isValidObjectId(bookid)) {
        return res.status(404).json('no book exists')
      } else if (!comment) {
        return res.status(400).json('missing comment')
      }
      Book.findByIdAndUpdate(
        bookid,
        {
          $push: {
            comments: comment
          }
        },
        { new: true, lean: true, projection: '-__v -createdAt -updatedAt' },
        (err, book) => {
          if (err) {
            console.error(err)
            return res.status(500).json('server error')
          }
          if (!book) {
            return res.status(404).json('no book exists')
          }
          res.json(book)
        }
      )
    })

    .delete(function(req, res) {
      let bookid = req.params.id
      //if successful response will be 'delete successful'
      if (!mongoose.isValidObjectId(bookid)) {
        return res.status(404).json('no book exists')
      }
      Book.findByIdAndDelete(bookid, (err, doc) => {
        if (err) {
          console.error(err)
          return res.status(500).json('Server error')
        }
        if (!doc) {
          return res.status(404).json('no book exists')
        }
        res.json('delete successful')
      })
    })
}
