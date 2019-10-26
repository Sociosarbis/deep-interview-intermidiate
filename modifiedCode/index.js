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
  BATCH_REQUIRED_LIST,
  SINGLE_REQUIRED_LIST,
} = require("./config");

require("dotenv").config();

/**
 * @param {object} config
 * 其中config.accessKeySecret作加密用
 * 共用参数 accessKeyId, action, accountName, addressType
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
  return new Promise((res, rej) => {
    const errorMsgs = requiredFields.reduce((acc, fieldName) => {
      const configName = firstCharLower(fieldName);
      if (!isDef(config[configName])) {
        acc.push(`${configName} required`);
      }
      return acc;
    }, []);
    return errorMsgs.length ? rej(new Error(errorMsgs.join(",\n"))) : res(config);
  });
}


function getFixedParams() {
  const nonce = Date.now();
  const date = new Date();
  return {
    Format: "JSON",
    RegionID: "cn-hangzhou",
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
      acc.push(`${encodeURIComponent(firstCharUpper(field))}=${encodeURIComponent(params[field])}`);
      return acc;
    }, [])
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
  // merges with unconfigurable fields
  const params = {
    ...getFixedParams(),
    ...config,
  };

  const paramStr = createParamStr(params);

  const signStr = `POST&%2F&${encodeURIComponent(paramStr)}`;

  const signature = createSignature(signStr, config.accessKeySecret);

  const reqBody = `Signature=${signature}&${paramStr}`;

  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    url,
    data: reqBody,
    method: "POST",
  });
}

function sendSingleMail(_config = {}) {
  const config = combineUserDefaultValue(_config);
  config.action = "SingleSendMail";
  return collectErrorMsgs(SINGLE_REQUIRED_LIST, config)
    .then((validatedConfig) => sendEmail(validatedConfig));
}

function sendBatchMail(_config = {}) {
  const config = combineUserDefaultValue(_config);
  config.action = "BatchSendMail";
  // validates and retrieves valid value
  return collectErrorMsgs(BATCH_REQUIRED_LIST, config)
    .then((validatedConfig) => sendEmail(validatedConfig));
}

module.exports = {
  sendSingleMail,
  sendBatchMail,
};
