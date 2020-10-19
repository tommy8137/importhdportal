import path  from 'path'
import readFileSync from './tools/read-file-sync'
import { nexePath } from '../common/nexe-path'

const privateKey = readFileSync(nexePath.convert(path.join(__dirname, '../../', 'keys/key_rsa')))
const publicKey = readFileSync(nexePath.convert(path.join(__dirname, '../../', 'keys/key_rsa.pub')))
// todo: refresh token key should be imported like the way private/public keys imported
const refreshTokenKey = `1G8G=9.kXUD!P89J:5C35iF6dLE8~5""6a0EKP2sMq7M0|9GRZ6y{7'El/eViUy`
const licenseFilePath = nexePath.convert(path.join(__dirname, '../../keys', 'license.key'))
const keyPath =  nexePath.convert(path.join(__dirname, '../../', '.secret'))
const logFolder = nexePath.convert(path.join(__dirname, '../../',  process.env.logfolder || './logs/'))
const reportPDFPath = nexePath.convert(path.join(__dirname, '../../src/server/models/maya/effective', 'report.pdf'))
const pngPath = nexePath.convert(path.join(__dirname, '../../src/server/models/maya/effective'))
let reportPngPath = process.env.NODE_ENV == 'production' ? 'project/src/server/models/maya/effective' : pngPath

const requireDir = () => {
  let include = {}
  // fs.readdirSync(__dirname + '/').forEach(function(file) {
  //   if (file.match(/\.js$/) !== null && file !== 'index.js') {
  //     let name = file.replace('.js', '')
  //     include[name] = require(`./${name}`)
  //   }
  // })
  // is use parameter of require, nexe would think this is the native lib/file or exclude lib/file
  include['db'] = require('./db')
  include['maya'] = require('./maya')
  return include
}

/**
 * default server setting
 */
module.exports = {
  host: process.env.host || 'localhost',
  port: process.env.port || 8808,
  assets: process.env.backgroundpic == 'ECK' ? 'assets_ECK' : 'assets_default',
  privateKey,
  publicKey,
  refreshTokenKey,
  universal: process.env.universal ? process.env.universal == 'true' : true,
  radiusIp: process.env.radiusip,
  radiusPort: process.env.radiusport,
  logFolder,
  apiServer: process.env.apiServer || 'http://210.200.13.224:10080',
  apiVersion: 'maya', // needs to restart dev server if this value changed during development, i.e. shutdown npm run dev and re-run this command.
  spIp: process.env.spip || '192.168.101.93',
  spPort: process.env.spport || '3000',
  pgIp: process.env.pgip || '192.168.101.93',
  pgPort: process.env.pgport || '5432',
  pgDb: process.env.pgdb || 'wiprognosis',
  pgName: process.env.pgname || 'wiprognosis',
  pgPw: process.env.pgpw || 'mysecretpassword',
  asyncRendering: /test/i.test(process.env.NODE_ENV) ? false : process.env.asyncrendering != 'false', // NODE_ENV === test => dont use service
  svIp: process.env.svip || '192.168.101.93',
  svPort: process.env.svport || '22357',
  keyPath: keyPath,
  licenseFilePath,
  mmhIp: '210.200.13.224',
  mmhPort: '15432',
  mmhDB: 'datauser',
  mmhUser: 'postgres',
  mmhPw: 'wiprognosispassword',
  autoLogout: false,
  nexe : process.env.nexe,
  maxblood_upper : process.env.maxblood_upper || 140,
  maxblood_lower : process.env.maxblood_lower || 100,
  maxblood_upper_tuning_value : process.env.maxblood_upper_tuning_value || 30,
  maxblood_upper_tuning_unit: process.env.maxblood_upper_tuning_unit|| 'mmhg',
  maxblood_middle_tuning_value : process.env.maxblood_middle_tuning_value || 15,
  maxblood_middle_tuning_unit : process.env.maxblood_middle_tuning_unit || '%',
  maxblood_lower_tuning_value : process.env.maxblood_lower_tuning_value || 10,
  maxblood_lower_tuning_unit : process.env.maxblood_lower_tuning_unit || '%',
  conductivity_threshold: process.env.conductivity_threshold || 0.2,
  dialysate_temp_threshold: process.env.dialysate_temp_threshold || -0.5,
  urf_threshold: process.env.urf_threshold || -0.2,
  blood_flow_threshold: process.env.blood_flow_threshold || -30,
  systemimportdate: process.env.systemimportdate || '2017-12-18',
  notesformat: process.env.notesformat || 'dart',
  reportPDFPath,
  reportPngPath,
  backgroundPic : process.env.backgroundpic || 'default',
  ...requireDir(),
}
