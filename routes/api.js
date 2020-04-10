/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict'

let mongoose = require('mongoose')
let axios = require('axios')
let Stock = require('../schemas/StockSchema')

const CONNECTION_STRING = process.env.NODE_ENV === 'test' ? process.env.DB_TEST : process.env.DB
mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

mongoose.connection.on('error', err => {
  console.error(err)
})

mongoose.set('debug', true)

module.exports = function(app) {
  app.route('/api/stock-prices').get(async (req, res) => {
    const getStockData = async stock => {
      let stockPrice, stockTicker
      try {
        let stockObj = await axios.get(
          `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
        )
        // End the request early if symbol is not found
        if (
          stockObj.data === 'Unknown symbol' ||
          stockObj.data === 'Invalid symbol'
        ) {
          throw 'Unknown symbol'
        }
        // If not get the latestPrice and the symbol in uppercase
        let { latestPrice, symbol } = stockObj.data
        stockPrice = latestPrice
        stockTicker = symbol
        // If ticker is available, search in the DB and add in if not already inside.
        let resp = await Stock.findOne({ ticker: stockTicker })
        // Only if the stock doesn't exist in the DB
        if (!resp) {
          let newStock = new Stock({
            ticker: stockTicker,
            likes: like === 'true' ? 1 : 0,
            ips: like === 'true' ? [req.ip] : []
          })
          const doc = await newStock.save()
          return {
            stock: stockTicker,
            price: stockPrice,
            likes: doc.likes
          }
        }
        // Otherwise:
        else if (like === 'true' && !resp.ips.includes(req.ip)) {
          resp.ips.push(req.ip)
          resp.likes++
          const newStock = await resp.save()
          return {
            stock: stockTicker,
            price: stockPrice,
            likes: newStock.likes
          }
        }
        // Only if stock is not liked or simply liked but ip inside
        else {
          return {
            stock: stockTicker,
            price: stockPrice,
            likes: resp.likes
          }
        }
      } catch (err) {
        throw 'Server error'
      }
    }

    let { stock, like } = req.query
    if (!stock) return res.status(404).json({ error: 'Missing stock symbol' })
    // Shallow copies
    let stockArray = typeof stock === 'string' ? [].concat(stock) : [...stock]
    if (stockArray.length > 2)
      return res.status(400).json({ error: 'Too many stock symbols' })
    // Only checks the stock once
    if (
      stockArray.length > 1 &&
      stockArray[0].toUpperCase() === stockArray[1].toUpperCase()
    )
      stockArray.splice(1, 1)
    Promise.all(
      stockArray.map(async stock => {
        return await getStockData(stock)
      })
    )
      .then(compiledData => {
        if (compiledData.length === 1) {
          return res.json({ stockData: compiledData[0] })
        } else {
          let rel_likes = compiledData[0].likes - compiledData[1].likes
          let parsedData = compiledData.map((d, i) => {
            return {
              stock: d.stock,
              price: d.price,
              rel_likes: i === 0 ? rel_likes : rel_likes * -1
            }
          })
          return res.json({ stockData: parsedData })
        }
        return res.json(compiledData)
      })
      .catch(err => {
        res.status(500).json({ error: err })
      })
  })
}
