const maya = require('./maya')

module.exports = {
  system: {
    provider: 'postgres',
    ip: process.env.systemdbip,
    port: process.env.systemdbport,
    db: process.env.systemdbdatabase,
    user: process.env.systemdbname,
    pw: process.env.systemdbpw,
    idleTimeoutMillis: 30000,
  },

  hospital: maya.db,
}
