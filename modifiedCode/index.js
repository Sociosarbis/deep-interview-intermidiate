const axios = require("axios").default;
const crypto = require("crypto");
const {
  firstCharLower,
  isDef,
  getValue,
  firstCharUpper,
} = require("./utils");
const {
  url,
  COMMON_CONFIG_FIELDS,
  ACTION_SPECIFIC_FIELDS,
} = require("./config");

require("dotenv").config();

/**
 * @param {object} config
 * 共用参数 accessKeyId, action, accountName, addressType, accessKeySecret
 * single特有参数 replyToAddress, toAddress, fromAlias, subject, htmlBody, textBody
 * batch特有参数 receiversName, templateName, tagName
 */
function combineUserDefaultValue(config) {
  const {
    accessKeyId, accessKeySecret, accountName,
  } = process.env;
  return {
    ...config,
    addressType: getValue(config.addressType, 0),
    accessKeyId: getValue(config.accessKeyId, accessKeyId),
    accessKeySecret: getValue(config.accessKeySecret, accessKeySecret),
    accountName: getValue(config.accountName, accountName),
  };
}

function collectErrorMsgs(requiredFields, config) {
  return requiredFields.reduce((acc, fieldName) => {
    const configName = firstCharLower(fieldName);
    if (!isDef(config[configName])) acc.push(`${configName} required`);
    return acc;
  }, []);
}


function getFixedParams() {
  const nonce = Date.now();
  const date = new Date();
  return {
    Format: "JSON",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: nonce,
    SignatureVersion: "1.0",
    Timestamp: date.toISOString(),
    Version: "2015-11-23",
  };
}

function createParamStr(params) {
  return `${Object.keys(params)
    .filter((field) => isDef(params[field]))
    .reduce((acc, field) => {
      acc.push(`${encodeURIComponent(field)}=${encodeURIComponent(params[field])}`);
      return acc;
    })
    .sort()
    .join("&")}`;
}

function createSignature(signStr, accessKeySecret) {
  return encodeURIComponent(crypto
    .createHmac("sha1", `${accessKeySecret}&`)
    .update(signStr)
    .digest("base64"));
}

function sendEmail(config) {
  const configParams = { ...config };
  configParams.action = `${firstCharUpper(configParams.action)}SendMail`;
  // merges with unconfigurable fields
  const params = {
    ...getFixedParams(),
    ...configParams,
  };

  const paramStr = createParamStr(params);

  const signStr = `POST&%2F&${paramStr}`;

  const signature = createSignature(signStr, config.accessKeySecret);

  const reqBody = `Signature=${signature}&${paramStr}`;

  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    uri: url,
    data: reqBody,
    method: "POST",
  });
}

function sendSingleMail(_config = {}) {
  const config = combineUserDefaultValue(_config);
  config.action = "batch";
  const fields = COMMON_CONFIG_FIELDS.concat(ACTION_SPECIFIC_FIELDS.single);
  const errorMsgs = collectErrorMsgs(fields, config);
  if (errorMsgs.length) {
    return Promise.reject(new Error(errorMsgs.join(",\n")));
  }
  return sendEmail(config);
}

function sendBatchMail(_config = {}) {
  const config = combineUserDefaultValue(_config);
  config.action = "batch";
  const fields = COMMON_CONFIG_FIELDS.concat(ACTION_SPECIFIC_FIELDS.batch);
  // validates and retrieves valid value
  const errorMsgs = collectErrorMsgs(fields, config);
  if (errorMsgs.length) {
    return Promise.reject(new Error(errorMsgs.join(",\n")));
  }
  return sendEmail(config);
}

module.exports = {
  sendSingleMail,
  sendBatchMail,
};
