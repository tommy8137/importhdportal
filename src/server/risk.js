import schedule from 'node-schedule'
import moment from 'moment'
import { getItems, postSelectVip, getDialysisYear, isLowerObserveThreshold } from 'server/models/maya/searches/records'
import { convertDiseases } from 'server/models/maya/searches/patients'
import Risks from 'server/models/maya/risks/risks'
import Overview from 'server/models/maya/searches/overviews'
import Protos from 'common/protos'
import co from 'co'
import { systemDB, hospitalDB } from 'server/helpers/database'
import { isValidate as validate } from 'common/modules/sbp/validator'
import MayaAlarmSystem from './models/maya/alarm-system'
import R from 'ramda'

export const ALARM_STATUS_TALBE = {
  NO_DATA: -9527,
  NOT_PROCESSED_YET: 0,
  KEEP_OBSERVE: 1,
  PROCESSED: 2,
  NO_RISK: -1,
  NO_ALARM_MESSAGE: -2,
}
// 0000781407

// execute every 5 Minutes
const rule = '*/5 * * * *'
// schedule the job
export default class Risk {
  // terrible for unit test.....
  static task() {
    let spyThis = this && this.models ? this : {}
    spyThis.processSystemRisk = spyThis.models && spyThis.models.processSystemRisk || Risk.processSystemRisk
    spyThis.processMayaAlarmSystem = spyThis.models && spyThis.models.processMayaAlarmSystem || MayaAlarmSystem.processMayaAlarmSystem

    if (this && this.env == 'importtest') {
      return
    }
    co(function *() {
      const patientsRiskData = yield spyThis.processSystemRisk()
      const result = yield spyThis.processMayaAlarmSystem()
      return result
    }).catch(function(err) {
      console.error(err.message)
    })
  }

  static init() {
    schedule.scheduleJob('risk_module', rule, Risk.task)
  }

