import moment from 'moment'
import { hospitalDB, systemDB } from 'server/helpers/database'
import { maybe } from 'maybes'
import { normalizr } from 'server/utils/normalizr'
import { convertDiseases } from 'server/models/maya/searches/patients'
import Overview, { tuningMaxbloodLower } from 'server/models/maya/searches/overviews'
import { isValidate } from 'common/modules/sbp/validator'
import Risks from 'server/models/maya/risks/risks'
import MayaAlarmSystem from 'server/models/maya/alarm-system'
import Protos from 'common/protos'
import co from 'co'
import { ALARM_STATUS_TALBE } from 'server/risk.js'
const nullValue = -9527
const NUR_STATUS_UNHANDLE = 1
const NUR_STATUS_HANDLE = 2
const { systemimportdate } = global.config

export default class Records {
  static* getRecords(patientId, startDate, endDate, offset, limit) {
    let dbOffset, dbLimitSql

    if (offset === void 0 || offset < 0) {
      dbOffset = 0
    } else {
      dbOffset = offset
    }
    if (limit === void 0 || limit < 0) {
      dbLimitSql = ''
    } else {
      dbLimitSql = `FETCH FIRST @limit rows only`
    }
    let records = [], record, record_list, total_nums
    record = yield hospitalDB.Query(`SELECT hdrec_id as hemno, hd_date as hemdate
                                     FROM vi_TYHD_PAT_HD_MASTER
                                     WHERE pat_no = @patientId
                                      AND hd_date >= @startDate
                                      AND hd_date <= @endDate
                                     ORDER BY hd_date`, { patientId, startDate, endDate })

    if (record.rows.length <= 0) {
      return {
        total_nums: 0,
        records: [],
      }
    }
    total_nums = yield hospitalDB.Query(`SELECT count(*) as count
                                         FROM vi_TYHD_PAT_HD_MASTER AS record
                                         WHERE pat_no = @patientId
                                          AND record.hd_date >= @startDate
                                          AND record.hd_date <= @endDate
                                         `,  { patientId, startDate, endDate })
    const sqlEndDate = record.rows[record.rows.length - 1].hemdate.replace(/\-/g, '')
    // because there have bad performance to mssql library handling complexity schema for data binding, so we workarround for it
    yield outApplyLabData(record, patientId,  sqlEndDate)
    for(let k in record.rows) {
      if (record.rows[k].resdt == null) {
        records.push({
          r_id: record.rows[k].hemno,
          date: moment(record.rows[k].hemdate).format('YYYY-MM-DD'),
          tr_id: '',
        })
      } else {
        let testdate = record.rows[k].resdt
        // testdate = testdate.replace(/-|\s|:/g, '')
        records.push({
          r_id: record.rows[k].hemno,
          date: moment(record.rows[k].hemdate).format('YYYY-MM-DD'),
          tr_id: `${patientId}+${testdate}`,
        })
      }
    }
    record_list = {
      total_nums: total_nums.rows[0].count,
      records: records,
    }

    return record_list
  }

