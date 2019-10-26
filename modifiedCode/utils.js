function isDef(obj) {
  return !(typeof obj === "undefined" || obj === null);
}

function isStr(value) {
  return typeof value === "string";
}

function isEmptyStr(value) {
  return value === "";
}

function isNum(value) {
  return !isNaN(value) && !isEmptyStr(value);
}

function firstCharLower(str) {
  return str.replace(/^./, (m) => m.toLowerCase());
}

function firstCharUpper(str) {
  return str.replace(/^./, (m) => m.toUpperCase());
}

function getValue(value, defaultValue, criteria = isDef) {
  return criteria(value) ? value : defaultValue;
}

function identity(value) {
  return value;
}

module.exports = {
  isDef,
  isNum,
  isStr,
  firstCharLower,
  firstCharUpper,
  getValue,
  identity,
};
