function isDef(obj) {
  return !(obj === undefined || obj === null)
}

function isStr(value) {
  return typeof value === 'string'
}

function isEmptyStr(value) {
  return value === ''
}

function isNum(value) {
  return !isNaN(value) && !isEmptyStr(value)
}

function firstCharLower(str) {
  return str.replace(/^./, (m) => m.toLowerCase())
}

function firstCharUpper(str) {
  return str.replace(/^./, (m) => m.toUpperCase())
}

module.exports = {
  isDef,
  isNum,
  isStr,
  firstCharLower,
  firstCharUpper
}
