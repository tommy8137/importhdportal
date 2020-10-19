import Promise from 'bluebird'
import moment from 'moment'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { systemDB } from 'server/helpers/database/'

export default class ThresholdSetting {

  static getThresholdSettings() {
    return Promise.try(function(){
      return systemDB.Query('SELECT status, max_threshold, min_threshold, create_user, create_date FROM webportal.threshold_status order by create_date DESC limit 1;', [])
    }).then(function(result){
      if(result.rows.length === 0) {
        throwApiError('get about DB err', errorCode.INTERNAL_ERROR)
      } else {
        return { status: result.rows[0].status, max_threshold: result.rows[0].max_threshold, min_threshold: result.rows[0].min_threshold }
      }
    })
  }

  static updateThresholdSettings(status, max_threshold, min_threshold, doctorId) {
    return Promise.try(function(){
      let create_date = moment(Date.now().valueOf()).format('YYYY/MM/DD HH:mm:ss')
      return systemDB.Query(`INSERT INTO webportal.threshold_status 
      ( status, max_threshold, min_threshold, create_user, create_date) 
      VALUES ($1, $2, $3, $4, $5);`, [status, max_threshold, min_threshold, doctorId, create_date])
    }).then(function(result){
      if (result.rowCount == 1) {
        return systemDB.Query('SELECT status, max_threshold, min_threshold FROM webportal.threshold_status order by create_date DESC limit 1;', [])
      }
    }).then(function(result){
      if(result.rows.length === 0) {
        throwApiError('get about DB err', errorCode.INTERNAL_ERROR)
      } else {
        return systemDB.Query('SELECT status, max_threshold, min_threshold FROM webportal.threshold_status order by create_date DESC limit 1;', [])
      }
    })
  }
}
