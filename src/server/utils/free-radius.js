import nexeRequire from 'server/utils/nexe-require'

const radclient = nexeRequire('radclient')
const { radiusIp: host, radiusPort: port } = global.config

export const RES_CODE_SUCCESS = 'Access-Accept'
export const RES_CODE_FAILED = 'Access-Reject'

const authenticate = (username, password) => (done) => {
  const packet = {
    code: 'Access-Request',
    secret: 'key1',
    identifier: 123,
    attributes: [
      ['User-Name', username],
      ['User-Password', password]
    ],
  }

  const options = {
    host,
    port,
    timeout: 10000,
    retries: 3,
  }

  radclient(packet, options, (err, res) => {
    done(err, res)
  })
}

export default authenticate