  // because this function execute in schedule task,so 'this' always is null, use 'this' for easly test coverage
  static* processSystemRisk() {
    let today = moment().format('YYYY-MM-DD')
    let insertData = []
    let patientsRiskData = []
    let spyThis = this && this.models ? this : {}
    spyThis.hospitalDB = spyThis.models && spyThis.models.hospitalDB ? spyThis.models.hospitalDB :  hospitalDB
    spyThis.getCharts = spyThis.models && spyThis.models.getCharts ? spyThis.models.getCharts : Risks.getCharts
    spyThis.checkVarRisk = spyThis.models && spyThis.models.checkVarRisk ?  spyThis.models.checkVarRisk :  Overview.checkVarRisk
    // spyThis.checkProbRisk = spyThis.models && spyThis.models.checkProbRisk ? spyThis.models.checkProbRisk : Overview.checkProbRisk
    // spyThis.checkEstRisk = spyThis.models && spyThis.models.checkEstRisk ? spyThis.models.checkEstRisk : Overview.checkEstRisk
    spyThis.getPredictDataAndLastTime = spyThis.models && spyThis.models.getPredictDataAndLastTime ? spyThis.models.getPredictDataAndLastTime : Overview.getPredictDataAndLastTime
    spyThis.isValidate = spyThis.models && spyThis.models.isValidate ? spyThis.models.isValidate  : validate
    spyThis.env = spyThis.env ? spyThis.env : 'real'

    if (this && this.env == 'importtest') {
      console.log('should not here')
      return patientsRiskData
    }
    let attendedList = yield spyThis.hospitalDB.Query(
      `SELECT record.pat_no, record.hdrec_id, record.bw_stand AS dryweight, record.hd_bt AS temperature,
              pat.HEM_FIRST_DT as first_dt, record.hd_date AS hemdate, record.app_priod, LEFT(record.bed_no, 1) AS bed_area,
              convert(datetime,pat.BIRTH_DATE,112) AS birth, pat.sex AS gender,pat.DISEASE_1, pat.DISEASE_2,
              pat.DISEASE_3, pat.DISEASE_4,pat.DISEASE_5, pat.DISEASE_6, pat.DISEASE_7, pat.DISEASE_8, pat.HEM_FIRST_DT
       FROM vi_TYHD_PAT_HD_MASTER AS record
       INNER JOIN TYHD_PAT_HD_BASE AS pat
       ON pat.pat_no = record.pat_no
       WHERE HD_DATE = @today
        AND HD_STATUS = @hdStatus AND REC_DATE <= getdate()`
      ,
      { today, hdStatus: '透析中' }
    )
    attendedList = attendedList.rows
    if (attendedList.length <= 0) {
      return patientsRiskData
    }
    const hdrec_ids = R.map(data => {
      return `'${data}'`
    }, R.pluck('hdrec_id')(attendedList))

    // instead of sql to test easly
    const st_date = moment().format('YYYY-MM-DD 00:00:00')
    const ed_date = moment().format('YYYY-MM-DD 23:59:59')
    const alreadyPredictRecord = yield systemDB.Query(`
          SELECT * FROM webportal.risk
          WHERE sbp_time >= $1 AND sbp_time <= $2`, [st_date, ed_date])
    const records = yield getRecords(hdrec_ids.toString())
    for (let attended of attendedList) {
      try {
        const { pat_no, hdrec_id, first_dt, hemdate, app_priod, bed_area } = attended
        let record = records.filter((data) => data.hdrec_id == hdrec_id, records)
        record = {
          items : getItems({ rows : record }),
          temperature : Number(attended.temperature),
          dryweight : Number(attended.dryweight),
          dialysis_year : getDialysisYear(first_dt, hemdate),
        }

        attended.age = moment().diff(moment(attended.birth), 'years')
        attended.diseases = convertDiseases(attended)
        let { predictData, lastTime } = spyThis.getPredictDataAndLastTime(record, attended)
        // no record in cis_data
        if (lastTime == 0) {
          continue
        }
        lastTime = moment(lastTime).format('YYYY-MM-DD HH:mm:ss')
        if (isAlreadyPredict(alreadyPredictRecord.rows, hdrec_id, lastTime)) {
          continue
        }
        // get risk check start time and end time
        const diffMinute = Math.ceil(moment.duration(moment().diff(lastTime)).asMinutes())
        const predictMinutes = diffMinute + 60
        if (!predictData.ns) {
          predictData.ns = 50
        }
        if (!predictData.dia_flow) {
          predictData.dia_flow = 500
        }
        if (!predictData.temperature) {
          predictData.temperature = 36
        }
        // if start time and end time in predict result range, use diffMinue<=10 to skip already predict data
        if (spyThis.env == 'unittest' || (diffMinute >= 0 && diffMinute <= 60)) {
          // because data comes from api which would be the invaild value 9527, so need check min max
          if (spyThis.isValidate(false, predictData) == false) {
            console.log('false: ', predictData)
            continue
          }
          let riskThreshold = null
          const getRiskThreshold = yield systemDB.Query(`
          SELECT * FROM webportal.hemno_threshold
          WHERE create_date >= $1 AND create_date <= $2 and hemno = $3 order by create_date DESC limit 1`, [st_date, ed_date, hdrec_id])
          if (getRiskThreshold.rows.length === 0){
            riskThreshold = 999
          } else {
            riskThreshold = getRiskThreshold.rows[0].threshold
          }
          const postVarCharts = Protos.BPVar.request.encode(predictData).toBuffer()
          const predictVarChart = yield spyThis.getCharts(postVarCharts, 1, 2)
          const chartVarData = Protos.BPVar.response.decode(predictVarChart)
          let { type, risk_time, predict_sbp } = spyThis.checkVarRisk(lastTime, predictData, chartVarData, diffMinute, predictMinutes)
          if (risk_time) {
            const isLower = yield isLowerObserveThreshold(alreadyPredictRecord.rows, hdrec_id, record, predictData.sbp)
            if(isLower) {
              insertData.push({
                pno: pat_no,
                hemno: hdrec_id,
                c_id: 1,
                m_id: 2,
                risk_time: moment(risk_time).format('YYYY-MM-DD HH:mm'),
                type,
                sbp_time:lastTime,
                shift: app_priod,
                bed_area: bed_area,
                ev_status : ALARM_STATUS_TALBE.KEEP_OBSERVE,
                sbp: predictData.sbp,
                predict_sbp: predict_sbp,
                threshold: riskThreshold,
              })
            } else {
              if (predict_sbp >= riskThreshold && riskThreshold !== 999){
                insertData.push({
                  pno: pat_no,
                  hemno: hdrec_id,
                  c_id: 1,
                  m_id: 2,
                  risk_time: '',
                  type: '',
                  sbp_time:lastTime,
                  shift: app_priod,
                  bed_area: bed_area,
                  ev_status : ALARM_STATUS_TALBE.NO_RISK,
                  sbp: predictData.sbp,
                  predict_sbp: predict_sbp,
                  threshold: riskThreshold,
                })
              } else {
                insertData.push({
                  pno: pat_no,
                  hemno: hdrec_id,
                  c_id: 1,
                  m_id: 2,
                  risk_time: moment(risk_time).format('YYYY-MM-DD HH:mm'),
                  type,
                  sbp_time:lastTime,
                  shift: app_priod,
                  bed_area: bed_area,
                  ev_status : ALARM_STATUS_TALBE.NOT_PROCESSED_YET,
                  sbp: predictData.sbp,
                  predict_sbp: predict_sbp,
                  threshold: riskThreshold,
                })
                patientsRiskData.push({
                  patient:attended,
                  record,
                  chartVarData,
                })
              }
            }
          } else {
            insertData.push({
              pno: pat_no,
              hemno: hdrec_id,
              c_id: 1,
              m_id: 2,
              risk_time: '',
              type: '',
              sbp_time:lastTime,
              shift: app_priod,
              bed_area: bed_area,
              ev_status : ALARM_STATUS_TALBE.NO_RISK,
              sbp: predictData.sbp,
              predict_sbp: 999,
              threshold: riskThreshold,
            })
          }
        }
      } catch(e) {
        console.log(e.message)
        if (e.message !== 'predict input error') {
          console.error('should not here because we use formSBPValidator, the update risks fail: ', e)
        }
      }
    }

    for (let data of insertData) {
      const { pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, bed_area, ev_status, sbp, predict_sbp, threshold } = data

      const result = yield systemDB.Query(
        `
        WITH tmp_value (pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, hemarea, ev_status, sbp, predict_sbp, threshold) as (
         values
           ($1, $2, $3::int4, $4::int4, $5, $6, $7, $8::int4, $9, $10::int4, $11::real, $12::real, $13::real)
        )
        INSERT INTO webportal.risk(pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, hemarea, ev_status, sbp, predict_sbp, threshold)
        SELECT pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, hemarea, ev_status, sbp, predict_sbp, threshold FROM tmp_value
        WHERE pno NOT IN (SELECT pno FROM webportal.risk WHERE hemno = $2 AND sbp_time = $7 LIMIT 1)
        `,
        [pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, bed_area, ev_status, sbp, predict_sbp, threshold]
      )
      // means already in postgres
      if (result.rowCount == 0) {
        for(let i in patientsRiskData) {
          if (patientsRiskData[i].patient.hdrec_id == hemno) {
            patientsRiskData.splice(i, 1)
            break
          }
        }
      }
    }
    return patientsRiskData
  }
}

const isAlreadyPredict = (records, hdrec_id, lastTime) => {
  for(let r of records) {
    if (r.hemno == hdrec_id && r.sbp_time == lastTime) {
      return true
    }
  }
  return false
}

function* getRecords(recordIds) {
  const vip = yield hospitalDB.Query(`SELECT hdrec_id, data_time, blood_flow,
                                      dia_flow, temp, dia_temp_value, injection_vol, max_blood,min_blood,
                                      venous,conductivity,tmp,uf,ns,total_uf,pulse,dialysate, target_uf, time
                                    FROM vi_TYHD_CIS_DATA_REC
                                    WHERE hdrec_id IN ( ${recordIds} )`)
  const { rows } = postSelectVip(vip)
  return rows
}
