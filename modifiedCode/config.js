const COMMON_CONFIG_FIELDS = [
  "AccessKeyId",
  "Action",
  "AccountName",
  "AddressType",
];

const COMMON_REQUIRED_LIST = ["accessKeyId", "accessKeySecret", "accountName"];
const SINGLE_REQUIRED_LIST = COMMON_REQUIRED_LIST.concat(["subject", "toAddress"]);
const BATCH_REQUIRED_LIST = COMMON_CONFIG_FIELDS.concat(["templateName", "receiversName"]);

module.exports = {
  url: "https://dm.aliyuncs.com/",
  SINGLE_REQUIRED_LIST,
  BATCH_REQUIRED_LIST,
};
