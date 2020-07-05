// Author: Salvador Guerrero

'use strict'

let inputTextArea = document.getElementById('inputTextArea')
let resultTextArea = document.getElementById('resultTextArea')
let encodingSelect = document.getElementById('encodingSelect')

document.getElementById('encodeButton').onclick = function() {
  let text = inputTextArea.value
  let encodedText = ''
  switch (encodingSelect.value) {
    case 'base2': {
      encodedText = baseEncode(text, 2, base2Table)
      break;
    }
    case 'base8': {
      encodedText = baseEncode(text, 8, base8Table)
      break;
    }
    case 'base10': {
      encodedText = baseEncode(text, 10, base10Table)
      break;
    }
    case 'base16': {
      encodedText = baseEncode(text, 16, base16Table)
      break;
    }
    case 'base58': {
      encodedText = baseEncode(text, 58, base58Table)
      break;
    }
    case 'base64': {
      encodedText = baseEncode(text, 64, base64Table)
      break;
    }
  }
  resultTextArea.value = encodedText
}

document.getElementById('decodeButton').onclick = function() {
  let text = inputTextArea.value
  let decodedText = ''
  switch (encodingSelect.value) {
    case 'base2': {
      decodedText = baseDecode(text, 2, base2Table)
      break;
    }
    case 'base8': {
      decodedText = baseDecode(text, 8, base8Table)
      break;
    }
    case 'base10': {
      decodedText = baseDecode(text, 10, base10Table)
      break;
    }
    case 'base16': {
      decodedText = baseDecode(text, 16, base16Table)
      break;
    }
    case 'base58': {
      decodedText = baseDecode(text, 58, base58Table)
      break;
    }
    case 'base64': {
      decodedText = baseDecode(text, 64, base64Table)
      break;
    }
  }
  resultTextArea.value = decodedText
}

const base2Table = '01'.split("")
const base8Table = '01234567'.split("")
const base10Table = '0123456789'.split("")
const base16Table = '0123456789ABCDEF'.split("")
const base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("")
const base58Table = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'.split("")

function baseEncode(text, base, table) {
  // Calculate how many octets and base-chars conform one block
  // example for base64: 3 octets and 4 sextets
  let bitsPerBaseUnit = Math.log2(base)
  const mixedBaseBitsPerUnit = bitsPerBaseUnit !== Math.ceil(bitsPerBaseUnit)
  bitsPerBaseUnit = Math.ceil(bitsPerBaseUnit)
  const bitsPerChar = 8 // octet
  let baseUnitsPerBlock = 1
  let octetsPerBlock = 1
  for (; baseUnitsPerBlock * bitsPerBaseUnit !== bitsPerChar * octetsPerBlock; baseUnitsPerBlock++) {
    if (baseUnitsPerBlock * bitsPerBaseUnit > bitsPerChar * octetsPerBlock) {
      octetsPerBlock++
    }
  }
  let result = ''
  let padding = ''
  let remainder = text.length % octetsPerBlock
  if (remainder > 0) {
    for (; remainder < octetsPerBlock; remainder++) {
      text += '\0'
      padding += '='
    }
  }
  for (let i = 0; i < text.length; i += octetsPerBlock) {
    // Create the octet number
    let octetsNum = 0
    for (let j = octetsPerBlock - 1; j >= 0; j--) {
      const shift = bitsPerChar * j
      octetsNum += text.charCodeAt(i + (octetsPerBlock - (j + 1))) << shift
    }
    // Convert the octet number to base units
    const validBits = Math.pow(2, bitsPerBaseUnit) - 1
    let tableIndices = []
    let masks = []
    let shift = bitsPerBaseUnit * (baseUnitsPerBlock - 1)
    for (let i = 0; i < bitsPerChar * octetsPerBlock;) {
      let mask = validBits
      let maskBitCount = bitsPerBaseUnit
      i += bitsPerBaseUnit
      shift = Math.max(shift, 0)
      while (i > bitsPerChar * octetsPerBlock) {
        i--
        mask = mask >>> 1
        maskBitCount--
      }
      let index = octetsNum >>> shift & mask
      while (index >= base) {
        i--
        maskBitCount--
        mask = mask >>> 1
        shift++
        index = octetsNum >>> shift & mask
      }
      masks.push(maskBitCount)
      tableIndices.push(index)
      shift -= bitsPerBaseUnit
    }
    // Map the base units to the table
    for (let j = 0; j < tableIndices.length; j++) {
      if (mixedBaseBitsPerUnit)
        result += masks[j]
      result += table[tableIndices[j]]
    }
  }
  return result.substring(0, result.length - padding.length) + padding
}

