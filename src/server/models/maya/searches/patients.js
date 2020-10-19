import moment from 'moment'
import { hospitalDB, systemDB } from 'server/helpers/database/'

const mayaDiseases = {
  DISEASE_1: '糖尿病',
  DISEASE_2: '高血壓',
  DISEASE_3: '心臟病',
  DISEASE_4: '腦血管病變',
  DISEASE_5: '慢性肝疾病',
  DISEASE_6: '結核',
  DISEASE_7: '惡性腫瘤',
  DISEASE_8: 'other',
}

export default class Patients {
  static *getPatients(patientId) {
    let ret, result = {}
    ret = yield hospitalDB.Query(`SELECT PAT_NO AS pno, PAT_NAME_UNICODE AS name, convert(datetime,BIRTH_DATE,112) AS birth, SEX AS sex,DISEASE_1, DISEASE_2, DISEASE_3, DISEASE_4,
                                    DISEASE_5, DISEASE_6, DISEASE_7, DISEASE_8
                                  FROM TYHD_PAT_HD_BASE
                                  WHERE PAT_NO=@patientId`, { patientId })
    const today = moment().format('YYYY-MM-DD')
    let hembed = yield hospitalDB.Query(`SELECT TOP 1 BED_NO AS hembed
                                         FROM vi_TYHD_PAT_HD_MASTER
                                         WHERE PAT_NO =@patientId and hd_date <= @today
                                         ORDER BY hd_date DESC`, { patientId, today })

    if (ret.rows.length <= 0)
      return result

    let patient_info = ret.rows[0]
    let disease_info = convertDiseases(patient_info)

    result = {
      'name' : patient_info.name,
      'patient_id' : (patient_info.pno).toString(),
      'gender' : patient_info.sex,
      'bed_no' : hembed.rows[0].hembed,
      'age' : moment().diff(moment(patient_info.birth, 'YYYYMMDD'), 'years'),
      'diseases' : disease_info,
    }

    return result
  }

  static* getRisks(patientId, recordId) {
    let hdStatus = yield hospitalDB.Query(`
      SELECT hd_status FROM vi_TYHD_PAT_HD_MASTER WHERE hd_status = '透析中'
        AND pat_no = @patientId AND hdrec_id = @recordId `, { patientId, recordId })

    if (hdStatus.rows.length == 0) {
      return { risk_summary: [] }
    }

    // instead of sql to test easly
    const st_date = moment().subtract(150, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    const ed_date = moment().format('YYYY-MM-DD 23:59:59')
    let mIds = yield systemDB.Query(
      `
      SELECT * FROM
      (
       SELECT m_id, risk_time, type,  ev_status
       FROM webportal.risk
       WHERE pno = $1 AND hemno = $2 AND c_id = 1
        AND sbp_time >= $3
        AND sbp_time <= $4
        ORDER BY sbp_time DESC LIMIT 1
      ) t WHERE ev_status >= 0`,
      [patientId, recordId, st_date, ed_date]
    )

    mIds = mIds.rows
    if (mIds.length === 0) {
      return { risk_summary: [] }
    }

    const risks = {
      risk_summary: [{
        category: 'BP',
        c_id: '1',
        module: [],
      }],
    }

    const module = risks.risk_summary[0].module
    for (let mId of mIds) {
      const { m_id, risk_time, type, ev_status } = mId
      if (m_id == 2) {
        module.push({ m_id: '2', m_name: 'Range', risk_time : moment(risk_time).format('HH:mm'), type, alarm_status : ev_status })
      }

      // if(m_id == 3) {
      //   module.push({ m_id: '3', m_name: 'Probability' })
      // }

      // if(m_id == 4) {
      //   module.push({ m_id: '4', m_name: 'Estimation' })
      // }
    }
    return risks
  }
}

export const convertDiseases = (patient_info) => {
  let result = []
  for(let i in patient_info) {
    if (String(i).startsWith('DISEASE_') && patient_info[i] == 'Y') {
      if (i == 'DISEASE_1') {
        result.push({
          'd_id': 'dm',
          'd_name': mayaDiseases[i],
        })
      } else {
        result.push({
          'd_id': i,
          'd_name': mayaDiseases[i],
        })
      }
    }
  }
  return result
}
