/* eslint no-undef: 0 */
require("dotenv").config();
const { sendSingleMail, sendBatchMail } = require("../modifiedCode");

const { toAddress, templateName } = process.env;

const singleConfig = {
  replyToAddress: true,
  toAddress,
  fromAlias: "sociosarbis",
  subject: "a warm greeting",
  htmlBody: "<div>Hello world</div>",
};

const batchConfig = {
  templateName,
  receiversName: toAddress,
};

describe("send email with correct config", () => {
  test("send single email", () => {
    const errorHandler = jest.fn();
    return sendSingleMail(singleConfig)
      .then((data) => expect(data).tohasProperty("EnvId"))
      .catch(errorHandler)
      .then(() => expect(errorHandler).not.toHaveBeenCalled());
  });

  test("send batch email", () => {
    const errorHandler = jest.fn();
    return sendBatchMail(batchConfig)
      .then((data) => expect(data).tohasProperty("EnvId"))
      .catch(errorHandler)
      .then(() => expect(errorHandler).not.toHaveBeenCalled());
  });
});

describe("send emial with wrong config", () => {
  test("config can not pass client valiation", () => {
    const successHandler = jest.fn();
    return sendSingleMail({ ...singleConfig, subject: null })
      .then(successHandler)
      .catch((err) => expect(err).not.tohasProperty("request"))
      .then(() => expect(successHandler).not.toHaveBeenCalled());
  });

  test("config can pass client validation", () => {
    const successHandler = jest.fn();
    return sendSingleMail({ ...singleConfig, accessKeySecret: "wrong accessKeySecret" })
      .then(successHandler)
      .catch((err) => expect(err).tohasProperty("request"))
      .then(() => expect(successHandler).not.toHaveBeenCalled());
  });
});
