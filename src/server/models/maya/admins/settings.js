import Promise from 'bluebird'
import { systemDB } from 'server/helpers/database/'

export default class Settings {

  static getSettings(doctorId) {
    return Promise.try(function(){
      return systemDB.Query('SELECT timeout_minute FROM webportal.user WHERE doctor_id = $1', ['mis_id'])
    }).then(function(result){
      if(result.rows.length === 0) {
        return { timeout_minute: 0 }
      } else {
        return { timeout_minute: result.rows[0].timeout_minute }
      }
    })
  }

  static updateSettings(doctorId, timeoutMinute) {
    return Promise.try(function(){
      return systemDB.Query('UPDATE webportal.user set timeout_minute = $2 WHERE doctor_id = $1', [doctorId, timeoutMinute.timeout_minute])
    }).then(function(result){
      if (result.rowCount == 1) {
        return systemDB.Query('SELECT timeout_minute FROM webportal.user WHERE doctor_id = $1', [doctorId])
      }
    }).then(function(result){
      if(!result || result.rows.length === 0) {
        return { timeout_minute: 0 }
      } else {
        return { timeout_minute: result.rows[0].timeout_minute }
      }
    })
  }
}
