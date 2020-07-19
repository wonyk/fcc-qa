/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]----
 *       (if additional are added, keep them at the very end!)
 */

const chai = require('chai')
const assert = chai.assert
let textInput
let translateBtn
let clearBtn
let selection
let solOut
let errorOut

suite('Functional Tests', () => {
  suiteSetup(() => {
    // DOM already mocked -- load translator then run tests
    textInput = document.getElementById('text-input')
    translateBtn = document.getElementById('translate-btn')
    clearBtn = document.getElementById('clear-btn')
    selection = document.getElementById('locale-select')
    solOut = document.getElementById('translated-sentence')
    errorOut = document.getElementById('error-msg')
  })

  suite('Function handleTranslate()', () => {
    /*
      The translated sentence is appended to the `translated-sentence` `div`
      and the translated words or terms are wrapped in
      `<span class="highlight">...</span>` tags when the "Translate" button is pressed.
    */
    test('Translation appended to the `translated-sentence` `div`', (done) => {
      // First test the American-To-British function (default)
      const inputUS = 'To play hooky means to skip class or work.'
      const outputUS =
        'To <span class="highlight">bunk off</span> means to skip class or work.'
      textInput.value = inputUS
      translateBtn.click()
      assert.equal(solOut.innerHTML, outputUS)
      selection.value = 'british-to-american'
      const inputUK = 'The car boot sale at Boxted Airfield was called off.'
      const outputUK =
        'The <span class="highlight">swap meet</span> at Boxted Airfield was called off.'
      textInput.value = inputUK
      translateBtn.click()
      assert.equal(solOut.innerHTML, outputUK)
      done()
    })

    /*
      If there are no words or terms that need to be translated,
      the message 'Everything looks good to me!' is appended to the
      `translated-sentence` `div` when the "Translate" button is pressed.
    */
    test("'Everything looks good to me!' message appended to the `translated-sentence` `div`", (done) => {
      const input = 'No Mr Bond, I expect you to die.'
      const output = 'Everything looks good to me!'
      selection.value = 'american-to-british'
      textInput.value = input
      translateBtn.click()
      assert.equal(solOut.innerHTML, output)
      done()
    })

    /*
      If the text area is empty when the "Translation" button is
      pressed, append the message 'Error: No text to translate.' to
      the `error-msg` `div`.
    */
    test("'Error: No text to translate.' message appended to the `translated-sentence` `div`", (done) => {
      textInput.value = ''
      translateBtn.click()
      assert.equal(solOut.innerHTML, '')
      assert.equal(errorOut.innerText, 'Error: No text to translate.')
      done()
    })
  })

  suite('Function handleClear()', () => {
    /*
      The text area and both the `translated-sentence` and `error-msg`
      `divs` are cleared when the "Clear" button is pressed.
    */
    test('Text area, `translated-sentence`, and `error-msg` are cleared', (done) => {
      clearBtn.click()
      assert.equal(textInput.value, '')
      assert.equal(solOut.innerHTML, '')
      assert.equal(errorOut.innerText, '')
      done()
    })
  })
})
