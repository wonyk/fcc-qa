/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chai = require('chai')
const assert = chai.assert

const { puzzlesAndSolutions } = require('../public/puzzle-strings')
let event

suite('Functional Tests', () => {
  suiteSetup(() => {
    // DOM already mocked -- load sudoku solver then run tests
    event = new window.Event('input', {
      bubbles: true,
      cancelable: true,
    })
  })
  suite('Text area and sudoku grid update automatically', () => {
    // Entering a valid number in the text area populates
    // the correct cell in the sudoku grid with that number
    test('Valid number in text area populates correct cell in grid', (done) => {
      // We use the first provided example
      const textArea = document.getElementById('text-input')
      const refStr = puzzlesAndSolutions[0][0]
      textArea.value = refStr
      textArea.dispatchEvent(event)
      // Check that the grid is updated (we check 1st, 41th and 81st in the grid)
      let A1 = document.getElementById('A1')
      let E5 = document.getElementById('E5')
      let I9 = document.getElementById('I9')
      assert.equal(
        A1.value,
        refStr.substr(0, 1) !== '.' ? refStr.substr(0, 1) : ''
      )
      assert.equal(
        E5.value,
        refStr.substr(40, 1) !== '.' ? refStr.substr(40, 1) : ''
      )
      assert.equal(
        I9.value,
        refStr.substr(80, 1) !== '.' ? refStr.substr(80, 1) : ''
      )
      // Edit text field and see if the grid updates by changing first number
      textArea.value = '3' + refStr.substr(1)
      textArea.dispatchEvent(event)
      assert.equal(A1.value, '3')
      done()
    })
    //   // Entering a valid number in the grid automatically updates
    //   // the puzzle string in the text area
    test('Valid number in grid updates the puzzle string in the text area', (done) => {
      // We use the second provided example
      const textArea = document.getElementById('text-input')
      const refStr = puzzlesAndSolutions[1][0]
      textArea.value = refStr
      textArea.dispatchEvent(event)
      // Check that the grid is initialised properly (we check 1st, 41th and 81st in the grid)
      let A1 = document.getElementById('A1')
      let E5 = document.getElementById('E5')
      let I9 = document.getElementById('I9')
      assert.equal(
        A1.value,
        refStr.substr(0, 1) !== '.' ? refStr.substr(0, 1) : ''
      )
      assert.equal(
        E5.value,
        refStr.substr(40, 1) !== '.' ? refStr.substr(40, 1) : ''
      )
      assert.equal(
        I9.value,
        refStr.substr(80, 1) !== '.' ? refStr.substr(80, 1) : ''
      )
      // Change 2 numbers in the grid and see if the text field changes
      A1.value = ''
      A1.dispatchEvent(event)
      E5.value = '3'
      E5.dispatchEvent(event)
      // Now check the textArea string
      const checkStr = textArea.value
      assert.equal(checkStr.substr(0, 1), '.')
      assert.equal(checkStr.substr(40, 1), '3')
      done()
    })
  })
  suite('Clear and solve buttons', () => {
    // Pressing the "Clear" button clears the sudoku
    // grid and the text area
    test('Function handleClear()', (done) => {
      // Since the grid is filled previously, we can simply clear
      document.getElementById('clear-button').click()
      let A1 = document.getElementById('A1')
      let E5 = document.getElementById('E5')
      let I9 = document.getElementById('I9')
      assert.equal(document.getElementById('text-input').value, '')
      assert.equal(A1.value, '')
      assert.equal(E5.value, '')
      assert.equal(I9.value, '')
      done()
    })
    // Pressing the "Solve" button solves the puzzle and
    // fills in the grid with the solution
    test('Function solve(handleSolve())', (done) => {
      // Test it with all 5 provided test cases
      puzzlesAndSolutions.forEach((arrTest) => {
        const textArea = document.getElementById('text-input')
        const refStr = arrTest[0]
        textArea.value = refStr
        textArea.dispatchEvent(event)
        document.getElementById('solve-button').click()
        assert.equal(textArea.value, arrTest[1])
        // Now check the Grid against the correct TextArea value
        let A1 = document.getElementById('A1')
        let E5 = document.getElementById('E5')
        let I9 = document.getElementById('I9')
        const sol = arrTest[1]
        assert.equal(A1.value, sol.substr(0, 1))
        assert.equal(E5.value, sol.substr(40, 1))
        assert.equal(I9.value, sol.substr(80, 1))
      })
      done()
    })
  })
})
