const path = require('path')
const fs = require('fs')

global.__UNIVERSAL__ = false
global.__CLIENT__ = false
global.__DEV__ = false
global.TestServer = require('./fetch-test-server.js')
global.ROOT = process.env.ROOT || path.join(__dirname, '../../')
global.config = require('../../src/config/')
global.mayaAuth = require('./fetch-maya-token.js')
global.maxblood_upper = 140
global.maxblood_lower = 100
global.config.maxblood_upper_tuning = {
  value: 30,
  unit: 'mmhg',
}
global.config.maxblood_middle_tuning = {
  value: 15,
  unit: '%',
}
global.config.maxblood_lower_tuning = {
  value: 10,
  unit: '%',
}
