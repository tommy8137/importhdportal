import nexeRequire from 'server/utils/nexe-require'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import R from 'ramda'

const pg = nexeRequire('pg')
const Postgres = (dbconfig) => {
  const pool = new pg.Pool({
    user: dbconfig.user, // env var: PGUSER
    database: dbconfig.db, // env var: PGDATABASE
    password: dbconfig.pw, // env var: PGPASSWORD
    host: dbconfig.ip, // Server hosting the postgres database
    port: dbconfig.port, // env var: PGPORT
    idleTimeoutMillis: dbconfig.idleTimeoutMillis, // how long a client is allowed to remain idle before being closed
  })

  return {
    Query: (sql, params) => {
      try {
        return new Promise((resolve, reject) => {
          pg.defaults.parseInt8 = true
          pool.connect(function(err, client, done) {
            if (err) {
              console.log(`error === ${err}`)
              reject({ message: 'could not connect to postgres', code: errorCode.DB_CONNECT_ERROR })
            }
            if(client == null || typeof client.query != 'function') {
              new Error('property query null')
            } else {
              client.query(sql, params, function(err, result) {
                done()
                if (err) {
                  console.log(`error === ${err}`)
                  reject({ message: 'error running query', code: errorCode.DB_QUERY_ERROR })
                }
                resolve(result)
              })
            }
          })
        })
      } catch (e) {
        console.log(`error === ${e}`)
        throwApiError('DB_ERROR', errorCode.DB_ERROR )
      }
    },
  }
}

export const batchQuery = function* (queryFunction, listPara, splitSize) {
  const batchList = R.splitEvery(splitSize, listPara)
  const result =  { rows : [] }
  for (let list of batchList) {
    const tmp = yield queryFunction(list)
    result.rows = result.rows.concat(tmp.rows)
  }
  return result
}

export default Postgres
