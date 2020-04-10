'use strict'

let express = require('express')
let expect = require('chai').expect
let cors = require('cors')
let helmet = require('helmet')

let apiRoutes = require('./routes/api.js')
let fccTestingRoutes = require('./routes/fcctesting.js')
let runner = require('./test-runner')

let app = express()

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) //For FCC testing purposes only

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

//Sample front-end
app.route('/:project/').get(function(req, res) {
  res.sendFile(process.cwd() + '/views/issue.html')
})

//Index page (static HTML)
app.route('/').get(function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

//For FCC testing purposes
fccTestingRoutes(app)

//Routing for API
apiRoutes(app)

//404 Not Found Middleware
app.use(function(req, res, next) {
  res
    .status(404)
    .type('text')
    .send('Not Found')
})

//Start our server and tests!
app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port ' + process.env.PORT)
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function() {
      try {
        runner.run()
      } catch (e) {
        var error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 3500)
  }
})

module.exports = app //for testing
