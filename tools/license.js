global.config = require('../src/config')
const deasync = require('deasync')
const AboutModel = require('server/models/v1alpha/admins/about')

const Cipher = require('cipher').default
const { keyPath, licenseFilePath } = global.config
const pwd = {
  licensePwd: global.config.licensePwd,
  licenseHmacPwd: global.config.licenseHmacPwd,
}
const crypt = new Cipher(pwd)

const generateKey = deasync(function(callback) {
  const licenseKey = {
    license_key: crypt.encrypt(
      JSON.stringify({
        start_date: '2011-05-26T07:56:00.123Z',
        end_date: '2021-05-26T07:56:00.123Z',
        version: 'vvv',
      })
    )
  }
  AboutModel.updateLicenses(licenseKey).then(() => callback(null))
})

generateKey()
