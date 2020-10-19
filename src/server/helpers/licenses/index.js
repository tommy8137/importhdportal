import fs from 'fs'
import moment from 'moment'
import crypto from 'crypto'
import licenseEntries, { validLicenseInfo } from './license-entries'
import R from 'ramda'
import key from './get-key'

const { licenseFilePath } = global.config

const notTestEnv = R.always(process.env.NODE_ENV != 'test')
const licenseInfo = R.ifElse(
  notTestEnv,
  R.always({}),
  R.always(validLicenseInfo)
)()

const readFile = (filePath) => fs.readFileSync(filePath, 'utf8')

const parseLicense = R.propOr({}, 'license')

const isVaildLicense = R.compose(
  diffs => diffs.length == 0,
  R.difference(licenseEntries),
  license => Object.keys(license)
)

function decrypt(content) {
  try {
    const decipher = crypto.createDecipher('aes-128-ecb', key)
    const chunks = []
    chunks.push(decipher.update(content, 'base64', 'utf8'))
    chunks.push(decipher.final('utf8'))
    const decrypted = JSON.parse(chunks.join(''))
    if (!isVaildLicense(decrypted.license)) {
      throw Error('Invalid License')
    }
    return decrypted
  } catch(err) {
    throw Error('License cannot be decrypted: ' + err.message)
  }
}

function encrypt(content) {
  const cipher = crypto.createCipher('aes-128-ecb', key)
  let encrypted = cipher.update(content, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}


const getFileContent = R.tryCatch(
  R.compose(decrypt, readFile),
  R.always({})
)

const getLicense = () => R.propOr({}, 'license', licenseInfo)

const writeLicenseToFile = R.ifElse(
  notTestEnv,
  ({ encrypted, decrypted }) => {
    fs.writeFileSync(licenseFilePath, encrypted, 'utf8')
    return decrypted
  },
  ({ encrypted, decrypted }) => decrypted
)

// licenseInfo object
const updateLicenseInfo = R.ifElse(
  R.propSatisfies(x => !!x, 'license'),
  (content) => {
    licenseInfo.license = content.license
    return true
  },
  R.F
)

const validEncryptedContent = (encrypted) => {
  const decrypted = decrypt(encrypted)
  return { encrypted, decrypted }
}

// update the license file
const updateLicense = R.compose(
  updateLicenseInfo,
  writeLicenseToFile,
  validEncryptedContent
)

const isLicenseNotExpired = (activeTime, duration) => moment().diff(moment(activeTime).add(Number(duration), 'days')) <= 0

const handleCheckLicenseError = R.compose(
  R.F,
  (err) => console.error(`checkLicense() failed: ${err.message}`)
)

const checkLicense = () => R.compose(
  R.tryCatch(R.apply(isLicenseNotExpired), handleCheckLicenseError),
  R.props(['activeTime', 'duration']),
  R.propOr({ activeTime: new Date().toISOString(), duration: -1 }, 'license'),
)(licenseInfo)

const importLicenseFile = R.compose(
  R.ifElse(updateLicenseInfo, R.T, () => console.log('Invalid license during server startup')),
  getFileContent,
)

// startup
const boostrapLicense = R.ifElse(
  notTestEnv,
  importLicenseFile,
  R.F
)

boostrapLicense(licenseFilePath)


export default {
  encrypt,
  decrypt,
  checkLicense,
  updateLicense,
  getLicense,
}
