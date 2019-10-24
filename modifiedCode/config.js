const { isDef, isStr } = require('./utils')

const COMMON_CONFIG_FIELDS = [
  'AccessKeyId',
  'Action',
  'Format',
  'AccountName',
  'AddressType'
]

const ACTION_SPECIFIC_FIELDS = {
  single: ['ReplyToAddress', 'ToAddress'],
  batch: ['ReceiversName', 'TemplateName']
}

const ALLOW_ACTIONS = [
  'single',
  'batch'
]

const ALLOW_ADDRESS_TYPES = [0, 1]

module.exports = {
  url: 'https://dm.aliyuncs.com/',
  errorMsgTypes: {
    accessKeyID: 'accessKeyID required',
    accessKeySecret: 'accessKeySecret required',
    accountName: 'accountName required',
    action: 'error action',
    templateName: 'templateName required',
    receiversName: 'receiversName required'
  },
  // pass config in
  fields(config) {
    return COMMON_CONFIG_FIELDS.concat(ACTION_SPECIFIC_FIELDS[config.action])
  },
  fieldDefinitions: {
    accountName: {
      validate: isStr,
    },
    accessKeyID: {
      validate: isStr
    },
    accessKeySecret: {
      validate: isDef
    },
    accountName: {
      validate: isStr
    },
    action: {
      validate: (value) => ALLOW_ACTIONS.indexOf(value) !== -1
    },
    templateName: {
      validate: isStr
    },
    addressType: {
      mapValue: (value) => ALLOW_ADDRESS_TYPES.indexOf(parseFloat(value)) === -1 ? 0 : value
    }
  }
}
