import Promise from 'bluebird'
import moment from 'moment'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { systemDB, hospitalDB } from 'server/helpers/database/'

export default class PersonalThresholdModel {

  static* getPersonalThreshold(r_id) {
    let systemResult = yield systemDB.Query('SELECT status, max_threshold, min_threshold, create_user, create_date FROM webportal.threshold_status order by create_date DESC limit 1;', [])
    if(systemResult.rows.length === 0) {
      throwApiError('get about DB err', errorCode.INTERNAL_ERROR)
    } else {
      // check is editable
      let editable = '1'
      let today = moment(Date.now().valueOf()).format('YYYY-MM-DD')
      let attended = yield hospitalDB.Query(
        `SELECT hdrec_id, hd_date , HD_STATUS
         FROM vi_TYHD_PAT_HD_MASTER 
         WHERE HD_DATE = @today
          AND HD_STATUS = @hdStatus
          AND hdrec_id = @r_id`
        ,
        { today, hdStatus: '透析中', r_id })
      attended = attended.rows
      if (attended.length <= 0) {
        editable = '0'
      }
      let personalSetting = yield systemDB.Query( `SELECT hemno, threshold, create_user, create_date 
         FROM webportal.hemno_threshold 
         where hemno = $1 order by create_date DESC limit 1;`
         , [r_id])
      if(personalSetting.rows.length === 0) {
        return { status: systemResult.rows[0].status, personal_threshold: 999, editable, max_threshold: systemResult.rows[0].max_threshold, min_threshold: systemResult.rows[0].min_threshold }
      } else {
        return { status: systemResult.rows[0].status, personal_threshold: personalSetting.rows[0].threshold, editable, max_threshold: systemResult.rows[0].max_threshold, min_threshold: systemResult.rows[0].min_threshold }
      }
    }
  }

  static* setPersonalThreshold(r_id, setting_threshold, doctorId) {
    let systemResult = yield systemDB.Query('SELECT status, max_threshold, min_threshold, create_user, create_date FROM webportal.threshold_status order by create_date DESC limit 1;', [])
    if(systemResult.rows.length === 0) {
      throwApiError('get about DB err', errorCode.INTERNAL_ERROR)
    } else {
      // check is editable
      let editable = '1'
      let today = moment(Date.now().valueOf()).format('YYYY-MM-DD')
      let attended = yield hospitalDB.Query(
        `SELECT hdrec_id, hd_date , HD_STATUS
         FROM vi_TYHD_PAT_HD_MASTER 
         WHERE HD_DATE = @today
          AND HD_STATUS = @hdStatus
          AND hdrec_id = @r_id`
        ,
        { today, hdStatus: '透析中', r_id })
      attended = attended.rows
      if (attended.length <= 0) {
        editable = '0'
      }
      if (editable === '1' && systemResult.rows[0].status === '1'){
          // check personal_threshold is between max_threshold and min_threshold
        if (systemResult.rows[0].max_threshold < setting_threshold || systemResult.rows[0].min_threshold > setting_threshold){
          throwApiError('modify personal_threshold column data error', errorCode.REQUEST_FORMAT_ERROR)
        }

        let create_date = moment(Date.now().valueOf()).format('YYYY/MM/DD HH:mm:ss')
        let setThreshold = yield systemDB.Query(`INSERT INTO webportal.hemno_threshold 
          ( hemno, threshold, create_user, create_date) 
          VALUES ($1, $2, $3, $4);`, [r_id, setting_threshold, doctorId, create_date])
        if (setThreshold.rowCount == 1) {
          let personalSetting = yield systemDB.Query( `SELECT hemno, threshold, create_user, create_date 
            FROM webportal.hemno_threshold 
            where hemno = $1 order by create_date DESC limit 1;`
            , [r_id])
          if(personalSetting.rows.length === 0) {
            return { status: systemResult.rows[0].status, personal_threshold: 999, editable, max_threshold: systemResult.rows[0].max_threshold, min_threshold: systemResult.rows[0].min_threshold }
          } else {
            return { status: systemResult.rows[0].status, personal_threshold: personalSetting.rows[0].threshold, editable, max_threshold: systemResult.rows[0].max_threshold, min_threshold: systemResult.rows[0].min_threshold }
          }
        }
      } else {
        throwApiError('can\'t set alarm threshold, syetem alarm threshold should be opened and patient is on Hemodialysis', errorCode.STATUS_ERROR)
      }
    }
  }
}