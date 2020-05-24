'use strict'

let inputTextArea = document.getElementById('inputTextArea')
let resultTextArea = document.getElementById('resultTextArea')

document.getElementById('encodeButton').onclick = function() {
  try {
    let text = inputTextArea.value
    resultTextArea.value = btoa(text)
  } catch (e) {
    alert(e.message)
  }
}

document.getElementById('decodeButton').onclick = function() {
  try {
    let text = inputTextArea.value
    resultTextArea.value = atob(text)
  } catch (e) {
    alert(e.message)
  }
}