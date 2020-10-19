import nexeRequire from 'server/utils/nexe-require'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

const pg = nexeRequire('pg')
export default class Postgres {
  static Query(pool, sql, params) {
    try{
      return new Promise((resolve, reject) => {
        pg.defaults.parseInt8 = true
        pool.connect(function(err, client, done) {
          if (err) {
            reject({ message: 'could not connect to postgres' , code: errorCode.DB_CONNECT_ERROR })
          }
          if(client == null) {
            new Error('property query null')
          } else {
            client.query(sql, params, function(err, result) {
              done()
              if (err) {
                reject({ message: 'error running query' , code: errorCode.DB_QUERY_ERROR })
              }
              resolve(result)
            })
          }
        })
      })
    } catch (e) {
      throwApiError('DB_ERROR', errorCode.DB_ERROR )
    }
  }
}
