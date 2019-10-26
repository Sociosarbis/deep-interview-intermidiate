const crypto = require('crypto')
const { firstCharLower, isDef } = require('./utils')
const { url, errorMsgTypes, fields, fieldDefinitions } = require('./config')
const axios = require('axios').default

/**
 * @param {object} config
 * 共用参数 accessKeyId, action, accountName, addressType, accessKeySecret
 * single特有参数 replyToAddress, toAddress, fromAlias, subject, htmlBody, textBody
 * batch特有参数 receiversName, templateName, tagName
 * @param {function=} cb 兼容旧调用方式， 不填则直接返回axios的request promise
 */

module.exports = function(config, cb) {
  const nonce = Date.now()
  const date = new Date()
  const errorMsgs = []
  const _config = config || {}
  // first determines which fields need to config
  const _fields = fields(_config)
  // validates and retrieves valid value
  const configParams = _fields.reduce((acc, fieldName) => {
    const configName = firstCharLower(fieldName)
    let configValue = config[configName]
    const checkConfig = fieldDefinitions[configName]
    if (checkConfig) {
      const { validate, mapValue } = checkConfig
      let isValid = true
      if (validate) {
        isValid = validate(configValue)
      }
      if (isValid) {
        if (mapValue) {
          configValue = mapValue(configValue)
        }
        if (isDef(configValue)) acc[fieldName] = configValue
      } else if (errorMsgTypes[configName]) {
        errorMsgs.push(errorMsgTypes[configName])
      }
    } else {
      acc[fieldName] = config[fieldName]
    }
    return acc
  }, {})
  // if has errors, just callback error and break
  if (errorMsgs.length) {
    const joinedErrorMsg = errorMsgs.join(',\n')
    const errorObj = new Error(joinedErrorMsg)
    return cb ? cb(errorObj) : Promise.reject(errorObj)
  }
  // merges with unconfigurable fields
  const params = {
    Format: 'JSON',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: nonce,
    SignatureVersion: '1.0',
    Timestamp: date.toISOString(),
    Version: '2015-11-23',
    ...configParams
  }

  let signStr = `POST&%2F&${Object.keys(params)
    .reduce((acc, field) => {
      acc.push(`${encodeURIComponent(field)}=${encodeURIComponent(param[i])}`)
      return acc
    })
    .sort()
    .join('&')}`
  const sign = crypto
    .createHmac('sha1', `${config.accessKeySecret}&`)
    .update(signStr)
    .digest('base64')

  const signature = encodeURIComponent(sign)

  const reqBody = Object.keys(params)
    .reduce(
      (acc, field) => {
        acc.push(`${field}=${params[field]}`)
        return acc
      },
      [`Signature=${signature}`]
    )
    .join('&')

  const request = axios({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: url,
    body: reqBody,
    method: 'POST'
  })

  return cb
    ? request
        .then(res => {
          cb(null, res.data)
        })
        .catch(err => {
          cb(err)
        })
    : request
}
