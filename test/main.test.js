require('dotenv').config()
const sendEmail = require('../modifiedCode')
const { errorTypes } = require('../modifiedCode/config')

const { accessKeyId, accountName, toAddress, accessKeySecret } = process.env

const config = {
  accessKeyId,
  action: 'single',
  accountName,
  accessKeySecret,
  addressType: 1,
  replyToAddress: true,
  toAddress,
  fromAlias: 'sociosarbis',
  subject: 'a warm greeting',
  htmlBody: '<div>Hello world</div>'
}
describe('send email with correct config', () => {
  describe('send single email', () => {
    test('with promise style', () => {
      const errorHandler = jest.fn()
      return sendEmail(config)
        .then(data => expect(data).tohasProperty('EnvId'))
        .reject(errorHandler)
        .then(() => expect(errorHandler).not.toHaveBeenCalled())
    })

    test('with callback style', done => {
      function callback(err, data) {
        expect(err).tobeFalsy()
        expect(data).tohasProperty('EnvId')
        done()
      }
      return sendEmail(config, callback)
    })
  })

  /*test('send batch email', () => {
    const errorHandler = jest.fn()
    return sendEmail(Object.assign({}, config, { action: 'bactch' }))
      .then(data => expect(data).tohasProperty('EnvId'))
      .reject(errorHandler)
      .then(() => expect(errorHandler).not.toHaveBeenCalled())
  })*/
})

describe('send emial with wrong config', () => {
  test('config can not pass client valiation', () => {
    const successHandler = jest.fn()
    return sendEmail(Object.assign({}, config, { accessKeySecret: undefined }))
      .then(successHandler)
      .catch(err =>
        expect(err).toEqual(
          expect.objectContaining({
            message: expect.stringMatching(errorTypes[accessKeySecret])
          })
        )
      )
      .then(() => expect(successHandler).not.toHaveBeenCalled())
  })

  test('config can pass client validation', () => {
    const successHandler = jest.fn()
    return sendEmail(Object.assign({}, config, { accessKeySecret: 'wrong accessKeySecret' }))
      .then(successHandler)
      .catch(err => expect(err).tohasProperty('request'))
      .then(() => expect(successHandler).not.toHaveBeenCalled())
  })
})
