/*
 *
 *
 *       FILL IN EACH UNIT TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]----
 *       (if additional are added, keep them at the very end!)
 */

const chai = require('chai')
const assert = chai.assert

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const { validStrArr, solvedStr } = require('../public/testStr')
let event

suite('UnitTests', () => {
  suiteSetup(function() {
    this.timeout = 5000
    // Mock the DOM for testing and load Solver
    return JSDOM.fromFile('./views/index.html', {
      runScripts: 'dangerously',
      resources: 'usable'
    }).then(dom => {
      return new Promise(resolve => {
        dom.window.document.addEventListener('DOMContentLoaded', () => {
          global.window = dom.window
          global.document = dom.window.document
          event = new window.Event('input', {
            bubbles: true,
            cancelable: true
          })
          resolve()
        })
      })
    })
  })
  // Only the digits 1-9 are accepted
  // as valid input for the puzzle grid
  suite('Function handleGridInput()', () => {
    test('Valid "1-9" characters', done => {
      const input = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
      const samepleGrid = document.getElementById('A1')
      input.forEach(ele => {
        samepleGrid.value = ele
        samepleGrid.dispatchEvent(event)
        assert.equal(samepleGrid.value, ele)
      })
      done()
    })

    // Invalid characters or numbers are not accepted
    // as valid input for the puzzle grid
    test('Invalid characters (anything other than "1-9") are not accepted', done => {
      const input = ['!', 'a', '/', '+', '-', '0', '10', 0, '.']
      const samepleGrid = document.getElementById('A1')
      input.forEach(ele => {
        samepleGrid.value = ele
        samepleGrid.dispatchEvent(event)
        if (ele === '10') {
          return assert.equal(samepleGrid.value, '1')
        }
        assert.equal(samepleGrid.value, '')
      })
      done()
    })
  })

  suite('Function handleTextField(), mapToGrid() and solve()', () => {
    test('Parses a valid puzzle string into an object', done => {
      const input =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      const textArea = document.getElementById('text-input')
      textArea.value = input
      textArea.dispatchEvent(event)
      assert.equal(textArea.value, input)
      // Check back with code to see if the array is formatted properly
      const arr = window.getGlobal()
      assert.isArray(arr)
      assert.deepEqual(arr, validStrArr)
      done()
    })

    // Puzzles that are not 81 numbers/periods long show the message
    // "Error: Expected puzzle to be 81 characters long." in the
    // `div` with the id "error-msg"
    test('Shows an error for puzzles that are not 81 numbers long', done => {
      const shortStr = '83.9.....6.62.71...9......1945....4.37.4.3..6..'
      const longStr =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6...'
      const textArea = document.getElementById('text-input')
      const errorMsg = 'Error: Expected puzzle to be 81 characters long.'
      const errorDiv = document.getElementById('error-msg')
      // Ensure error div cannot be seen initially
      assert.equal(errorDiv.style.visibility, '')
      textArea.value = shortStr
      textArea.dispatchEvent(event)
      document.getElementById('solve-button').click()
      assert.equal(errorDiv.innerText, errorMsg)
      assert.equal(errorDiv.style.visibility, 'visible')
      // Change back to long string and the error should remain. Start by resetting the value of errorDiv to confirm a positive result
      errorDiv.innerText = ''
      textArea.value = longStr
      textArea.dispatchEvent(event)
      document.getElementById('solve-button').click()
      assert.equal(errorDiv.innerText, errorMsg)
      done()
    })
  })

  suite('Function checkQuestion() in solve()', () => {
    // Valid complete puzzles pass
    test('Valid puzzles pass', done => {
      const textArea = document.getElementById('text-input')
      const errorDiv = document.getElementById('error-msg')
      const input =
        '769235418851496372432178956174569283395842761628713549283657194516924837947381625'
      textArea.value = input
      textArea.dispatchEvent(event)
      document.getElementById('solve-button').click()
      // No error (this test verifies the checkQuestion function more than the solve function)
      assert.equal(errorDiv.innerText, '')
      assert.equal(errorDiv.style.visibility, 'hidden')
      done()
    })

    //   // Invalid complete puzzles fail
    test('Invalid puzzles fail', done => {
      const textArea = document.getElementById('text-input')
      const errorDiv = document.getElementById('error-msg')
      const input =
        '779235418851496372432178956174569283395842761628713549283657194516924837947381625'
      textArea.value = input
      textArea.dispatchEvent(event)
      document.getElementById('solve-button').click()
      // No error
      assert.equal(errorDiv.innerText, 'Error: No solution.')
      assert.equal(errorDiv.style.visibility, 'visible')
      done()
    })
  })

  suite('Function handleSolve()', () => {
    // Returns the expected solution for a valid, incomplete puzzle
    test('Returns the expected solution for an incomplete puzzle', done => {
      const textArea = document.getElementById('text-input')
      const errorDiv = document.getElementById('error-msg')
      const input =
        '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      textArea.value = input
      textArea.dispatchEvent(event)
      document.getElementById('solve-button').click()
      // No error msg shown
      assert.equal(errorDiv.innerText, '')
      assert.equal(errorDiv.style.visibility, 'hidden')
      // Verify solution is correct
      assert.equal(textArea.value, solvedStr)
      done()
    })
  })
})