function baseDecode(text, base, table) {
  // Reference: https://en.wikipedia.org/wiki/Base64
  // Remove any character not in the table + '='
  text = text.replace(new RegExp('[^' + table + '=]', 'g'), '')
  let result = ''
  let bitsPerBaseUnit = Math.log2(base)
  const mixedBaseBitsPerUnit = bitsPerBaseUnit !== Math.ceil(bitsPerBaseUnit)
  bitsPerBaseUnit = Math.ceil(bitsPerBaseUnit)
  const bitsPerChar = 8 // octet
  let baseUnitsPerBlock = 1
  let octetsPerBlock = 1
  for (; baseUnitsPerBlock * bitsPerBaseUnit !== bitsPerChar * octetsPerBlock; baseUnitsPerBlock++) {
    if (baseUnitsPerBlock * bitsPerBaseUnit > bitsPerChar * octetsPerBlock) {
      octetsPerBlock++
    }
  }
  const remainder = text.length % baseUnitsPerBlock
  const firstChar = table[0]
  let paddingLength
  if (remainder > 0) {
    // if '=' padding is missing, fix it by adding firstChar which equals '0'
    paddingLength = baseUnitsPerBlock - remainder
    for (let i = remainder; i < baseUnitsPerBlock; i++) {
      text += firstChar
    }
  } else {
    // if '=' padding is there, swap it to 0
    // A = 0
    let padding = text.charAt(text.length - 1) === '=' ? text.charAt(text.length - 2) === '=' ? `${firstChar}${firstChar}` : firstChar : ''
    paddingLength = padding.length
    text = text.substring(0, text.length - paddingLength) + padding
  }
  for (let i = 0; i < text.length;) {
    // Create base number
    let baseNum = 0
    let shift = bitsPerChar * octetsPerBlock
    for (let j = 0; j < baseUnitsPerBlock * bitsPerBaseUnit;) {
      let mask = bitsPerBaseUnit
      if (mixedBaseBitsPerUnit) {
        mask = parseInt(text.charAt(i++))
      }
      const baseUnit = text.charAt(i++)
      shift -= mask
      j += mask
      baseNum += table.indexOf(baseUnit) << shift
    }
    // convert base to octets
    const validBits = Math.pow(2, bitsPerChar) - 1
    let tableIndices = []
    for (let j = octetsPerBlock - 1; j >= 0; j--) {
      const shift = bitsPerChar * j
      tableIndices.push(baseNum >>> shift & validBits)
    }
    // Map the base units to the table
    for (let j = 0; j < tableIndices.length; j++) {
      result += String.fromCharCode(tableIndices[j])
    }
  }
  return result.substring(0, result.length - paddingLength)
}

/*****************************/
/* Individual Implementation */
/*****************************/
/*
function base16Encode(text) {
  // Doesn't need any padding because each octet can be represented with two base16 units
  let result = ''
  for (let i = 0; i < text.length; i++) {
    // Create a 24-bit number with these 3 octets
    let octetsNum = text.charCodeAt(i)
    // 0xF quartet number represent 1111 in binary
    let quartets = [octetsNum >> 4 & 0xF, octetsNum & 0xF]
    // Map sextets to the base64 character
    result += base16Table[quartets[0]] + base16Table[quartets[1]]
  }
  return result
}
*/
/*
function base64Encode(text) {
  // Reference: https://en.wikipedia.org/wiki/Base64
  // when the length of the unencoded input is not a multiple of three, the encoded output must have padding
  // added so that its length is a multiple of four.
  // https://en.wikibooks.org/wiki/Algorithm_Implementation/Miscellaneous/Base64
  let result = ''
  let padding = ''
  let remainder = text.length % 3
  if (remainder > 0) {
    for (; remainder < 3; remainder++) {
      text += '\0'
      padding += '='
    }
  }
  // 1 octet = 8 bits
  // Iterate every 3 octets (24 bits)
  // 3 octets == 3 ascii letters
  // 4 sextets == 4 base64 characters
  for (let i = 0; i < text.length; i += 3) {
    // create a 24-bit number with these 3 octets
    let octetsNum = (text.charCodeAt(i) << 16) + (text.charCodeAt(i + 1) << 8) + text.charCodeAt(i + 2)
    // 77 octal number represent 1111111 in binary
    let sextets = [octetsNum >> 18 & 0o77, octetsNum >> 12 & 0o77, octetsNum >> 6 & 0o77, octetsNum & 0o77]
    // Map sextets to the base64 character
    result += base64Table[sextets[0]] + base64Table[sextets[1]] + base64Table[sextets[2]] + base64Table[sextets[3]]
  }
  return result.substring(0, result.length - padding.length) + padding
}
*/
/*
function base64Decode(text) {
  // Reference: https://en.wikipedia.org/wiki/Base64
  // Remove any character not in the base 64 table + '='
  text = text.replace(new RegExp('[^' + base64Table + '=]', 'g'), '')
  let result = ''
  const remainder = text.length % 4
  let paddingLength = 0
  if (remainder > 0) {
    // if '=' padding is missing, fix it by adding 'A' which equals '0'
    paddingLength = 4 - remainder
    for (let i = remainder; i < 4; i++) {
      text += 'A'
    }
  } else {
    // if '=' padding is there, swap it to 0
    // A = 0
    let padding = text.charAt(text.length - 1) === '=' ? text.charAt(text.length - 2) === '=' ? 'AA' : 'A' : ''
    paddingLength = padding.length
    text = text.substring(0, text.length - paddingLength) + padding
  }
  // 1 base64 char = 1 sextet
  // 1 sextet = 6 bits
  // iterate every 4 base64 chars
  for (let i = 0; i < text.length; i += 4) {
    let sextetsNum = (base64Table.indexOf(text.charAt(i)) << 18) +
        (base64Table.indexOf(text.charAt(i + 1)) << 12) +
        (base64Table.indexOf(text.charAt(i + 2)) << 6) +
        base64Table.indexOf(text.charAt(i + 3))
    // 0xFF = 255 = 1111 1111
    let octets = [sextetsNum >>> 16 & 0xFF, sextetsNum >>> 8 & 0xFF, sextetsNum & 0xFF]
    result += String.fromCharCode(octets[0], octets[1], octets[2])
  }
  return result.substring(0, result.length - paddingLength)
}
*/

/*
function base16Decode(text) {
  // Each octet is represented by two base16 units
  let result = ''
  for (let i = 0; i < text.length; i += 2) {
    let quartetNum = (base16Table.indexOf(text.charAt(i)) << 4) +
        base16Table.indexOf(text.charAt(i + 1))
    let octetNum = quartetNum & 255
    result += String.fromCharCode(octetNum)
  }
  return result
}
*/