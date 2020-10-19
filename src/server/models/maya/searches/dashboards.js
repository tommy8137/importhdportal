import { hospitalDB } from 'server/helpers/database'
import moment from 'moment'
import { getAlarm } from 'server/models/maya/searches/records'

const nullValue = -9527

export default class Dashboards {
  static* getDashboards(patientId, recordId, notesformat) {
    let record = yield hospitalDB.Query(`SELECT hd_date as hemdate,begin_weight AS weightstart, end_weight AS weightend, hp_first AS heparine1, hp_continue AS heparine2,
                                          vpre_max_blood, vpre_min_blood, vpost_max_blood, vpost_min_blood
                                         FROM vi_TYHD_PAT_HD_MASTER
                                         WHERE pat_no = @patientId
                                          AND hdrec_id = @recordId`, { patientId, recordId })
    const status_hightlight = getStatusHighLight(record)
    const dialyze_records = yield getDialyzeRecords(patientId, recordId, notesformat)
    const dialysis_test_result = yield getDialyzeTestResult(record, patientId)

    const dashboards = {
      status_hightlight,
      dialyze_records,
      dialysis_test_result,
    }

    return dashboards
  }
}

function getStatusHighLight(status_hightlight) {
  let heparinStart, heparinCirculation

  if (status_hightlight.rows.length > 0) {
    status_hightlight = status_hightlight.rows[0]
    if (isNaN(parseFloat(status_hightlight.heparine2))) {
      status_hightlight.heparine2 = nullValue
    }

    if (isNaN(parseFloat(status_hightlight.heparine1))) {
      heparinStart = nullValue
      heparinCirculation = nullValue
    /* } else if (status_hightlight.heparine1.includes('cir')) {
      heparinStart = nullValue
      heparinCirculation = status_hightlight.heparine1.replace('cir', '')
    */
    } else {
      heparinStart = status_hightlight.heparine1
      heparinCirculation = nullValue
    }

    if (status_hightlight.vpre_min_blood == null || status_hightlight.vpre_min_blood == '') {
      status_hightlight.vpre_min_blood = nullValue
    }

    if (status_hightlight.vpre_max_blood == null || status_hightlight.vpre_max_blood == '') {
      status_hightlight.vpre_max_blood = nullValue
    }

    if (status_hightlight.vpost_min_blood  == null || status_hightlight.vpost_min_blood == '') {
      status_hightlight.vpost_min_blood = nullValue
    }

    if (status_hightlight.vpost_max_blood == null || status_hightlight.vpost_max_blood == '') {
      status_hightlight.vpost_max_blood = nullValue
    }

    if (isNaN(parseFloat(status_hightlight.weightstart))) {
      status_hightlight.weightstart = nullValue
    }
    if (isNaN(parseFloat(status_hightlight.weightend))) {
      status_hightlight.weightend = nullValue
    }

    status_hightlight = {
      weight: {
        pre: parseFloat(status_hightlight.weightstart),
        post: parseFloat(status_hightlight.weightend),
      },
      sbp: {
        pre: parseInt(status_hightlight.vpre_max_blood),
        post: parseInt(status_hightlight.vpost_max_blood),
      },
      dbp: {
        pre: parseInt(status_hightlight.vpre_min_blood),
        post: parseInt(status_hightlight.vpost_min_blood),
      },
      heparin_usage_status: {
        start: parseInt(heparinStart),
        remain: parseInt(status_hightlight.heparine2),
        circulation: parseInt(heparinCirculation),
      },
    }
  } else {
    status_hightlight = {
      weight: {
        pre: nullValue,
        post: nullValue,
      },
      sbp: {
        pre: nullValue,
        post: nullValue,
      },
      dbp: {
        pre: nullValue,
        post: nullValue,
      },
      heparin_usage_status: {
        start: nullValue,
        remain: nullValue,
        circulation: nullValue,
      },
    }
  }
  return status_hightlight
}

