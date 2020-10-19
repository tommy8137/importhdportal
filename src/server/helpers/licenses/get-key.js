const execSync = require('child_process').execSync
const os = require('os')
const crypto = require('crypto')
let command
if(/^win/.test(os.platform())) {
  command = 'wmic csproduct get UUID'
} else if (/^darwin/.test(os.platform())) {
  command = 'ioreg -rd1 -c IOPlatformExpertDevice | awk "/IOPlatformUUID/"'
} else {
  command = 'dmidecode | grep -i uuid'
}
const uuidRule = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const uuid = process.env.NODE_ENV != 'test'
  ? uuidRule.exec(String(execSync(command)))[0]
  : 'test-uuid'
export default crypto.createHash('md5').update(uuid).digest('hex')