  static* getRecord(patientId, recordId, enableSbpAlarm, notesformat) {
    let dbRecordRecd1, record, nur
    dbRecordRecd1 = yield hospitalDB.Query(
      `SELECT hd_date AS hemdate, st_date, st_time, ed_date, ed_time, bw_stand AS dryweight,
        hd_bt AS temperature, app_priod, LEFT(bed_no, 1) as bed_area,
        CASE
          WHEN hd_status = '已報到'
          THEN 0
          WHEN hd_status = '透析中'
          THEN 1
          WHEN hd_status = '透析結束'
          THEN 2
        END AS status
      FROM vi_TYHD_PAT_HD_MASTER AS hemrecd1
      WHERE hemrecd1.hdrec_id = @recordId`, { recordId })
    if (dbRecordRecd1.rows.length == 0) {
      record = setRecordNull(recordId)
      return record
    }
    dbRecordRecd1 = dbRecordRecd1.rows[0]

    let hemdate = moment(dbRecordRecd1.hemdate).format('YYYY-MM-DD')
    let times_of_dialyze = yield getTimeOfDialyze(patientId, recordId, hemdate)
    const dialysisInfo = getDialysisStartEnd(dbRecordRecd1)
    let start_time = dialysisInfo.start_time
    let end_time = dialysisInfo.end_time
    let dryweight = parseFloat(dbRecordRecd1.dryweight)
    if (isNaN(dryweight)) {
      dryweight = nullValue
    }
    let temperature = parseFloat(dbRecordRecd1.temperature)
    if (isNaN(temperature)) {
      temperature = nullValue
    }

    switch (notesformat)
    {
      case 'dart':
        nur = yield hospitalDB.Query(`SELECT convert(varchar, TYHD_DART_PAT.Create_Date, 120) AS rectime, IsNull(TYHD_DART_PAT.DContent, '') AS DContent,
                                      IsNull(TYHD_DART_PAT.AContent, '') AS AContent, TYHD_DART_PAT.RContent, TYHD_DART_PAT.TContent,
                                      MASTER.Subject, convert(varchar, TYHD_DART_PAT.Process_Date, 120) as ev_time
                                      FROM TYHD_DART_PAT as TYHD_DART_PAT inner join TYHD_DART_MASTER as MASTER
                                      on TYHD_DART_PAT.MSerial_ID = MASTER.MSerial_ID
                                      WHERE hdrec_id =@recordId
                                      ORDER BY ev_time ASC`, { recordId })
        break;
      default:
        nur = yield hospitalDB.Query(`SELECT record_date AS rectime, IsNull(ev_process, '') AS nurserec, IsNull(ev_situation, '') AS symptom, ev_type, ev_time
                                      FROM TYHD_PAT_HD_MEMO
                                      WHERE hdrec_id =@recordId
                                      ORDER BY ev_time ASC`, { recordId })
        break;
    }

    let vip = yield hospitalDB.Query(`SELECT data_time, blood_flow,
                                        dia_flow, temp, dia_temp_value, injection_vol, max_blood,min_blood,
                                        venous,conductivity,tmp,uf,ns,total_uf,pulse,dialysate, target_uf,  time,
                                        temp_alarm, conductivity_alarm, venous_alarm, dialysate_alarm, tmp_alarm,
                                        air_alarm, blood_alarm ,other_alarm ,up_alarm , low_alarm,
                                        art_alarm, water_alarm ,f_indilf_alarm, f_biclf_alarm, f_rolf_alarm,
                                        f_external_alarm, f_watershort_alarm, f_lowerflow_alarm, f_heparin_alarm, f_airdetector_alarm,
                                        f_artblood_alarm
                                      FROM vi_TYHD_CIS_DATA_REC
                                      WHERE hdrec_id = @recordId`, { recordId })

    vip = postSelectVip(vip)

    let items = getItems(vip)
    let minTime = getMinTime(start_time, vip)

    let panels = getPanels(patientId, recordId, nur.rows, vip.rows, notesformat)

    let patient = yield hospitalDB.Query(`
      SELECT HEM_FIRST_DT, convert(datetime,BIRTH_DATE,112) AS birth, sex AS gender,DISEASE_1, DISEASE_2,
        DISEASE_3, DISEASE_4,DISEASE_5, DISEASE_6, DISEASE_7, DISEASE_8, HEM_FIRST_DT
      FROM TYHD_PAT_HD_BASE WHERE pat_no =@patientId`, { patientId })
    let first_dt
    if (patient.rows.length > 0) {
      first_dt = patient.rows[0].HEM_FIRST_DT
    }

    let dialysis_year = getDialysisYear(first_dt, hemdate)
    let status = dbRecordRecd1.status || 0
    record = {
      r_id: recordId.toString(),
      times_of_dialyze: times_of_dialyze,
      date: hemdate,
      start_time: minTime.toString(),
      end_time: end_time,
      dryweight: dryweight,
      temperature: temperature,
      dialysateca1: 2.5,
      dialysis_year: dialysis_year,
      items: items,
      panels: panels,
      status,
    }
    let sbp_alarm = []
    if (enableSbpAlarm && enableSbpAlarm == '1' && patient.rows.length > 0 ) {
      const risk = yield systemDB.Query('SELECT ev_status, sbp_time, risk_time as ev_time, record_date FROM webportal.risk WHERE hemno = $1', [recordId])
      sbp_alarm = getSbpAlarm(record, risk.rows, nur.rows, notesformat)
      // if last sbp point hasn't predict by risk schedule and predict for it
      if (sbp_alarm.length > 0 && sbp_alarm[sbp_alarm.length - 1].alarm_status == ALARM_STATUS_TALBE.NO_ALARM_MESSAGE) {
        const lastSbpAlarm = yield getLastSbpAlarm(record, patient.rows[0], recordId, risk)
        if(typeof lastSbpAlarm !== 'undefined' && lastSbpAlarm !== null) {
          if(lastSbpAlarm.ev_status == ALARM_STATUS_TALBE.NO_RISK) {
            const result = yield co(systemDB.Query(
            `INSERT INTO webportal.risk (pno, hemno, c_id, m_id, sbp_time, shift, hemarea, ev_status, sbp, predict_sbp, threshold )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [patientId, recordId.toString(), lastSbpAlarm.c_id, lastSbpAlarm.m_id,
                lastSbpAlarm.sbp_time, dbRecordRecd1.app_priod, dbRecordRecd1.bed_area, lastSbpAlarm.ev_status], lastSbpAlarm.sbp, lastSbpAlarm.predict_sbp, lastSbpAlarm.threshold ))
            sbp_alarm[sbp_alarm.length - 1].alarm_time = ''
            sbp_alarm[sbp_alarm.length - 1].alarm_status = lastSbpAlarm.ev_status
          }
          if(lastSbpAlarm.ev_status == ALARM_STATUS_TALBE.KEEP_OBSERVE) {
            let risk_time = moment(lastSbpAlarm.risk_time).format('YYYY-MM-DD HH:mm')
            const result = yield co(systemDB.Query(
            `INSERT INTO webportal.risk (pno, hemno, c_id, m_id, sbp_time, shift, hemarea, ev_status, type, risk_time, sbp, predict_sbp, threshold)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [patientId, recordId.toString(), lastSbpAlarm.c_id, lastSbpAlarm.m_id,
                lastSbpAlarm.sbp_time, dbRecordRecd1.app_priod, dbRecordRecd1.bed_area, lastSbpAlarm.ev_status, lastSbpAlarm.type, risk_time, lastSbpAlarm.sbp, lastSbpAlarm.predict_sbp, lastSbpAlarm.threshold]))
            sbp_alarm[sbp_alarm.length - 1].alarm_time = ''
            sbp_alarm[sbp_alarm.length - 1].alarm_status = lastSbpAlarm.ev_status
          }
          if(lastSbpAlarm.ev_status == ALARM_STATUS_TALBE.NOT_PROCESSED_YET) {
            const { lastAlarmTime, lastAlarmStatus } = yield processSbpAlarm(lastSbpAlarm, { patientId, recordId, bed_area: dbRecordRecd1.bed_area, app_priod : dbRecordRecd1.app_priod })
            sbp_alarm[sbp_alarm.length - 1].alarm_time = lastAlarmTime
            sbp_alarm[sbp_alarm.length - 1].alarm_status = lastAlarmStatus
          }
        } else {
          sbp_alarm[sbp_alarm.length - 1].alarm_time = ''
          sbp_alarm[sbp_alarm.length - 1].alarm_status = ALARM_STATUS_TALBE.NO_ALARM_MESSAGE
        }
      }
    }
    return {
      ...record,
      sbp_alarm,
    }
  }
}

