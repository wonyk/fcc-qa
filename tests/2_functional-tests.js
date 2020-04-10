/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')
let Stock = require('../schemas/StockSchema')
let initialLikes, aaplLikes, vLikes
chai.use(chaiHttp)

suite('Functional Tests', function() {
  suite('GET /api/stock-prices => stockData object', function() {
    test('1 stock', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function(err, res) {
          let { stockData } = res.body
          assert.equal(res.status, 200)
          assert.equal(stockData.stock, 'GOOG')
          assert.isNumber(stockData.price)
          assert.isNumber(stockData.likes)
          initialLikes = stockData.likes
          done()
        })
    })

    test('1 stock with like', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end((err, res) => {
          let {
            stockData: { stock, price, likes }
          } = res.body
          assert.equal(res.status, 200)
          assert.equal(stock, 'GOOG')
          assert.isNumber(price)
          assert.equal(likes, initialLikes + 1)
          done()
        })
    })

    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end((err, res) => {
          let {
            stockData: { stock, price, likes }
          } = res.body
          assert.equal(res.status, 200)
          assert.equal(stock, 'GOOG')
          assert.isNumber(price)
          assert.equal(likes, initialLikes + 1)
          done()
        })
    })

    test('2 stocks', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices?stock=goog&stock=msft')
        .end((err, res) => {
          let { stockData } = res.body
          assert.equal(res.status, 200)
          assert.equal(stockData[0].stock, 'GOOG')
          assert.equal(stockData[1].stock, 'MSFT')
          assert.isNumber(stockData[0].price)
          assert.isNumber(stockData[1].price)
          assert.isNumber(stockData[0].rel_likes)
          assert.isNumber(stockData[1].rel_likes)
          // They should be differ in the sign only. Magnitude should remain same
          assert.equal(stockData[0].rel_likes, stockData[1].rel_likes * -1)
          assert.equal(stockData[0].rel_likes, 1)
          done()
        })
    })

    test('2 stocks with like', function(done) {
      chai
        .request(server)
        .get('/api/stock-prices?stock=aapl&stock=v&like=true')
        .end((err, res) => {
          let { stockData } = res.body
          assert.equal(res.status, 200)
          assert.equal(stockData[0].stock, 'AAPL')
          assert.equal(stockData[1].stock, 'V')
          assert.isNumber(stockData[0].price)
          assert.isNumber(stockData[1].price)
          assert.isNumber(stockData[0].rel_likes)
          assert.isNumber(stockData[1].rel_likes)
          // They should be differ in the sign only. Magnitude should remain same
          assert.equal(stockData[0].rel_likes, stockData[1].rel_likes * -1)
          assert.equal(stockData[0].rel_likes, aaplLikes - vLikes)
          chai
            .request(server)
            .get('/api/stock-prices')
            .query({ stock: 'aapl' })
            .end((err, res) => {
              assert.equal(res.body.stockData.likes, aaplLikes + 1)
            })
          chai
            .request(server)
            .get('/api/stock-prices')
            .query({ stock: 'aapl' })
            .end((err, res) => {
              assert.equal(res.body.stockData.likes, vLikes + 1)
              done()
            })
        })
    })

    before(done => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'aapl' })
        .end((err, res) => {
          aaplLikes = res.body.stockData.likes
        })
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'v' })
        .end((err, res) => {
          vLikes = res.body.stockData.likes
          done()
        })
    })

    after(done => {
      Stock.deleteMany({}, err => {
        if (err) console.error(err)
        done()
      })
    })
  })
})
