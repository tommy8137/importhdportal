import nexeRequire from 'server/utils/nexe-require'
const zmq = nexeRequire('zmq')
const config = require('../../config')

if (!config) {
  throw 'config file is not existed.'
} else if (!config.svIp || !config.svPort) {
  throw 'ip or port is not defined.'
}

const serviceAddr  = `tcp://${config.svIp}:${config.svPort}`

function makeASocket(sockType, addr, bindSyncOrConnect, identity = process.pid) {
  var sock = zmq.socket(sockType)
  sock.identity = identity
  sock.monitor(500, 0)
  // call the function name in bindSyncOrConnect
  sock[bindSyncOrConnect](addr)
  return sock
}

module.exports = {
  serviceAddr,
  makeASocket,
}