function* getDialyzeRecords(patientId, recordId, notesformat) {
  const total = yield hospitalDB.Query(`SELECT COUNT(*) AS count FROM TYHD_CIS_DATA
                                  WHERE hdrec_id = @recordId AND time >=1`, { recordId })
  let dialyze_records = {
    'r_id': recordId,
    'abnormal': [],
    'handled': [],
  }

  const records = yield hospitalDB.Query(`
      SELECT data_time, temp_alarm, conductivity_alarm, venous_alarm, dialysate_alarm, tmp_alarm,
        air_alarm, blood_alarm ,other_alarm ,up_alarm , low_alarm,
  			art_alarm, water_alarm ,f_indilf_alarm, f_biclf_alarm, f_rolf_alarm,
  			f_external_alarm, f_watershort_alarm, f_lowerflow_alarm, f_heparin_alarm, f_airdetector_alarm,
  			f_artblood_alarm FROM TYHD_CIS_DATA
      WHERE (temp_alarm >= 1 OR conductivity_alarm >= 1 OR venous_alarm >= 1 OR dialysate_alarm >= 1 OR tmp_alarm >= 1
        OR air_alarm >= 1 OR blood_alarm >= 1 OR other_alarm >= 1 OR up_alarm  >= 1 OR low_alarm >= 1
        OR art_alarm >= 1 OR water_alarm >= 1 OR f_indilf_alarm >= 1 OR f_biclf_alarm >= 1 OR f_rolf_alarm >= 1
        OR f_external_alarm >= 1 OR f_watershort_alarm >= 1 OR f_lowerflow_alarm >= 1 OR f_heparin_alarm >= 1 OR f_airdetector_alarm >= 1
        OR f_artblood_alarm >= 1) AND time >= 1 AND hdrec_id = @recordId
      ORDER BY data_time ASC`, { recordId })
  let nurs
  switch (notesformat)
  {
    case "dart":
      nurs = yield hospitalDB.Query(`
      SELECT IsNull(DContent, '') AS symptom, IsNull(AContent, '') AS nurserec, convert(varchar, TYHD_DART_PAT.Process_Date, 120) as ev_time
      FROM TYHD_DART_PAT WHERE hdrec_id= @recordId ORDER BY ev_time ASC`, { recordId })
      break;
    default:
      nurs = yield hospitalDB.Query(`
      SELECT IsNull(ev_situation, '') AS symptom, IsNull(ev_process, '') AS nurserec, ev_time
      FROM TYHD_PAT_HD_MEMO WHERE hdrec_id= @recordId ORDER BY ev_time ASC`, { recordId })
      break;
  }
  const lastestNurTime = nurs.rows.length > 0 ? nurs.rows[nurs.rows.length - 1].ev_time : 1

  nurs.rows.forEach(nur => {
    nur.ev_time = moment(nur.ev_time).format('YYYY-MM-DD HH:mm')
    dialyze_records['handled'].push({
      symptom:  `${moment(nur.ev_time).format('HH:mm')} ${nur.symptom}`,
      treatment: nur.nurserec,
      pi_id: `${patientId}+${recordId}+handled+${nur.ev_time}`,
    })
  })

  records.rows.forEach(record => {
    if (moment(record.data_time, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm') > lastestNurTime) {
      const alarm = getAlarm(record)
      if (alarm != '') {
        const abnormalTime = record.data_time
        const time = moment(abnormalTime, 'YYYY/MM/DD HH:mm:ss').format('HH:mm:ss')
        dialyze_records['abnormal'].push({
          symptom:  `${time} ${alarm}`,
          pi_id: `${patientId}+${recordId}+abnormal+${abnormalTime}`,
        })
      }
    }
  })

  dialyze_records.total = total.rows[0].count +  dialyze_records['handled'].length
  return dialyze_records
}

function* getDialyzeTestResult(record, patientId) {
  let dialysis_test_result, hemdate, testdate, test, total
  const defaultTestResult = {
    tr_id: '',
    date: '',
    total: nullValue,
    abnormal: [],
  }
  if (record.rows.length <= 0) {
    return defaultTestResult
  }

  hemdate = record.rows[0].hemdate
  testdate = yield hospitalDB.Query(`SELECT TOP 1 report_dt AS resdt
                                     FROM TYHD_LAB_DATA AS labdata
                                     WHERE CAST(labdata.report_dt AS Date) <= @hemdate
                                      AND patient_id = @patientId
                                     ORDER BY labdata.report_dt DESC`, { hemdate, patientId })

  if (testdate.rows.length <= 0) {
    return defaultTestResult
  }

  let resdt = testdate.rows[0].resdt
  let resday = moment(resdt).format('YYYY-MM-DD')

  test = yield hospitalDB.Query(`SELECT * FROM (
                                  SELECT base_code AS testcode, base_ename AS testname, lab_result AS result,
                                    lab_unit AS unit, ISNULL(status,'0') AS status,
                                    ROW_NUMBER() OVER (PARTITION BY (base_code+base_ename) ORDER BY lab_no DESC) AS rn
                                  FROM TYHD_LAB_DATA
                                  WHERE CAST(report_dt AS Date) = @resday
                                    AND patient_id = @patientId
                                    AND lab_result IS NOT NULL
                                    AND ISNUMERIC(lab_result) = 1
                                 ) AS base WHERE rn = 1`, { resday, patientId })
  total = test.rows.length
  dialysis_test_result = {
    tr_id: `${patientId}+${resdt}`,
    date: resday,
    abnormal: [],
    critical: [],
  }

  for (let row of test.rows) {
    let { result, unit, status, testname, testcode } = row
    // status <0|1|2> <正常|異常|危急>
    const abnormalOrCritical = status == 1 ? 'abnormal' : (status == 2 ? 'critical' : null)
    if (abnormalOrCritical) {
      dialysis_test_result[abnormalOrCritical].push({
        name: testname,
        value: `${result} ${unit}`,
        ti_id: encodeURIComponent(`${testcode}@${testname}`),
      })
    }
    if (isNaN(parseInt(status))) {
      total -= 1
    }
  }
  dialysis_test_result.total = total
  return dialysis_test_result
}