function setRecordNull(recordId) {
  let record
  record = {
    r_id: recordId,
    times_of_dialyze: nullValue,
    date: '',
    start_time: nullValue,
    end_time: nullValue,
    dryweight: nullValue,
    temperature: nullValue,
    dialysateca1: nullValue,
    dialysis_year: nullValue,
    items: [],
    panels: {},
    status: 0,
  }
  return record
}

function* getTimeOfDialyze(patientId, recordId, hemdate) {
  let month = moment(hemdate).format('MM')
  let year = moment(hemdate).format('YYYY')

  let records = yield hospitalDB.Query(`SELECT hd_date AS hemdate,ROW_NUMBER() OVER (ORDER BY hd_date) AS RowNum
                                                 FROM vi_TYHD_PAT_HD_MASTER
                                                 WHERE DATEPART(mm,hd_date) = @month
                                                  AND DATEPART(yyyy,hd_date) =@year
                                                  AND pat_no =@patientId`, { month, year, patientId })

  if (records.rows.length <= 0) {
    return nullValue
  }

  let times_of_dialyze = nullValue
  for(let k in records.rows) {
    if (hemdate == moment(records.rows[k].hemdate).format('YYYY-MM-DD')) {
      times_of_dialyze = parseInt(records.rows[k].RowNum)
      break
    }
  }
  return times_of_dialyze
}

