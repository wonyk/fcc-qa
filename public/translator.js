import { americanOnly } from './american-only.js'
import { britishOnly } from './british-only.js'
import { americanToBritishSpelling } from './american-to-british-spelling.js'
import { americanToBritishTitles } from './american-to-british-titles.js'

const textInput = document.getElementById('text-input')
const translateBtn = document.getElementById('translate-btn')
const clearBtn = document.getElementById('clear-btn')
const selection = document.getElementById('locale-select')
const solOut = document.getElementById('translated-sentence')
const errorOut = document.getElementById('error-msg')
const timeregexAmerican = /\b(2[0-3]|[0-1]?[1-9]):([0-5][0-9])(\b|pm|am)/gi
const timeregexBritish = /\b(2[0-3]|[0-1]?[1-9]).([0-5][0-9])(\b|pm|am)/gi

window.addEventListener('DOMContentLoaded', (event) => {
  translateBtn.addEventListener('click', handleTranslate)
  clearBtn.addEventListener('click', handleClear)
})

const handleClear = () => {
  errorOut.innerText = ''
  textInput.value = ''
  solOut.innerHTML = ''
}

const handleTranslate = () => {
  if (!translate()) {
    solOut.innerHTML = ''
    return (errorOut.innerText = 'Error: No text to translate.')
  }
  errorOut.innerText = ''
  solOut.innerHTML = translate()
}

const translate = () => {
  const str = textInput.value
  if (str.length === 0) {
    return false
  }
  // Use short form for shorter and leaner code
  // atb: american-to-british; bta: british-to-american
  // filterAmerican and filterBritish will return an array of 2 parameters:
  // newStr is the edited and corrected string; filtered is an array of new word replaced (to be turned green)
  const type = selection.value === 'american-to-british' ? 'atb' : 'bta'
  if (type === 'atb') {
    const [newStr, filtered] = filterAmerican(str)
    if (filtered.length === 0) {
      return 'Everything looks good to me!'
    }
    return translateToBritish(newStr, filtered)
  }
  const [newStr, filtered] = filterBritish(str)
  if (filtered.length === 0) {
    return 'Everything looks good to me!'
  }
  return translateToAmerican(newStr, filtered)
}

const filterAmerican = (str) => {
  const combinedObj = {
    ...americanOnly,
    ...americanToBritishSpelling,
  }
  // Since for American, they are all object keys, we can combine the object and loop through to find the keys
  // We can then edit the matches with the value of that key and return the value edited in an array
  // A copy of str is used so that any words edited cannot be parsed again. Refer to the chippy example in filterBritish
  let filteredList = []
  let copyStr = (' ' + str).slice(1)
  Object.keys(combinedObj).forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    if (regex.test(copyStr)) {
      let newTerm = combinedObj[term]
      str = str.replace(regex, newTerm)
      copyStr = copyStr.replace(regex, '')
      filteredList.push(newTerm)
    }
  })
  // Second, we parse the titles
  Object.keys(americanToBritishTitles).forEach((term) => {
    // Add proper regex parsing to the string to escape `.`
    const escapedTerm = term.replace('.', '\\.')
    const regex = new RegExp(`\\b${escapedTerm}(?!\\S)`, 'gi')
    if (regex.test(str)) {
      let newTerm = americanToBritishTitles[term]
      str = str.replace(regex, newTerm)
      filteredList.push(newTerm)
    }
  })
  // Next we parse the time
  const matches = [...str.matchAll(timeregexAmerican)]
  str = str.replace(timeregexAmerican, `$1.$2$3`)
  for (const match of matches) {
    filteredList.push(`${match[1]}.${match[2]}`)
  }
  return [str, filteredList]
}

const translateToBritish = (str, matchArr) => {
  matchArr.forEach((match) => {
    const regex = new RegExp(match, 'gi')
    str = str.replace(regex, `<span class='highlight'>$&</span>`)
  })
  return str
}

const filterBritish = (str) => {
  let filteredListOne = []
  let filteredListTwo = []
  let filteredListThree = []
  let filteredTime = []
  // We use copy string to remove the chance of duplicates
  // Example: chippy -> fish and `chip shop` -> fish and `fish and chip shop`
  let copyStr = (' ' + str).slice(1)
  // Loop through the British only list and the conversion files
  Object.keys(britishOnly).forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    if (regex.test(copyStr)) {
      let newTerm = britishOnly[term]
      str = str.replace(regex, newTerm)
      copyStr = copyStr.replace(regex, '')
      filteredListOne.push(newTerm)
    }
  })
  Object.keys(americanToBritishSpelling).forEach((term) => {
    let target = americanToBritishSpelling[term]
    const regex = new RegExp(`\\b${target}\\b`, 'gi')
    if (regex.test(copyStr)) {
      str = str.replace(regex, term)
      copyStr = copyStr.replace(regex, '')
      filteredListTwo.push(term)
    }
  })
  // Second, we parse the titles
  Object.keys(americanToBritishTitles).forEach((term) => {
    let target = americanToBritishTitles[term]
    const regex = new RegExp(`\\b${target}(?!\\S)`, 'gi')
    if (regex.test(str)) {
      str = str.replace(regex, term)
      filteredListThree.push(term)
    }
  })
  // Filter the time
  const matches = [...str.matchAll(timeregexBritish)]
  str = str.replace(timeregexBritish, `$1:$2$3`)
  for (const match of matches) {
    filteredTime.push(`${match[1]}:${match[2]}`)
  }
  const filteredList = [
    ...filteredListOne,
    ...filteredListTwo,
    ...filteredListThree,
    ...filteredTime,
  ]
  return [str, filteredList]
}

const translateToAmerican = (str, matchArr) => {
  matchArr.forEach((match) => {
    const regex = new RegExp(`\\b${match}\\b`, 'gi')
    str = str.replace(regex, `<span class='highlight'>$&</span>`)
  })
  return str
}

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {
    filterAmerican,
    filterBritish,
  }
} catch (e) {}
