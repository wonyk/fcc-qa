/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict'

let expect = require('chai').expect
let ConvertHandler = require('../controllers/convertHandler.js')

module.exports = function(app) {
  let convertHandler = new ConvertHandler()

  app.route('/api/convert').get(function(req, res) {
    let input = req.query.input
    let initNum = convertHandler.getNum(input)
    let initUnit = convertHandler.getUnit(input)
    if (!initNum) {
      // Only show invalid number when init Units confirms to be valid
      return initUnit
        ? res.json({ error: 'invalid number' })
        : res.json({ error: 'invalid number and unit' })
    } else if (!initUnit) {
      return res.json({ error: 'invalid unit' })
    }
    // When both are correct and valid
    let returnUnit = convertHandler.getReturnUnit(initUnit)
    let returnNum = convertHandler.convert(initNum, initUnit)
    let toString = convertHandler.getString(
      initNum,
      convertHandler.spellOutUnit(initUnit),
      parseFloat(returnNum.toFixed(5)),
      convertHandler.spellOutUnit(returnUnit)
    )
    res.json({ initNum, initUnit, returnNum, returnUnit, string: toString })
  })
}
