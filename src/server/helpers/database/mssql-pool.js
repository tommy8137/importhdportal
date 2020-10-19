import nexeRequire from 'server/utils/nexe-require'

const mssql = nexeRequire('mssql')
let pool

function getConnection(connOptions) {
  if (pool) {
    return pool
  }

  return pool = new Promise((resolve, reject) => {
    const connection = new mssql.Connection(connOptions, (err) => {
      if (err) {
        pool = null
        return reject(err)
      }

      return resolve(connection)
    })
  })
}

export default getConnection
