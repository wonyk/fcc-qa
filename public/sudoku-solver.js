const textArea = document.getElementById('text-input')
const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
let globalBoardArray

/*
  This Sudoku solver works in the following form:
  All internal working will use the globalBoardArray which is a 2D array: See parseStrToArr
  Once the website loads, the JS will convert the string into the array and use the array to display grid: See mapToGrid
  Only when needed (for UI purpose), the array will be converted back to string: See parseArrToStr
*/

document.addEventListener('DOMContentLoaded', () => {
  // Load a simple default puzzle into the text area; top40 is imported by HTML as a script
  let randPuzzle = Math.floor(Math.random() * Math.floor(40))
  textArea.value = top40[randPuzzle]
  globalBoardArray = parseStrToArr(textArea.value)
  mapToGrid()
  // Add event listener to all the 81 input fields on the grid
  let elements = document.getElementsByClassName('sudoku-input')
  Array.from(elements).forEach((ele) =>
    ele.addEventListener('input', handleGridInput)
  )
  // Add event Listener for the clear and solve buttons as well as the text input field
  document.getElementById('clear-button').addEventListener('click', handleClear)
  document.getElementById('solve-button').addEventListener('click', solve)
  textArea.addEventListener('input', handleTextField)
})

// This function does not use arrow func because we need to use 'this'
const handleGridInput = function () {
  // Only allow 1-9 and nothing else
  this.value = this.value.replace(/[^1-9]/g, '')
  // Example A1 will be split into ['A', '1']
  const [letter, num] = this.id.split('')
  const row = rows.indexOf(letter)
  const col = num - 1
  globalBoardArray[row][col] = this.value !== '' ? this.value : '.'
  parseArrToStr()
}

const handleClear = () => {
  textArea.value = ''
  globalBoardArray = parseStrToArr('')
  mapToGrid()
}

// Only allow 1-9 and .
// Anything not 81 in length will not trigger a DOM change for grid and array
const handleTextField = function () {
  this.value = this.value.replace(/[^1-9.]/g, '')
  if (this.value.length !== 81) {
    return
  }
  globalBoardArray = parseStrToArr(this.value)
  mapToGrid()
}

const solve = () => {
  const { value } = textArea
  const errEle = document.getElementById('error-msg')
  if (value.length !== 81) {
    errEle.style.visibility = 'visible'
    errEle.innerText = 'Error: Expected puzzle to be 81 characters long.'
    return
  }
  if (!checkQuestion()) {
    errEle.style.visibility = 'visible'
    errEle.innerText = 'Error: No solution.'
    return
  }
  if (handleSolve()) {
    errEle.innerText = ''
    errEle.style.visibility = 'hidden'
    mapToGrid()
    parseArrToStr()
  } else {
    errEle.style.visibility = 'visible'
    errEle.innerText = 'Error: No solution.'
  }
}

/* handleSolve is a recursive function to keep going until there is no solution and it will 'backtrack'
  Example: If Grid 'A1' found a temp solution of '1' (in the loop from 1-9), it will continue to next empty grid and try 1-9.
  If there is a sol, it will continue to next empty grid until there is no sol or no empty grid
  If there is no sol, it will return false (which will reset curr grid value) and fallback to prev func (and try the remaining numbers in loop)
  Continue to backtrack until there is a solution or return 'No solution'
  If no more empty grid, it will return success and the solution is printed on the screen */

const handleSolve = () => {
  let foundEmpty = findEmpty(globalBoardArray)
  if (!foundEmpty) {
    return true
  }
  const row = foundEmpty[0]
  const col = foundEmpty[1]

  for (let testNum = 1; testNum < 10; testNum++) {
    if (checkValid(row, col, testNum)) {
      globalBoardArray[row][col] = testNum.toString()
      if (handleSolve()) {
        return true
      }
      // Only ran when the next step has no solution, reset value and backtrack
      globalBoardArray[row][col] = '.'
    }
  }
  return false
}

const findEmpty = () => {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (globalBoardArray[x][y] === '.') {
        return [x, y]
      }
    }
  }
  return false
}

const checkQuestion = () => {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (globalBoardArray[x][y] === '.') {
        continue
      }
      if (!checkValid(x, y, globalBoardArray[x][y])) {
        return false
      }
    }
  }
  return true
}

// Check valid will require the number to check as well as the row, column and the array iteself
const checkValid = (row, col, num) => {
  const arr = globalBoardArray
  // Check if the number is present in that row or column (not including itself)
  const foundRow = checkRow(arr[row], col, num)
  const foundCol = checkCol(arr, row, col, num)
  // Check if number is in the box. Number calculated to start from index 0.
  const rowOffset = row - (row % 3)
  const colOffset = col - (col % 3)
  const foundBox = checkBox(arr, row, rowOffset, col, colOffset, num)
  if (!foundBox && !foundCol && !foundRow) {
    return true
  }
  return false
}

const checkRow = (arr, col, num) => {
  let index = arr.indexOf(num.toString())
  if (index === -1 || index === col) {
    return false
  }
  return true
}

const checkCol = (arr, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (arr[x][col] === num.toString() && x !== row) {
      return true
    }
  }
  return false
}

const checkBox = (arr, row, rowOff, col, colOff, num) => {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (
        arr[rowOff + x][colOff + y] === num.toString() &&
        rowOff + x !== row &&
        colOff + y !== col
      ) {
        return true
      }
    }
  }
  return false
}

// mapToGrid will write to the grid
const mapToGrid = () => {
  for (let x = 0; x < rows.length; x++) {
    for (let y = 1; y < 10; y++) {
      let gridName = rows[x] + y.toString()
      let val = globalBoardArray[x][y - 1]
      let target = document.getElementById(gridName)
      target.value = val !== '.' ? val : ''
    }
  }
}

// This will return a 9x9 2D array
const parseStrToArr = (str) => {
  let arr = []
  if (str.length === 0) {
    str = '.'.repeat(81)
  }
  for (let x = 0; x < rows.length; x++) {
    let nineLenStr = str.substr(x * 9, 9)
    arr.push(nineLenStr.split(''))
  }
  return arr
}

const parseArrToStr = () => {
  let flatten = globalBoardArray.flat()
  textArea.value = flatten.join('')
}

window.getGlobal = () => {
  return globalBoardArray
}
/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {}
} catch (e) {}
