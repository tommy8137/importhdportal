import co from 'co'
import Patients, { convertDiseases } from 'server/models/maya/searches/patients.js'
import Protos from 'common/protos'
import { systemDB } from 'server/helpers/database'
import moment from 'moment'

describe('[unit] The getPatients function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  it('Test patient have no record in vi_TYHD_PAT_HD_MASTER', async () => {
    const result = await co(Patients.getPatients('whatever'))
    try {
      Protos.Patient.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record', async () => {
    const result = await co(Patients.getPatients('0001521343'))
    try {
      Protos.Patient.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})

describe('[unit] The getRisks function in the Patients modules', function() {
  beforeAll(function () {
    const date = moment().format('YYYY-MM-DD hh:mm:ss')
    systemDB.Query(`INSERT INTO webportal.risk
                    (pno, hemno, c_id, m_id, risk_time, type, sbp_time, ev_status) values
                    ('test', 'test', '1', '2', '13:22', 'lower', '${date}', 0)`)
  })
  afterAll(function() {
    systemDB.Query(`DELETE FROM webportal.risk
                    WHERE pno = 'test'`)
  })

  // -----------------------------------------------------------------------------
  it('Test patient have no risk', async () => {
    const result = await co(Patients.getRisks('whatever', 'whatever'))
    try {
      Protos.RiskSummary.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have risk', async () => {
    const result = await co(Patients.getRisks('test', 'test'))
    try {
      Protos.RiskSummary.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})

describe('[unit] The convertDisease function in the Patients modules', function() {
  it('Test function with correct data', async () => {
    const patient_info = {
      QOO : '',
      FKK : '',
      DISEASE_1 : 'Y',
      DISEASE_8 : 'Y',
      XXX: '',
    }
    const result = convertDiseases(patient_info)
    try {
      expect(result.length).toBe(2)
      expect(result[0].d_id).toBe('dm')
      expect(result[0].d_name).toBe('糖尿病')
      expect(result[1].d_id).toBe('DISEASE_8')
      expect(result[1].d_name).toBe('other')
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})
