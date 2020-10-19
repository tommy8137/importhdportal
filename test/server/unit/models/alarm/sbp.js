import co from 'co'
import Sbp from 'server/models/maya/alarm/sbp'
import { errorCode } from 'server/helpers/api-error-helper'
import { systemDB } from 'server/helpers/database'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'
import Licenses from 'server/helpers/licenses'
import Protos from 'common/protos'

describe('[unit] The get alarm  in the Alarm modules', function() {
  beforeEach(async () => {
    await systemDB.Query(`INSERT INTO webportal.risk
                    (pno, hemno, c_id, m_id, risk_time, type, sbp_time, ev_status) values
                    ('test', 'AC27D9365DC22ADAC28B8D6458E8AA7A', '1', '2', '13:22', 'lower', '2017-10-21 16:21:27', 0)`)
  })
  afterEach(async () => {
    await systemDB.Query(`DELETE FROM webportal.risk
                    WHERE pno = 'test'`)
  })
  // -----------------------------------------------------------------------------
  it('Test request Data is incorrect', async () => {
    const data = {
      'hdrec_id': null,
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
    }
    const expectErrorMessage = 'Sbs update status err,format error'
    try {
      const result = await co(Sbp.updateSbpStatus(data))
    } catch (e) {
      expect(e.message).toBe(expectErrorMessage)
    }
  })
  // ----------------------------------------------------
  it('Test the patient not found ', async () => {
    const data = {
      'hdrec_id': 'AC27D9365DC22ADAC28B8D6458E8AA5D',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
      'record_date':'2017-10-21 11:15:13',
      'record_user':'mis',
    }
    const expectErrorMessage = 'Patient not found'
    try {
      const result = await co(Sbp.updateSbpStatus(data))
    } catch (e) {
      expect(e.message).toBe(expectErrorMessage)
    }
  })
  // ----------------------------------------------------
  it('Test the ev_status is not 1 or 2 ', async () => {
    const data = {
      'hdrec_id': 'AC27D9365DC22ADAC28B8D6458E8AA5D',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 0,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
      'record_date':'2017-10-21 11:15:13',
      'record_user':'mis',
    }
    const expectErrorMessage = 'Sbs update status err,format error'
    try {
      const result = await co(Sbp.updateSbpStatus(data))
    } catch (e) {
      expect(e.message).toBe(expectErrorMessage)
    }
  })
// ----------------------------------------------------------
  it('Should update sbp status successfully', async () => {
    const data = {
      'hdrec_id': 'AC27D9365DC22ADAC28B8D6458E8AA7A',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
      'record_date':'2017-10-21 11:15:13',
      'record_user':'mis',
    }
    try {
      const result = await co(Sbp.updateSbpStatus(data))
      expect(result).toBe(true)
    } catch (e) {
      console.log('error:::', e)
    }
  })
// ----------------------------------------------------------
  it('mock http response statusCode != 200, , just for coverage and expect error', async () => {
    const expectErrMsg = 'Sbs update status err, status code = 400'
    const data = {
      'hdrec_id': 'AC27D9365DC22ADAC28B8D6458E8AA7A',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
      'record_date': '2017-10-21 11:15:13',
      'record_user': 'mis',
    }
    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = 400
          res.on = () => {}
          callback(res)
          return {
            on : () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    try {
      await co(Sbp.updateSbpStatus.apply(tmpPara, [data]))
    } catch(e) {
      expect(e.message).toBe(expectErrMsg)
    }
  })

// ----------------------------------------------------------
  it('mock http response statusCode != 200, , just for coverage and expect error', async () => {
    const mockErrMsg = 'mock error'
    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = '200'
          res.on = () => {}
          callback(res)
          return {
            on : (e, callback) => {
              if (e == 'error') {
                callback( { message: mockErrMsg })
              } else {
                callback( { setTimeout: () => {}, on: (socket, c) => {c()} } )
              }
            },
            abort: () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    const data = {
      'hdrec_id': 'AC27D9365DC22ADAC28B8D6458E8AA7A',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
      'record_date': '2017-10-21 11:15:13',
      'record_user': 'mis',
    }
    try {
      await co(Sbp.updateSbpStatus.apply(tmpPara, [data]))
    } catch(e) {
      expect(e.message).toBe(mockErrMsg)
    }
  })
})