function getDialysisStartEnd(dbRecordRecd1) {
  const st_date = dbRecordRecd1.st_date
  const st_time = dbRecordRecd1.st_time
  const ed_date = dbRecordRecd1.ed_date
  const ed_time = dbRecordRecd1.ed_time
  let start_time, end_time

  if (st_time != null && st_time != '') {
    start_time = new Date(moment(`${st_date} ${st_time}`).format('YYYY-MM-DD HH:mm')).valueOf()
  } else {
    if (ed_time != null && ed_time != '' ) {
      start_time = new Date(moment(`${ed_date} ${ed_time}`).subtract(5, 'h').format('YYYY-MM-DD HH:mm')).valueOf()
    } else {
      start_time = nullValue
    }
  }
  if (ed_time != null && ed_time != '' ) {
    end_time = new Date(moment(`${ed_date} ${ed_time}`).format('YYYY-MM-DD HH:mm')).valueOf()
  } else {
    end_time = nullValue
  }
  return { end_time, start_time }
}

export const getItems = (vip) => {
  let items = []

  if (vip.rows.length <= 0) {
    return items
  }

  let text =  getText(vip)
  let chart = getChart(vip)
  text.forEach(item => {
    items.push(item)
  })
  chart.forEach(item => {
    items.push(item)
  })

  return items
}

function getText(vip) {
  let items = []
  let bloodFlowData = [], diaFlowData = [], diaTempValueData = [], syringeFlowData = [], deltaDiaTempValueData = [], preDiaTempValueData = [], deltabloodFlowData = []

  vip.rows.forEach(item => {
    let time = new Date(item.data_time).valueOf()
    if (item.blood_flow !== void 0 && item.blood_flow != '') {
      bloodFlowData.push({ time: time, value: parseInt(item.blood_flow), status: 0 })
    }
    if (item.dia_flow !== void 0 && item.dia_flow != '') {
      diaFlowData.push({ time: time, value: parseInt(item.dia_flow), status: 0 })
    } else {
      diaFlowData.push({ time: time, value: 500, status: 0 })
    }
    if (item.temp !== void 0 && item.temp != '') {
      diaTempValueData.push({ time: time, value: parseFloat(item.temp), status: 0 })
    }
    if (item.injection_vol !== void 0 && item.injection_vol != '') {
      syringeFlowData.push({ time: time, value: parseFloat(item.injection_vol), status: 0 })
    }
  })

  diaTempValueData.forEach((item, index, array) => {
    if(index == 0) {
      deltaDiaTempValueData.push({ time: item.time, value: 0, status: 0 })
    } else {
      let value
      if (array[index].value == null || array[index - 1].value == null)
        value = deltaDiaTempValueData[index - 1]
      else
        value = parseFloat(array[index].value) - parseFloat(array[index - 1].value)
      deltaDiaTempValueData.push({ time: item.time, value: value, status: 0 })
    }
  })
  diaTempValueData.forEach((item, index, array) => {
    if(index == 0) {
      preDiaTempValueData.push({ time: item.time, value: parseFloat(array[index].value), status: 0 })
    } else {
      preDiaTempValueData.push({ time: item.time, value: parseFloat(array[index - 1].value), status: 0 })
    }
  })

  bloodFlowData.forEach((item, index, array) => {
    if(index == 0) {
      deltabloodFlowData.push({ time: item.time, value: 0, status: 0 })
    } else {
      let value
      if (array[index].value == null || array[index - 1].value == null)
        value = deltabloodFlowData[index - 1]
      else
        value = parseFloat(array[index].value) - parseFloat(array[index - 1].value)
      deltabloodFlowData.push({ time: item.time, value: value, status: 0 })
    }
  })
  items.push({ ri_id: 'blood_flow', name: 'Blood Flow', unit: 'ml/min', type: 'text', data: bloodFlowData })
  items.push({ ri_id: 'dia_flow', name: 'Dialysate Flow', unit: 'ml/min', type: 'text', data: diaFlowData })
  items.push({ ri_id: 'dia_temp_value', name: 'Dialysate Temp.', unit: '°C', type: 'text', data: diaTempValueData })
  items.push({ ri_id: 'pre_dia_temp_value', name: 'Dialysate Temp.', unit: '°C', type: 'text', data: preDiaTempValueData })
  items.push({ ri_id: 'injection_vol', name: 'Syringe Volume', unit: 'u', type: 'text', data: syringeFlowData })
  items.push({ ri_id: 'deltadia_temp_value', name: 'Delta Dialysate Temp.', unit: '°C', type: 'text', data: deltaDiaTempValueData })
  items.push({ ri_id: 'delta_bloodflow', name: 'Delta Blood Flow', unit: 'ml/min', type: 'calc', data: deltabloodFlowData })
  return items
}

