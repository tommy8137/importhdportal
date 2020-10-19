import Postgres from './postgres'
import MSsql from './mssql'

const { system, hospital } = global.config.db

export const systemDB = Postgres(system)
export const hospitalDB = MSsql(hospital)
