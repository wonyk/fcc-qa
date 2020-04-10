/*
 *
 *
 *       Complete the handler logic below
 *
 *
 */

function ConvertHandler() {
  this.getNum = function(input) {
    // Return first index of the first letter found
    let index = input.search(/[a-zA-Z]+/)
    let num = input.slice(0, index)
    // Regex to test for proper number or no numbers
    if (!/\.|[0-9]+|\//g.test(num)) {
      return 1
    } else {
      // only remove front and back whitespace. Ignore whitespace between numbers
      let newNum = num.replace(/^ +| +$/g, '')
      if (!/\//.test(newNum)) {
        newNum = newNum.match(/^[0-9]*(\.[0-9]*)?$/)
        if (!newNum) {
          return false
        } else {
          return Number(newNum[0])
        }
      } else {
        // Settle fractions by dividing and sending the result to the next stage
        let arr = newNum.split('/')
        if (arr.length == 2) {
          let num = arr[0] / arr[1]
          // in case the numbers are not able to divide
          return num ? num : false
        }
        return false
      }
    }
  }

  this.getUnit = function(input) {
    //     Return first index of the first letter found
    let index = input.search(/[a-zA-Z]+/)
    let unit = input.slice(index)
    let newUnit = unit.replace(/ +$/g, '').match(/^[a-zA-Z]+$/)
    if (!newUnit) {
      return false
    } else {
      let input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg']
      if (input.indexOf(newUnit[0].toLowerCase()) !== -1) {
        return newUnit[0]
      }
      return false
    }
  }

  this.getReturnUnit = function(initUnit) {
    switch (initUnit.toLowerCase()) {
      case 'kg':
        return 'lbs'
      case 'lbs':
        return 'kg'
      case 'l':
        return 'gal'
      case 'gal':
        return 'l'
      case 'km':
        return 'mi'
      case 'mi':
        return 'km'
      default:
        return false
    }
  }

  this.spellOutUnit = function(unit) {
    switch (unit.toLowerCase()) {
      case 'kg':
        return 'kilograms'
      case 'lbs':
        return 'pounds'
      case 'l':
        return 'liters'
      case 'gal':
        return 'gallons'
      case 'km':
        return 'kilometers'
      case 'mi':
        return 'miles'
      default:
        return false
    }
  }

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541
    const lbsToKg = 0.453592
    const miToKm = 1.60934

    switch (initUnit.toLowerCase()) {
      case 'kg':
        return initNum / lbsToKg
      case 'lbs':
        return initNum * lbsToKg
      case 'l':
        return initNum / galToL
      case 'gal':
        return initNum * galToL
      case 'km':
        return initNum / miToKm
      case 'mi':
        return initNum * miToKm
      default:
        return false
    }
  }

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    const str = `${initNum} ${initUnit} converts to ${returnNum} ${returnUnit}`
    return str
  }
}

module.exports = ConvertHandler