function getChart(vip) {
  let items = []
  let sbpData = [], dbpData = [], venousData = [], conductivityData = [], tmpData = [], ufData = [], deltaufData = []
  let nsData = [], totalUfData = [], pulseData = [], dialysateData = [], targetUfData = []

  vip.rows.forEach(item => {
    let time = new Date(item.data_time).valueOf()
    if (item.max_blood !== void 0 && item.max_blood != '') {
      sbpData.push({ time: time, value: parseFloat(item.max_blood), status: 0 })
    }
    if (item.min_blood !== void 0 && item.min_blood != '') {
      dbpData.push({ time: time, value: parseFloat(item.min_blood), status: 0 })
    }
    if (item.venous !== void 0 && item.venous != '') {
      venousData.push({ time: time, value: parseFloat(item.venous), status: 0 })
    }
    if (item.conductivity !== void 0 && item.conductivity != '') {
      conductivityData.push({ time: time, value: parseFloat(item.conductivity), status: 0 })
    }
    if (item.tmp !== void 0 && item.tmp != '') {
      tmpData.push({ time: time, value: parseFloat(item.tmp), status: 0 })
    }
    if (item.uf !== void 0 && item.uf != '') {
      ufData.push({ time: time, value: parseFloat(item.uf), status: 0 })
    }
    if (item.ns !== void 0 && item.ns != '') {
      nsData.push({ time: time, value: parseFloat(item.ns), status: 0 })
    }
    if (item.pulse !== void 0 && item.pulse != '') {
      pulseData.push({ time: time, value: parseFloat(item.pulse), status: 0 })
    }
    if (item.dialysate !== void 0 && item.dialysate != '') {
      dialysateData.push({ time: time, value: parseFloat(item.dialysate), status: 0 })
    }
    if (item.total_uf !== void 0 && item.total_uf != '') {
      totalUfData.push({ time: time, value: parseFloat(item.total_uf), status: 0 })
    }
    if(item.target_uf !== void 0 && item.target_uf != '') {
      targetUfData.push({ time: time, value: parseFloat(item.target_uf), status: 0 })
    }
  })

  if (sbpData.length > 0 ) {
    items.push({ ri_id: 'sbp', name: 'SBP', unit: 'mmHg', type: 'chart', data: sbpData })
  }
  if (dbpData.length > 0 ) {
    items.push({ ri_id: 'dbp', name: 'DBP', unit: 'mmHg', type: 'chart', data: dbpData })
  }
  if (venousData.length > 0 ) {
    items.push({ ri_id: 'venous', name: 'VP', unit: 'mmHg', type: 'chart', data: venousData })
  }
  if (conductivityData.length > 0 ) {
    items.push({ ri_id: 'conductivity', name: 'Conductivity', unit: 'ms/cm', type: 'chart', data: conductivityData })
  }
  if (tmpData.length > 0 ) {
    items.push({ ri_id: 'tmp', name: 'TMP', unit: 'mmHg', type: 'chart', data: tmpData })
  }
  if (ufData.length > 0 ) {
    items.push({ ri_id: 'uf', name: 'UFR', unit: 'L/hr', type: 'chart', data: ufData })
  }
  if (nsData.length > 0 ) {
    items.push({ ri_id: 'ns', name: 'N/S', unit: 'ml', type: 'chart', data: nsData })
  }
  if (totalUfData.length > 0 ) {
    items.push({ ri_id: 'total_uf', name: 'UF', unit: 'kg', type: 'chart', data: totalUfData })
  }
  if (pulseData.length > 0 ) {
    items.push({ ri_id: 'pulse', name: 'Pulse', unit: 'beats/min', type: 'chart', data: pulseData })
  }
  if (dialysateData.length > 0 ) {
    items.push({ ri_id: 'dialysate', name: 'Dialysate', unit: 'mmHg', type: 'chart', data: dialysateData })
  }

  if(targetUfData.length > 0) {
    items.push({ ri_id: 'target_uf', name: 'TARGET UF', unit: 'ml', type: 'calc', data: targetUfData })
  }

  ufData.forEach((item, index, array) => {
    if (index == 0) {
      deltaufData.push({ time: item.time, value: 0, status: 0 })
    } else {
      let value
      if (array[index].value == null || array[index - 1].value == null)
        value = deltaufData[index - 1]
      else
        value = parseFloat(array[index].value).toFixed(2) - parseFloat(array[index - 1].value).toFixed(2)
      deltaufData.push({ time: item.time, value: value, status: 0 })
    }
  })
  if(deltaufData.length > 0) {
    items.push({ ri_id: 'delta_uf', name: 'delta UF', unit: 'L', type: 'calc', data: deltaufData })
  }
  return items
}

