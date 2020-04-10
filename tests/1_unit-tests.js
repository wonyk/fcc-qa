/*
 *
 *
 *       FILL IN EACH UNIT TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]----
 *       (if additional are added, keep them at the very end!)
 */

let chai = require('chai')
let assert = chai.assert
let ConvertHandler = require('../controllers/convertHandler.js')

let convertHandler = new ConvertHandler()

suite('Unit Tests', function() {
  suite('Function convertHandler.getNum(input)', function() {
    test('Whole number input', function(done) {
      let input = '32L'
      assert.equal(convertHandler.getNum(input), 32)
      done()
    })

    test('Decimal Input', function(done) {
      let input = '3.1mi'
      assert.equal(convertHandler.getNum(input), 3.1)
      done()
    })

    test('Fractional Input', function(done) {
      let input = '3/2kg'
      assert.equal(convertHandler.getNum(input), 1.5)
      done()
    })

    test('Fractional Input w/ Decimal', function(done) {
      let input = '1.5/0.5gal'
      assert.equal(convertHandler.getNum(input), 3)
      done()
    })

    test('Invalid Input (double fraction)', function(done) {
      let input = '1.3/2/3lbs'
      assert.isFalse(
        convertHandler.getNum(input),
        'Invalid input should return false'
      )
      done()
    })

    test('No Numerical Input', function(done) {
      let input = 'kg'
      assert.equal(convertHandler.getNum(input), 1)
      done()
    })
  })

  suite('Function convertHandler.getUnit(input)', function() {
    test('For Each Valid Unit Inputs', function(done) {
      let input = [
        'gal',
        'l',
        'mi',
        'km',
        'lbs',
        'kg',
        'GAL',
        'L',
        'MI',
        'KM',
        'LBS',
        'KG'
      ]
      input.forEach(function(ele) {
        assert.equal(
          convertHandler.getUnit(ele),
          ele,
          'The unit return should be case sensitive'
        )
      })
      done()
    })

    test('Unknown Unit Input', function(done) {
      let input = 'mol'
      assert.isFalse(convertHandler.getUnit(input))
      done()
    })
  })

  suite('Function convertHandler.getReturnUnit(initUnit)', function() {
    test('For Each Valid Unit Inputs', function(done) {
      let input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg']
      let expect = ['l', 'gal', 'km', 'mi', 'kg', 'lbs']
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.getReturnUnit(ele), expect[i])
      })
      done()
    })
  })

  suite('Function convertHandler.spellOutUnit(unit)', function() {
    test('For Each Valid Unit Inputs', function(done) {
      let input = [
        'gal',
        'l',
        'mi',
        'km',
        'lbs',
        'kg',
        'GAL',
        'L',
        'MI',
        'KM',
        'LBS',
        'KG'
      ]
      let expect = [
        'gallons',
        'liters',
        'miles',
        'kilometers',
        'pounds',
        'kilograms',
        'gallons',
        'liters',
        'miles',
        'kilometers',
        'pounds',
        'kilograms'
      ]
      input.forEach((ele, i) => {
        assert.equal(convertHandler.spellOutUnit(ele), expect[i])
      })
      done()
    })
  })

  suite('Function convertHandler.convert(num, unit)', function() {
    test('Gal to L', function(done) {
      let input = [5, 'gal']
      let expected = 18.9271
      assert.approximately(
        convertHandler.convert(input[0], input[1]),
        expected,
        0.1
      )
      done()
    })

    test('L to Gal', function(done) {
      let input = [2, 'L']
      let expected = 0.52834
      assert.approximately(convertHandler.convert(...input), expected, 0.1)
      done()
    })

    test('Mi to Km', function(done) {
      let input = [2, 'Mi']
      let expected = 3.2187
      assert.approximately(convertHandler.convert(...input), expected, 0.1)
      done()
    })

    test('Km to Mi', function(done) {
      let input = [10, 'Km']
      let expected = 6.2136
      assert.approximately(convertHandler.convert(...input), expected, 0.1)
      done()
    })

    test('Lbs to Kg', function(done) {
      let input = [5, 'Lbs']
      let expected = 2.2679
      assert.approximately(convertHandler.convert(...input), expected, 0.1)
      done()
    })

    test('Kg to Lbs', function(done) {
      let input = [10, 'Kg']
      let expected = 22.0462
      assert.approximately(convertHandler.convert(...input), expected, 0.1)
      done()
    })
  })

  suite(
    'Function convertHandler.getString(initNum, initUnit, returnNum, returnUnit)',
    function() {
      test('Lbs to Kg', function(done) {
        let input = '2Lbs'
        let initNum = convertHandler.getNum(input)
        let initUnit = convertHandler.getUnit(input)
        let returnUnit = convertHandler.getReturnUnit(initUnit)
        let returnNum = convertHandler.convert(initNum, initUnit)
        let expected = '2 pounds converts to 0.90718 kilograms'
        assert.equal(
          convertHandler.getString(
            initNum,
            convertHandler.spellOutUnit(initUnit),
            parseFloat(returnNum.toFixed(5)),
            convertHandler.spellOutUnit(returnUnit)
          ),
          expected
        )
        done()
      })
    }
  )
})
