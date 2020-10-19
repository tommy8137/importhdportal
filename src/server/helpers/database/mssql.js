import nexeRequire from 'server/utils/nexe-require'
import pool from './mssql-pool'
const mssql = nexeRequire('mssql')
const MSsql = (dbconfig) => {
  const config = {
    user: dbconfig.user,
    database: dbconfig.db,
    password: dbconfig.pw,
    server: dbconfig.ip,
    port: dbconfig.port,
    pool: {
      max: dbconfig.poolMax || 9,
      min: 0,
      idleTimeoutMillis: dbconfig.idleTimeoutMillis,
    },
    requestTimeout : dbconfig.requestTimeout || 15000,
  }

  return {
    Query: (sql, params) => {
      return new Promise((resolve, reject) => {
        pool(config).then((conn) => {
          const request = new mssql.Request(conn)
          if (params) {
            Object.keys(params).forEach((key) => {
              request.input(key, params[key])
            })
          }
          request.query(sql).then((result) => {
            resolve({ rows: result })
          }).catch((err) => {
            console.error(`err = ${err}, sql = ${sql}, params = ${JSON.stringify(params)}`)
            reject({ message: 'error running query', error: err })
          })
        }).catch((err) => {
          reject(err)
        })
      })
    },
  }
}

export default MSsql
