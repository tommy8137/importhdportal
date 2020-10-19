const path = require('path')
const readFileSync = require('./tools/read-file-sync')
import { nexePath } from '../common/nexe-path'

const ROOT = global.__ROOT__ || path.join(__dirname, '../..')
// auth Key used for maya request an access token.
const authPublicKey = readFileSync(nexePath.convert(path.join(ROOT, 'keys/maya_auth_key_rsa.pub')), { encoding: 'utf-8' })
// access Key used for access resource.
const accessPrivateKey = readFileSync(nexePath.convert(path.join(ROOT, 'keys/maya_access_key_rsa')), { encoding: 'utf-8' })
const accessPublicKey = readFileSync(nexePath.convert(path.join(ROOT, 'keys/maya_access_key_rsa.pub')), { encoding: 'utf-8' })

module.exports = {
  authPublicKey,
  accessPrivateKey,
  accessPublicKey,

  develop: /development/i.test(process.env.NODE_ENV),
  mayaSystemIP: process.env.mayasystemip,
  mayaSystemPORT: process.env.mayasystemport,
  mayaSystemPROTOCOL: process.env.mayasystemprotocol,
  db: {
    provider: 'mssql',
    pw: process.env.mayadbpw,
    ip: process.env.mayadbip,
    port: process.env.mayadbport,
    db: process.env.mayadbdatabase,
    user: process.env.mayadbname,
    idleTimeoutMillis: 30000,
  },
}