function getMinTime(start_time, vips) {
  let minStartTime = start_time

  for(let vip of vips.rows) {
    if (minStartTime > new Date(vip.data_time).valueOf()) {
      minStartTime = new Date(vip.data_time).valueOf()
    }
  }
  return minStartTime
}

function getPanels(patientId, recordId, nurs, vips, notesformat) {
  let intra = [], panels, ev_time, rectime
  let lastestNurTime = nurs.length > 0 ?  nurs[nurs.length - 1].ev_time : 1
  switch (notesformat) {
    case 'dart':
      lastestNurTime = moment(lastestNurTime, 'YYYY-MM-DD HH:mm')
      nurs.forEach(nur => {
        ev_time = moment(nur.ev_time).format('YYYY-MM-DD HH:mm')
        rectime = moment(nur.rectime).format('YYYY-MM-DD HH:mm:ss')
        intra.push({
          Subject: nur.Subject,
          DContent: nur.DContent,
          AContent: nur.AContent,
          RContent: nur.RContent,
          TContent: nur.TContent,
          pi_id: `${patientId}+${recordId}+handled+${ev_time}`,
          time: new Date(ev_time).valueOf(),
          rectime: rectime,
          status: NUR_STATUS_HANDLE,
        })
      })
      vips.forEach(record => {
        if (moment(record.data_time, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm') > lastestNurTime) {
          const alarm = getAlarm(record)
          if (alarm != '') {
            intra.push({
              symptom: getAlarm(record),
              pi_id: `${patientId}+${recordId}+abnormal+${record.data_time}`,
              time: new Date(record.data_time).valueOf(),
              status: NUR_STATUS_UNHANDLE,
            })
          }
        }
      })
      panels = {
        intra,
        post:[],
        pre:[],
      }
      return panels
    default:
      nurs.forEach(nur => {
        intra.push({
          symptom: `${nur.symptom}`,
          treatment: nur.nurserec,
          pi_id: `${patientId}+${recordId}+handled+${nur.ev_time}`,
          time: new Date(nur.ev_time).valueOf(),
          rectime: nur.rectime,
          status: NUR_STATUS_HANDLE,
        })
      })
      vips.forEach(record => {
        if (moment(record.data_time, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm') > lastestNurTime) {
          const alarm = getAlarm(record)
          if (alarm != '') {
            intra.push({
              symptom: getAlarm(record),
              pi_id: `${patientId}+${recordId}+abnormal+${record.data_time}`,
              time: new Date(record.data_time).valueOf(),
              status: NUR_STATUS_UNHANDLE,
            })
          }
        }
      })
      panels = {
        intra,
        post:[],
        pre:[],
      }
      return panels
  }
}

export function* outApplyLabData(record, patientId,  sqlEndDate) {
  const labdata = yield hospitalDB.Query(`
                        SELECT DISTINCT report_dt AS resdt FROM TYHD_LAB_DATA
                        WHERE patient_id = @patientId
                          AND report_dt <= @sqlEndDate
                        ORDER BY report_dt ASC`, { patientId,  sqlEndDate })
  for(let k in record.rows) {
    const hemdate = moment(record.rows[k].hemdate).format('YYYYMMDD')
    let low = 0, upper = (labdata.rows.length - 1), mid = -1, resdt
    while (low <= upper) {
      mid = (low  + upper) >> 1
      resdt = labdata.rows[mid].resdt
      if (hemdate >= resdt) {
        record.rows[k].resdt = resdt
        low = mid + 1
      } else {
        upper = mid - 1
      }
    }
  }
}

export function postSelectVip(vip) {
  const maybeRows = maybe(vip)
    .flatMap(vip => maybe(vip.rows))
    .orJust([])

  const rows = maybeRows
    .filter(row => row.time >= 1)
    .filter(row => moment(row.data_time, 'YYYY/MM/DD HH:mm:ss', true).isValid())
    .sort((r1, r2) => new Date(r1.data_time).valueOf() - new Date(r2.data_time).valueOf())

  return { rows }
}

export function getDialysisYear(first_dt, hemdate) {
  let dialysis_year = 0
  if(moment(first_dt, 'YYYY-MM-DD', true).isValid()) {
    hemdate = moment(hemdate)
    dialysis_year = hemdate.diff(first_dt, 'years', true)
    dialysis_year = Math.round(dialysis_year * 100) / 100
  }
  return dialysis_year
}

export function getSbpAlarm(record, risk, nur, notesformat) {
  let sbpData
  for(let item of record.items) {
    if (item['ri_id'] === 'sbp') {
      sbpData = item.data
      break
    }
  }
  if (!sbpData) {
    return []
  } else {
    const sbpStatus = []
    nur.forEach(nur => {
      nur.ev_time = moment(nur.ev_time).format('YYYY-MM-DD HH:mm')
      nur.rectime = moment(nur.rectime).format('YYYY-MM-DD HH:mm:ss')
    })
    // to reduce time complexity
    const nur_list = normalizr(nur, 'rectime')
    const risk_list = normalizr(risk, 'sbp_time')
    // init default list
    const systemfirstdate = moment(systemimportdate).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')
    switch (notesformat) {
      case 'dart':
        sbpData.forEach(sbp => {
          const date = moment(sbp.time).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')
          let alarm_status = ALARM_STATUS_TALBE.NO_DATA, Subject = '', DContent = '',  AContent = '',  RContent = '',  TContent = '', alarm_time = '', process_time = ''
          if(moment(date).isAfter(systemimportdate, 'second')) {
            alarm_status = ALARM_STATUS_TALBE.NO_ALARM_MESSAGE
          }
          const r = risk_list[date]
          if (r) {
            alarm_status = r.ev_status
            if (moment(r.ev_time, 'YYYY-MM-DD HH:mm', false).isValid()) {
              alarm_time = moment(r.ev_time, 'YYYY-MM-DD HH:mm').format('HH:mm')
            }
            if (nur_list[r.record_date]) {
              Subject = nur_list[r.record_date].Subject
              DContent = nur_list[r.record_date].DContent
              AContent = nur_list[r.record_date].AContent
              RContent = nur_list[r.record_date].RContent
              TContent = nur_list[r.record_date].TContent
              process_time = moment(nur_list[r.record_date].ev_time).format('YYYY-MM-DD HH:mm A')
              process_time = process_time == 'Invalid date' ? '' : process_time
            }
          }
          sbpStatus.push({ time: sbp.time, alarm_status, Subject, DContent, AContent, RContent, TContent, alarm_time, process_time })
        })
        return sbpStatus
      default:
        sbpData.forEach(sbp => {
          const date = moment(sbp.time).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')
          let alarm_status = ALARM_STATUS_TALBE.NO_DATA, alarm_phrase = '', alarm_process = '', alarm_time = '', process_time = ''
          if(moment(date).isAfter(systemimportdate, 'second')) {
            alarm_status = ALARM_STATUS_TALBE.NO_ALARM_MESSAGE
          }
          const r = risk_list[date]
          if (r) {
            alarm_status = r.ev_status
            if (moment(r.ev_time, 'YYYY-MM-DD HH:mm', false).isValid()) {
              alarm_time = moment(r.ev_time, 'YYYY-MM-DD HH:mm').format('HH:mm')
            }
            if (nur_list[r.record_date]) {
              alarm_phrase = nur_list[r.record_date].symptom
              alarm_process = nur_list[r.record_date].nurserec
              process_time = moment(nur_list[r.record_date].ev_time).format('YYYY-MM-DD HH:mm A')
              process_time = process_time == 'Invalid date' ? '' : process_time
            }
          }
          sbpStatus.push({ time: sbp.time, alarm_status, alarm_phrase, alarm_process, alarm_time, process_time })
        })
        return sbpStatus
    }

  }
}

export const getAlarm = (record) => {
  let alarm = ''
  for (let column in record) {
    if (column.endsWith('_alarm') && parseInt(record[column]) >= 1) {
      alarm += (column + ' ')
    }
  }
  return alarm
}

export function* getLastSbpAlarm(record, patient, hdrec_id, risk) {
  patient.age = moment().diff(moment(patient.birth), 'years')
  patient.diseases = convertDiseases(patient)
  let { predictData, lastTime } = Overview.getPredictDataAndLastTime(record, patient)
  if (lastTime == 0) {
    return
  }
  lastTime = moment(lastTime).format('YYYY-MM-DD HH:mm:ss')
  const diffMinute = Math.ceil(moment.duration(moment().diff(lastTime)).asMinutes())
  const predictMinutes = diffMinute + 60
  if (diffMinute < 0 || diffMinute > 60) {
    return
  }
  if (!predictData.ns) {
    predictData.ns = 50
  }
  if (!predictData.dia_flow) {
    predictData.dia_flow = 500
  }
  if (!predictData.temperature) {
    predictData.temperature = 36
  }

  if (isValidate(false, predictData) == false) {
    return
  }
  try {
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
    const predictVarChart = yield Risks.getCharts(postVarCharts, 1, 2)
    const chartVarData = Protos.BPVar.response.decode(predictVarChart)
    let { type, risk_time, predict_sbp } = Overview.checkVarRisk(lastTime, predictData, chartVarData, diffMinute, predictMinutes)
    const risk = yield systemDB.Query('SELECT * FROM webportal.risk WHERE hemno = $1', [hdrec_id])
    if (risk_time) {
      const isLower = yield isLowerObserveThreshold(risk.rows, hdrec_id, record, predictData.sbp)
      if(isLower) {
        return {
          c_id: 1,
          m_id: 2,
          risk_time: moment(risk_time).format('YYYY-MM-DD HH:mm:ss'),
          type,
          sbp_time:lastTime,
          ev_status :ALARM_STATUS_TALBE.KEEP_OBSERVE,
          sbp: predictData.sbp,
          predict_sbp: predict_sbp,
          threshold: riskThreshold,
        }
      }
      if (predict_sbp >= riskThreshold && riskThreshold !== 999){
        return {
          c_id: 1,
          m_id: 2,
          type,
          sbp_time:lastTime,
          ev_status :ALARM_STATUS_TALBE.NO_RISK,
          sbp: predictData.sbp,
          predict_sbp: predict_sbp,
          threshold: riskThreshold,
        }
      } else {
        return {
          c_id: 1,
          m_id: 2,
          risk_time: moment(risk_time).format('YYYY-MM-DD HH:mm:ss'),
          type,
          sbp_time:lastTime,
          ev_status :ALARM_STATUS_TALBE.NOT_PROCESSED_YET,
          sbp: predictData.sbp,
          predict_sbp: predict_sbp,
          threshold: riskThreshold,
        }
      }
    } else {
      return {
        c_id: 1,
        m_id: 2,
        type,
        sbp_time:lastTime,
        ev_status :ALARM_STATUS_TALBE.NO_RISK,
        sbp: predictData.sbp,
        predict_sbp: 999,
        threshold: riskThreshold,
      }
    }
  } catch (e) {
    return
  }
}

export function* processSbpAlarm(alarm, record) {
  if (!alarm) {
    return {
      lastAlarmTime : '',
      lastAlarmStatus : ALARM_STATUS_TALBE.NO_DATA,
    }
  }
  let risk_time =  moment(alarm.risk_time).format('YYYY-MM-DD HH:mm')
  const alarmTime = yield co(systemDB.Query(
    `INSERT INTO webportal.risk (pno, hemno, c_id, m_id, risk_time, type, sbp_time, shift, hemarea, ev_status, sbp, predict_sbp, threshold)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [record.patientId, record.recordId, alarm.c_id, alarm.m_id, risk_time, alarm.type,
      alarm.sbp_time, record.app_priod, record.bed_area, alarm.ev_status, alarm.sbp, alarm.predict_sbp, alarm.threshold]))
    .then(()=> {
      co(function*() {
        yield MayaAlarmSystem.processMayaAlarmSystem()
      })

      return risk_time
    }).catch(() => {
      // for avoid multi thread issue by schedule
      return co(systemDB.Query('SELECT risk_time FROM webportal.risk WHERE hemno = $1 AND sbp_time = $2', [record.recordId, alarm.sbp_time]))
             .then(r=> r.rows[0].risk_time)
    })
  return {
    lastAlarmTime : moment(alarmTime).format('HH:mm'),
    lastAlarmStatus : ALARM_STATUS_TALBE.NOT_PROCESSED_YET,
  }
}

export function* isLowerObserveThreshold(alreadyPredictRecord, hdrec_id, record, sbp) {
  let observeList = []
  for(let r of alreadyPredictRecord) {
    if (r.hemno == hdrec_id && r.ev_status == ALARM_STATUS_TALBE.KEEP_OBSERVE) {
      observeList.push(new Date(r.sbp_time).valueOf())
    }
  }
  if(observeList.length > 0) {
    const { items } = record
    const sbpItem = items.filter(item => item.ri_id === 'sbp')
    if (sbpItem.length > 0) {
      const { data } = sbpItem[0]
      const list = data.filter(d => observeList.some(o => d.time == o))
      if (list.length > 0) {
        const lowestSbp = Math.min.apply(Math, list.map(function(o){return o.value}))
        const lowestThreshold = tuningMaxbloodLower(lowestSbp)
        const lastSbpThreshold = tuningMaxbloodLower(sbp)
        if(lowestThreshold.maxblood_lower <= lastSbpThreshold.maxblood_lower) {
          return true
        } else {
          return false
        }
      }
    }
  }
  return
}
