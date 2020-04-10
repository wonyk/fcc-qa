'use strict'

let express = require('express')
let cors = require('cors')
let morgan = require('morgan')
let mongoose = require('mongoose')
require('dotenv').config()

let apiRoutes = require('./routes/api.js')
let fccTestingRoutes = require('./routes/fcctesting.js')
let runner = require('./test-runner')
let helmet = require('helmet')
let app = express()

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) //For FCC testing purposes only
app.use(
  helmet({
    frameguard: {
      action: 'sameorigin'
    },
    referrerPolicy: {
      policy: 'same-origin'
    }
  })
)

app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URL_TEST
    : process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
)

mongoose.set('debug', true)

//Sample front-end
app.route('/b/:board/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/board.html')
})
app.route('/b/:board/:threadid').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/thread.html')
})

//Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

//For FCC testing purposes
fccTestingRoutes(app)

//Routing for API
apiRoutes(app)

//Sample Front-end

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found')
})

// Error handler
app.use(function (err, req, res, next) {
  res.status(400).json({ error: err })
})

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + (process.env.PORT || 3000))
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (e) {
        let error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 1500)
  }
})

module.exports = app //for testing
