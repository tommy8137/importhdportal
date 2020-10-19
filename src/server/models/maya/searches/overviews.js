import moment from 'moment'
import { systemDB, hospitalDB } from 'server/helpers/database'
import { maybe } from 'maybes'
import { batchQuery } from 'server/helpers/database/postgres'
import { normalizr } from 'server/utils/normalizr'

export default class Overviews {
  static* getOverviews(shift = 'all', hemarea = 'all') {
    let today = moment().format('YYYY-MM-DD')
    let dbShift, totalNotCanceledAppointments, attended, not_attend, abnormals, categories
    let pie_chart = []
    dbShift = shift === -1 ? null : shift
    if (shift === 'all') {
      if (hemarea == 'all') {
        totalNotCanceledAppointments = yield hospitalDB.Query(
          `SELECT COUNT(*) AS count FROM TYHD_APPOINTMENT
           WHERE APP_DATE = @today AND CANCEL_FLAG = @notCanceled`, { notCanceled: 'N', today })
        attended = yield hospitalDB.Query(
          'SELECT PAT_NO, HD_STATUS FROM vi_TYHD_PAT_HD_MASTER WHERE HD_DATE = @today', { today })
      } else {
        totalNotCanceledAppointments = yield hospitalDB.Query(
          `SELECT COUNT(*) AS count FROM TYHD_APPOINTMENT
           WHERE APP_DATE = @today AND CANCEL_FLAG = @notCanceled
            AND LEFT(bed_no, 1) = @hemarea`, { notCanceled: 'N', today, hemarea })
        attended = yield hospitalDB.Query(
          `SELECT PAT_NO, HD_STATUS FROM vi_TYHD_PAT_HD_MASTER WHERE HD_DATE = @today
            AND LEFT(bed_no, 1) = @hemarea`, { today, hemarea })
      }
    } else {
      if (hemarea == 'all') {
        totalNotCanceledAppointments = yield hospitalDB.Query(
          `SELECT COUNT(*) AS count FROM TYHD_APPOINTMENT
           WHERE APP_PRIOD = @dbShift AND APP_DATE = @today
            AND CANCEL_FLAG = @notCanceled`, { notCanceled: 'N', dbShift, today })
        attended = yield hospitalDB.Query(
          `SELECT PAT_NO, HD_STATUS FROM vi_TYHD_PAT_HD_MASTER
           WHERE APP_PRIOD = @dbShift AND HD_DATE = @today`, { dbShift, today })
      } else {
        totalNotCanceledAppointments = yield hospitalDB.Query(
          `SELECT COUNT(*) AS count FROM TYHD_APPOINTMENT
           WHERE APP_PRIOD = @dbShift AND APP_DATE = @today
            AND CANCEL_FLAG = @notCanceled
            AND LEFT(bed_no, 1) = @hemarea`, { notCanceled: 'N', dbShift, today, hemarea })
        attended = yield hospitalDB.Query(
          `SELECT PAT_NO, HD_STATUS FROM vi_TYHD_PAT_HD_MASTER
           WHERE APP_PRIOD = @dbShift AND HD_DATE = @today
            AND LEFT(bed_no, 1) = @hemarea`, { dbShift, today, hemarea })
      }
    }

    totalNotCanceledAppointments = totalNotCanceledAppointments.rows[0].count
    if (totalNotCanceledAppointments === 0) {
      return { total: totalNotCanceledAppointments }
    }

    attended = attended.rows
    const dialysisingAttended =  attended.filter(a=> a.HD_STATUS == '透析中').map( a => { return a.PAT_NO })
    const attendedCount = attended.length
    not_attend = totalNotCanceledAppointments - attendedCount
    if (dialysisingAttended.length == 0 ) {
      return {
        normal: attendedCount,
        abnormal: 0,
        total: totalNotCanceledAppointments,
        attended: attendedCount,
        not_attend,
        pie_chart:[],
      }
    }

    const patNoSet = attended.reduce((prev, curr) => {
      return [...prev, curr.PAT_NO]
    }, [])

    // instead of sql to test easly
    const st_date = moment().subtract(150, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    const ed_date = moment().format('YYYY-MM-DD 23:59:59')
    abnormals = yield systemDB.Query(
      `SELECT * FROM
      (
       SELECT pno, ev_status, risk_time, rank() over (partition by pno,c_id ORDER BY sbp_time DESC)
       FROM webportal.risk
       WHERE sbp_time >= $1
        AND sbp_time <= $2 AND pno = ANY($3)
      ) t WHERE rank = 1 AND ev_status >= 0`, [st_date, ed_date, dialysisingAttended])

    categories = yield systemDB.Query(
      `SELECT * FROM
      (
       SELECT pno, ev_status, risk_time, type, rank() OVER (partition by pno,c_id ORDER BY sbp_time DESC)
       FROM webportal.risk
       WHERE sbp_time >= $1
         AND sbp_time <= $2
         AND c_id = 1 AND pno = ANY($3)
      ) t WHERE rank = 1 AND ev_status >= 0`, [st_date, ed_date, dialysisingAttended])

    let abnormalCount = 0
    for (let abnormal of abnormals.rows) {
      const { pno } = abnormal
      if (patNoSet.indexOf(pno) !== -1) {
        abnormalCount += 1
      }
    }

    let chartDetailCount = { upper : 0, middle: 0, lower:0 }
    let categoryCount = 0
    for (let cate of categories.rows) {
      const { pno, type } = cate
      if (patNoSet.indexOf(pno) !== -1 && type != '') {
        categoryCount += 1
        chartDetailCount[type] += 1
      }
    }

    const chart_detail = [
      { type: 'upper', number : chartDetailCount.upper },
      { type: 'middle', number : chartDetailCount.middle },
      { type: 'lower', number : chartDetailCount.lower },
    ]

    if (categoryCount > 0) {
      pie_chart.push({
        c_name: 'SBP',
        c_id: '1',
        number: categoryCount,
        chart_detail,
      })
    }
    return {
      normal: attendedCount - abnormalCount,
      abnormal: abnormalCount,
      total: totalNotCanceledAppointments,
      attended: attendedCount,
      not_attend,
      pie_chart,
    }
  }

  static* getAbnormals(shift = 'all', c_id = 'all', hemarea = 'all') { // c_id not woring now
    let today = moment().format('YYYY-MM-DD')
    let user, dbShift
    let abnormal_list = []
    dbShift = shift === -1 ? null : shift
    if (shift === 'all') {
      if (hemarea == 'all') {
        user = yield hospitalDB.Query(
          `SELECT TPHB.PAT_NAME_UNICODE, TPHB.BIRTH_DATE, TPHB.SEX, TPHB.PAT_NO, TPHM.BED_NO,
            LEFT(TPHM.BED_NO, 1) AS BED_AREA, TPHM.HDREC_ID, TPHM.HD_STATUS
           FROM vi_TYHD_PAT_HD_MASTER AS TPHM
           INNER JOIN TYHD_PAT_HD_BASE AS TPHB ON TPHB.PAT_NO = TPHM.PAT_NO
           WHERE TPHM.HD_DATE = @today AND TPHM.HDREC_ID IS NOT NULL
            AND TPHM.APP_PRIOD IS NOT NULL`, { today })
      } else {
        user = yield hospitalDB.Query(
          `SELECT TPHB.PAT_NAME_UNICODE, TPHB.BIRTH_DATE, TPHB.SEX, TPHB.PAT_NO, TPHM.BED_NO,
            LEFT(TPHM.BED_NO, 1) AS BED_AREA, TPHM.HDREC_ID, TPHM.HD_STATUS
           FROM  vi_TYHD_PAT_HD_MASTER AS TPHM
           INNER JOIN TYHD_PAT_HD_BASE AS TPHB ON TPHB.PAT_NO = TPHM.PAT_NO
           WHERE TPHM.HD_DATE = @today AND TPHM.HDREC_ID IS NOT NULL
            AND TPHM.APP_PRIOD IS NOT NULL AND LEFT(TPHM.BED_NO, 1) = @hemarea`, { today, hemarea })
      }
    } else {
      if (hemarea == 'all') {
        user = yield hospitalDB.Query(
          `SELECT TPHB.PAT_NAME_UNICODE, TPHB.BIRTH_DATE, TPHB.SEX, TPHB.PAT_NO, TPHM.BED_NO,
            LEFT(TPHM.BED_NO, 1) AS BED_AREA, TPHM.HDREC_ID, TPHM.HD_STATUS
           FROM TYHD_PAT_HD_BASE AS TPHB, vi_TYHD_PAT_HD_MASTER AS TPHM
           WHERE TPHB.PAT_NO = TPHM.PAT_NO AND TPHM.APP_PRIOD = @dbShift
            AND TPHM.HD_DATE = @today AND TPHM.HDREC_ID IS NOT NULL
            AND TPHM.APP_PRIOD IS NOT NULL`, { dbShift, today })
      } else {
        user = yield hospitalDB.Query(
          `SELECT TPHB.PAT_NAME_UNICODE, TPHB.BIRTH_DATE, TPHB.SEX, TPHB.PAT_NO, TPHM.BED_NO,
            LEFT(TPHM.BED_NO, 1) AS BED_AREA, TPHM.HDREC_ID, TPHM.HD_STATUS
           FROM TYHD_PAT_HD_BASE AS TPHB, vi_TYHD_PAT_HD_MASTER AS TPHM
           WHERE TPHB.PAT_NO = TPHM.PAT_NO AND TPHM.APP_PRIOD = @dbShift
            AND TPHM.HD_DATE = @today AND TPHM.HDREC_ID IS NOT NULL
            AND TPHM.APP_PRIOD IS NOT NULL AND LEFT(TPHM.BED_NO, 1) = @hemarea`, { dbShift, today, hemarea })
      }
    }
    let users = user.rows
    const dialysisingAttended = users.filter(u=> u.HD_STATUS == '透析中')
    if (dialysisingAttended.length == 0) {
      return { abnormal_list }
    }

    const patNoSet = dialysisingAttended.reduce((prev, curr) => {
      return [...prev, curr.PAT_NO]
    }, [])

    const st_date = moment().subtract(150, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    const ed_date = moment().format('YYYY-MM-DD 23:59:59')
    // Query issue when patNoSet.length is too large, the query will be stuck
    let category = yield batchQuery(function*(set) {
      return yield systemDB.Query(
        `
        SELECT * FROM
        (
         SELECT pno, hemno, c_id, type, ev_status, risk_time, sbp_time, rank() over (partition by pno,c_id order by sbp_time desc)
         FROM webportal.risk
         WHERE  sbp_time >= $1 AND sbp_time <= $2 AND  pno = ANY($3)
       ) t WHERE rank = 1 and ev_status >= 0
       `, [st_date, ed_date, set]
      )
    }, patNoSet, 50)
    const categories = category.rows
    users = normalizr(users, 'PAT_NO')
    for (let cate of categories) {
      const { c_id, pno, type, ev_status, sbp_time, risk_time } = cate
      const { BED_NO, SEX, BIRTH_DATE, PAT_NO, PAT_NAME_UNICODE, HDREC_ID, BED_AREA } = users[pno]
      abnormal_list.push({
        name: PAT_NAME_UNICODE,
        gender: SEX || '-',
        patient_id: PAT_NO,
        bed_no: BED_NO || '-',
        r_id: HDREC_ID,
        age: BIRTH_DATE ? moment().diff(moment(BIRTH_DATE, 'YYYYMMDD'), 'years') : -9527,
        risk_category: [{ c_id: String(c_id), c_name: 'SBP', type }],
        alarm_status: ev_status,
        hemarea : BED_AREA || '-',
        sbp_time: sbp_time || '-',
        risk_time: risk_time || '-',
      })
    }
    return { abnormal_list }
  }

  static getPredictDataAndLastTime(record, patient) {
    const nullValue = -9527
    let today = moment().format('YYYY-MM-DD')
    let lastTime = 0, dm = 0
    const { items } = record

    const sbpItem = items.filter(item => item.ri_id === 'sbp')
    if (sbpItem.length > 0) {
      const { data } = sbpItem[0]
      const lastDataTime = data.length ? data[data.length - 1].time : 0
      if (lastDataTime > lastTime) {
        lastTime = lastDataTime
      }
    }

    let patientData = {}

    for (let item of items) {
      let { data, ri_id } = item
      let lastData = data.length ? data.filter(d => d.time === lastTime && d.time !== 0) : null
      if (lastData !== null && lastData.length > 0) {
        let { value } = lastData[0]
        patientData[ri_id] = isNaN(Number(value)) ? nullValue : value
      }
    }

    const diseases = patient.diseases || []
    diseases.forEach(d => {
      if (d.d_id === 'dm') {
        dm = 1
      }
    })
    const { conductivity, uf, blood_flow, dia_flow, ns, sbp, total_uf, pre_dia_temp_value, deltadia_temp_value, target_uf, delta_bloodflow, delta_uf } = patientData
    const { age, gender } = patient
    const { temperature, dryweight, dialysis_year } = record

    const predictData =  {
      date: today,
      total_uf,
      age,
      temperature,
      dryweight,
      gender,
      conductivity,
      dia_temp_value: pre_dia_temp_value,
      uf,
      blood_flow,
      dia_flow,
      ns,
      dm,
      sbp,
      deltadia_temp_value,
      dialysis_year,
      target_uf,
      delta_bloodflow,
      delta_uf,
    }

    return { predictData, lastTime }
  }

  static checkVarRisk(lastTime, predictData, chartData, diffStart, diffEnd) {
    const sbp = predictData.sbp
    const { type, maxblood_lower } = tuningMaxbloodLower(sbp)
    for (let k in chartData.res_bp_variation) {
      if (k >= diffStart && k <= diffEnd  && (chartData.res_bp_variation[k].LB <= maxblood_lower)) {
        let min = parseInt(k) + 1
        return { type, risk_time : moment(lastTime).add(min, 'minutes').format('YYYY-MM-DD HH:mm:ss'), predict_sbp: chartData.res_bp_variation[k].LB }
      }
    }
    return {}
  }
}

export const tuningMaxbloodLower = (sbp) => {
  let maxblood_lower, tuningValue
  let type
  if (sbp > global.maxblood_upper) {
    tuningValue = tuningMaxbloodValue(sbp, global.config.maxblood_upper_tuning)
    type = 'upper'
  } else if (sbp < global.maxblood_lower){
    tuningValue = tuningMaxbloodValue(sbp, global.config.maxblood_lower_tuning)
    type = 'lower'
  } else {
    tuningValue = tuningMaxbloodValue(sbp, global.config.maxblood_middle_tuning)
    type = 'middle'
  }
  maxblood_lower = sbp - tuningValue
  return { type, maxblood_lower }
}

const tuningMaxbloodValue = (sbp, tun) => {
  if (tun.unit == '%') {
    return sbp * tun.value * 0.01
  } else {
    return tun.value
  }
}
