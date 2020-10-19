const path = require('path')
const os = require('os')
const fs = require('fs')
const spdy = require('spdy')
const R = require('ramda')

const getRoot = R.cond([
  [(nexe, _) => nexe === 'y', R.always('./')],
  [(_, root) => !R.isNil(root), (_, root) => root],
  [R.T, R.always(path.join(__dirname, '../../'))],
])

const ROOT = global.__ROOT__ = getRoot(process.env.nexe, process.env.ROOT)
global.config = require('../config')
global.__CLIENT__ = false
global.__LICENSE__ = false
global.__DEV__ = /development/i.test(process.env.NODE_ENV)
global.__HOST__ = global.config.host
global.__PORT__ = global.config.port
global.__API_VERSION__ = global.config.apiVersion
global.__UNIVERSAL__ = global.config.universal
global.require = global.require ? global.require : require
global.maxblood_upper = global.config.maxblood_upper
global.maxblood_lower = global.config.maxblood_lower
global.config.maxblood_upper_tuning = {
  value:  global.config.maxblood_upper_tuning_value,
  unit:   global.config.maxblood_upper_tuning_unit,
}
global.config.maxblood_middle_tuning = {
  value:  global.config.maxblood_middle_tuning_value,
  unit:   global.config.maxblood_middle_tuning_unit,
}
global.config.maxblood_lower_tuning = {
  value:  global.config.maxblood_lower_tuning_value,
  unit:   global.config.maxblood_lower_tuning_unit,
}

if (!global.config.radiusIp || !global.config.radiusPort) {
  throw 'radius ip or radius port should be assigned'
}

//backgroundPic config
global.backgroundPic = global.config.backgroundPic
// check if the license is valid
// it will be very slow to rebuild codes if checkLicense is wrapped in deasync
// currently removing deasync

//FIXME workaround ava server test failed
var app = module.exports = require('./server')
if (!module.parent) {
  // schedule jobs should not be performed in the test environment..
  // var job = module.exports = require('./cron')
  var risk = module.exports = require('./risk').default

  risk.init()

  var options = {
    key: fs.readFileSync(ROOT + '/keys/domain.key'),
    cert: fs.readFileSync(ROOT + '/keys/domain.crt'),
  }

  var server = spdy.createServer(options, app.callback()).listen(
    global.config.port, () => {
      var host = server.address().address
      var port = server.address().port
      console.log('Server listening at http://%s:%s', host, port)
    }
  )
}
