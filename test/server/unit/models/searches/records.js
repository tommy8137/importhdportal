import co from 'co'
import * as Records from 'server/models/maya/searches/records'
import { getSbpAlarm, getDialysisYear, postSelectVip } from 'server/models/maya/searches/records'
import * as Patients from 'server/models/maya/searches/patients'
import Protos from 'common/protos'
import { hospitalDB, systemDB } from 'server/helpers/database'
import moment from 'moment'
import sinon from 'sinon'
import * as Overview from 'server/models/maya/searches/overviews'
import * as Risks from 'server/models/maya/risks/risks'
import * as Validator from 'common/modules/sbp/validator'
import * as MayaAlarmSystem from 'server/models/maya/alarm-system'
const sandbox = sinon.sandbox.create()
const mockErrorMessage = 'mock error'

describe('[unit] The getRecords function in the Records modules', function() {
  const startDate = '2016-01-01'
  const endDate = moment().format('YYYY-MM-DD')
  // -----------------------------------------------------------------------------
  it('Test function without startDate, endDate, offset, limit', async () => {
    const result = await co(Records.default.getRecords('0001771067', startDate, endDate)) // 02000758
    try {
      Protos.RecordList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test hdrec_id which could not found reocrd', async () => {
    const result = await co(Records.default.getRecords('whatever'))
    try {
      Protos.RecordList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test function with with startDate, endDate, offset, limit', async () => {
    const result = await co(Records.default.getRecords('0001771067', '2016-06-01', '2016-06-05 23:59:53', 0 ,1)) // '02000758', '2016-05-01', '2016-05-01 23:59:53', 0 ,1
    try {
      Protos.RecordList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test patient have record with lab data', async () => {
    const result = await co(Records.default.getRecords('0001771067', startDate, endDate)) // 01070743
    try {
      Protos.RecordList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})


describe('[unit] The getRecord function in the Records modules', function() {
  // -----------------------------------------------------------------------------
  it('Test function with incorrect reocrd id', async () => {
    const result = await co(Records.default.getRecord('whatever', 'whatever'))
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test function with incorrect patient id', async () => {
    const result = await co(Records.default.getRecord('whatever', 'BF581AE739988F298D6E4424057F7098')) // 441D117E268E1A8E8E4DD8874A2C50FC
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test record which without temperature, dryweight', async () => {
    const result = await co(Records.default.getRecord('0001031329', '97EFD102E8B298AAA4AD5DCFE46D027E')) // '12873765', '00489771ECED540592F602C0D3201701'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test patient have record which st_time, ed_time is complete', async () => {
    const result = await co(Records.default.getRecord('0001031329', '97EFD102E8B298AAA4AD5DCFE46D027E')) // '05561860', '1C3E0712DAD69CA1D2308A133E201706'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record which st_time, ed_time is null', async () => {
    const result = await co(Records.default.getRecord('0001982205', '0010535CFF4DE9E8D0B1968CDDDF5B5C')) // '10196806', '006C6BEC2472796364B5665F8B9AC0A7'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  //  because there were happen this case at before data, so should mock st_time to null
  it('Test patient have record which st_time is null and ed_time is complete', async () => {
    const pat_no = '0001771067' // 05561860 old db data
    const hdrec_id = '016D5ECC554A27290115CA8F1F4AEAA9'  // 1C3E0712DAD69CA1D2308A133E201706 old db data
    const backData = await co(hospitalDB.Query(`SELECT st_time
                              FROM vi_TYHD_PAT_HD_MASTER
                             WHERE hdrec_id = '${hdrec_id}' AND pat_no = '${pat_no}'`))
    // mock data
    await co(hospitalDB.Query(`UPDATE vi_TYHD_PAT_HD_MASTER
                             SET st_time = ''
                            WHERE hdrec_id = '${hdrec_id}' AND pat_no = '${pat_no}'`))

    const result = await co(Records.default.getRecord(pat_no, hdrec_id))
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    } finally {
      // recovery data
      const st_time = backData.rows[0].st_time
      await co(hospitalDB.Query(`UPDATE vi_TYHD_PAT_HD_MASTER
                              SET st_time = '${st_time}'
                             WHERE hdrec_id = '${hdrec_id}' AND pat_no = '${pat_no}'`))
    }
  })
  // -----------------------------------------------------------------------------
  it('Test change minTime case which have vip data(cis table) before record(vi_TYHD_PAT_HD_MASTER)', async () => {
    // use this sql to found case -> select top 1 (m.st_date + ' ' +  m.st_time) as st, c.data_time as d, m.hdrec_id, m.pat_no from vi_TYHD_PAT_HD_MASTER m inner join tyhd_cis_data c on m.hdrec_id = c.hdrec_id and
    // (m.st_date + ' ' +  m.st_time) >=  replace(c.data_time, '/', '-') and c.time >=1
    const pat_no = '0000079877'
    const hdrec_id = '5CB690E9B29698B81E4E0BDBDFA87E6D'
    const backSqlCondition = `WHERE hdrec_id = '${hdrec_id}'
                              AND pat_no = '${pat_no}'
                              AND data_time = '2017/06/26 07:19:42'` // 02257322,99ED3035973958AA3F9CF4BA1334503B, 2016/08/05 17:08:54
    const backData = await co(hospitalDB.Query(`SELECT time
                                                  FROM TYHD_CIS_DATA
                                                ${backSqlCondition}`))
    // mock data where ${st_data st_time} in vi_TYHD_PAT_HD_MASTER is 2016-08-05 18:05
    await co(hospitalDB.Query(`UPDATE TYHD_CIS_DATA
                                SET time = '1'
                               ${backSqlCondition}`))
    const result = await co(Records.default.getRecord(pat_no, hdrec_id))
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }  finally {
      // recovery data
      const time = backData.rows[0].time
      await co(hospitalDB.Query(`UPDATE TYHD_CIS_DATA
                                  SET time = '${time}'
                                 ${backSqlCondition}`))
    }
  })
  // -----------------------------------------------------------------------------
  it('Test patient have record which have item of chart and text', async () => {
    const pat_no = '0000079877'
    const hdrec_id = '5CB690E9B29698B81E4E0BDBDFA87E6D'
    const data_time = '2017/06/26 11:28:02'// '2016/08/05 11:53:38'
    const sqlCondtion = `WHERE hdrec_id = '${hdrec_id}'
                           AND pat_no = '${pat_no}'
                           AND data_time = '${data_time}'`
    const backData = await co(hospitalDB.Query(`SELECT dialysate, injection_vol
                              FROM TYHD_CIS_DATA
                              ${sqlCondtion}
                             `))
    // mock data
    await co(hospitalDB.Query(`UPDATE TYHD_CIS_DATA
                             SET dialysate = '1', injection_vol = '1',
                                 ns = '50'
                             ${sqlCondtion}`))

    const result = await co(Records.default.getRecord(pat_no, hdrec_id))
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    } finally {
      // recovery data
      const dialysate = backData.rows[0].dialysate
      const injection_vol = backData.rows[0].injection_vol
      await co(hospitalDB.Query(`UPDATE TYHD_CIS_DATA
                              SET dialysate = '${dialysate}', injection_vol = '${injection_vol}'
                              ${sqlCondtion}`))
    }
  })

  it('Test function flow coverage of sbp_alarm = 1', async () => {
    const pat_no = '0000079877'
    const hdrec_id = '5CB690E9B29698B81E4E0BDBDFA87E6D'

    sandbox.stub(Records, 'getLastSbpAlarm').callsFake(vip => {
      return
    })
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
    sandbox.restore()
  })

  // select top 1  m.*, h.* from vi_tyhd_pat_hd_master as h inner join TYHD_PAT_HD_MEMO as m  on h.st_date + ' ' + h.st_time > m.record_date and m.hdrec_id = h.hdrec_id
  // -----------------------------------------------------------------------------
  it('Test patient have record which has nur event before dialysate', async () => {
    const result = await co(Records.default.getRecord('0001771067', '016D5ECC554A27290115CA8F1F4AEAA9')) // '23135274', '0066762A89C4A2F9D0F5E09CE2B5D13F'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record which has nur event when dialysate', async () => {
    const result = await co(Records.default.getRecord('0001786333', '22F3E5A029BB610013DD3CD255125A58')) // '17058123', '0045C9B97CD9B4746E1CAC7FE16AE2A2'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test patient have record which has nur event after dialysate', async () => {
    const result = await co(Records.default.getRecord('0001786333', '60EA601AF751216E70C7C8DBCDED0AC7')) // '03493090', 'E4E49356C943502A50BF871697BFACEE'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record which ev_type = 醫囑 in MEMO', async () => {
    const result = await co(Records.default.getRecord('0001786333', '60EA601AF751216E70C7C8DBCDED0AC7')) // '03493090', 'E4E49356C943502A50BF871697BFACEE'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record which ev_type != 醫囑 and ev_process!= \'\' in MEMO', async () => {
    const result = await co(Records.default.getRecord('0001786333', '60EA601AF751216E70C7C8DBCDED0AC7')) // '17058123', '0045C9B97CD9B4746E1CAC7FE16AE2A2'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test patient have record which  ev_type = 警報 in MEMO', async () => {
    const result = await co(Records.default.getRecord('0001267917', '0FEB69FE55446B7BDEB9B0BA69AAAB2D')) // '16947785', '0B8DE86BB5FB1F267F7CD8DF5DBA728C'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test patient have record which getPanels with other condition in MEMO', async () => {
    const result = await co(Records.default.getRecord('0001786333', '60EA601AF751216E70C7C8DBCDED0AC7')) // '06921059', '33874DC7C69C32BA33404FB945642816'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('coverage for sbp_alarm query', async () => {
    const result = await co(Records.default.getRecord('0001786333', '60EA601AF751216E70C7C8DBCDED0AC7', '1')) // '06921059', '33874DC7C69C32BA33404FB945642816'
    try {
      Protos.Record.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})

describe('[unit] The postSelectVip function in the Records modules', function() {
  // -----------------------------------------------------------------------------
  it('Test function with correct data', async () => {
    const testData = {
      rows : [
        {
          time :  1,
          data_time : '2016/05/01 12:11:11',
        },
        {
          time : 1,
          data_time : '2016/05/01 12:11:11',
        },
        {
          time : 0,
          data_time : '2016/05/01 12:11:12',
        },
        {
          time : 1,
          data_time : '2016-05-01 12:11:13',
        },
      ],
    }
    const expectData = {
      rows: [
        {
          time :  1,
          data_time : '2016/05/01 12:11:11',
        },
        {
          time : 1,
          data_time : '2016/05/01 12:11:11',
        },
      ],
    }
    const result = postSelectVip(testData)
    expect(result).toEqual(expectData)
  })
})

describe('[unit] The getDialysisYear function in the Records modules', function() {
  // -----------------------------------------------------------------------------
  it('Test function with correct data', async () => {
    const expectData = 1.09
    const result = getDialysisYear('2016-02-01', '2017-03-02')
    expect(result).toEqual(expectData)
  })
})

describe('[unit] The getSbpAlarm function in the Records modules', function() {
  // -----------------------------------------------------------------------------
  it('Test function with correct data', async () => {
    const items = [
      {
        'ri_id':'sbp', 'name':'SBP', 'unit':'mmHg', 'type':'chart',
        'data':[
          { 'time':1505086545000, 'value':120, 'status':0 },
          { 'time':1505090148000, 'value':120, 'status':0 },
          { 'time':1505091882000, 'value':120, 'status':0 },
          { 'time':1505095144000, 'value':120, 'status':0 },
          { 'time':1505098595000, 'value':120, 'status':0 },
        ],
      },
    ]
    const risk = [
      { 'ev_status':0, 'sbp_time':'2017-09-11 07:35:45', 'ev_time':'mock_error_time', 'record_date': '2017-09-11 09:38:42' },
      { 'ev_status':0, 'sbp_time':'2017-09-11 10:56:35', 'ev_time':'2017-09-11 08:38', 'record_date': '2017-09-11 09:39:08' },
    ]

    const nur = [
      { 'rectime':'2017-09-11 09:38:42', 'nurserec':'', 'symptom':'透析中無不適情形', 'ev_type':'問題', 'ev_time':'mock_error_time' },
      { 'rectime':'2017-09-11 09:39:08', 'nurserec':'雙重核對醫囑,透析機面板設定皆正確.', 'symptom':'', 'ev_type':'問題', 'ev_time':'2017-09-11 08:38' },
      { 'rectime':'2017-09-11 10:53:44', 'nurserec':'', 'symptom':'No specific discomfort. Vital sign stable. BS clear. Keep current management.', 'ev_type':'醫囑', 'ev_time':'2017-09-11 10:53' },
    ]

    const expectData = [
      { 'time':1505086545000, 'alarm_status':0, 'alarm_phrase':'透析中無不適情形', 'alarm_process':'', alarm_time:'', process_time : '' },
      { 'time':1505090148000, 'alarm_status':-9527, 'alarm_phrase':'', 'alarm_process':'', alarm_time:'', process_time : '' },
      { 'time':1505091882000, 'alarm_status':-9527, 'alarm_phrase':'', 'alarm_process':'', alarm_time:'', process_time : '' },
      { 'time':1505095144000, 'alarm_status':-9527, 'alarm_phrase':'', 'alarm_process':'', alarm_time:'', process_time : '' },
      { 'time':1505098595000, 'alarm_status':0, 'alarm_phrase':'', 'alarm_process':'雙重核對醫囑,透析機面板設定皆正確.', alarm_time:'08:38', process_time : '2017-09-11 08:38 AM'  },
    ]
    const result = getSbpAlarm({ items }, risk, nur)
    Protos.Record.response.encode({ sbp_alarm :result } ).toBuffer()
    expect(result).toEqual(expectData)
  })

  it('Test function with empty items', async () => {
    const items = []
    const risk = {}
    const nur = {}
    const expectData = []
    const result = getSbpAlarm({ items }, risk, nur)
    Protos.Record.response.encode({ sbp_alarm :result } ).toBuffer()
    expect(result).toEqual(expectData)
  })
})

describe('[unit] The getAlarm function in the Records modules', function() {
  // -----------------------------------------------------------------------------
  it('Test logical', async () => {
    const record = { a_alarm :1, blood_alarm:2, c_alarm:3, whatever: 4, goodjob: null }
    const result = Records.getAlarm(record)
    const expectData = 'a_alarm blood_alarm c_alarm '
    expect(result).toEqual(expectData)
  })
})

describe(`[unit] Test get sbpAlarm logical with sbp_alarm = 1 at the Records.default.getRecord modules which all extra-modules is mock,
   should accept by Protos or throw error`, function() {
  beforeEach(async function() {
    await co(systemDB.Query('TRUNCATE webportal.risk'))
  })
  afterAll(async function() {
    await co(systemDB.Query('TRUNCATE webportal.risk'))
  })
  const pat_no = '0000079877'
  const hdrec_id = '5CB690E9B29698B81E4E0BDBDFA87E6D'
  // hdrec_id,  hasRecord = true, sbpTimeExceedDuratoin = false, dataIsVailate = true, lastSbpHasRisk = true, protoExcption = false, sbpAlreadyPredict = false
  // -----------------------------------------------------------------------------
  it(`Test  hasSbpdata = true, sbpTimeExceedDuratoin = false, dataIsVailate = true,
     lastSbpHasRisk = true, protoException = false, sbpAlreadyPredict = false`, async () => {
    mockModulesCondition(hdrec_id)
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    Protos.Record.response.encode(result).toBuffer()
    sandbox.restore()
  })
  it(`Test logical hasSbpdata = false`, async () => {
    mockModulesCondition(hdrec_id, false)
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    Protos.Record.response.encode(result).toBuffer()
    sandbox.restore()
  })
  it(`Test logical sbpTimeExceedDuratoin = true`, async () => {
    mockModulesCondition(hdrec_id, true, true)
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    Protos.Record.response.encode(result).toBuffer()
    sandbox.restore()
  })
  it(`Test logical dataIsVailate = false`, async () => {
    mockModulesCondition(hdrec_id, true, false, false)
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    Protos.Record.response.encode(result).toBuffer()
    sandbox.restore()
  })
  it(`Test logical lastSbpHasRisk = false`, async () => {
    mockModulesCondition(hdrec_id, true, false, true, false)
    const result = await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    Protos.Record.response.encode(result).toBuffer()
    sandbox.restore()
  })

  it(`Test logical protoException = true`, async () => {
    try {
      mockModulesCondition(hdrec_id, true, false, true, true, true, false)
      await co(Records.default.getRecord(pat_no, hdrec_id, 1))
      sandbox.restore()
    } catch(e) {
      sandbox.restore()
      expect(e.message).toEqual(mockErrorMessage)
    }
  })

  it(`Test logical sbpAlreadyPredict = true`, async () => {
    mockModulesCondition(hdrec_id, true, false, true, true, false, true)
    await co(Records.default.getRecord(pat_no, hdrec_id, 1))
    sandbox.restore()
  })
})

// sbpAlreadyPredict for multi thread cross issue of risk schedule
const mockModulesCondition = (hdrec_id, hasSbpdata = true, sbpTimeExceedDuratoin = false, dataIsVailate = true,
   lastSbpHasRisk = true, protoException = false, sbpAlreadyPredict = false) => {
  sandbox.stub(Patients, 'convertDiseases').callsFake(() => {
    return 'whatever'
  })

  const lastTime = hasSbpdata == true ? moment().format('YYYY-MM-DD HH:mm:ss') : 0
  sandbox.stub(Overview.default, 'getPredictDataAndLastTime').callsFake(() => {
    return { predictData : { whatever : 'whatever' }, lastTime }
  })

  const diffMinute = sbpTimeExceedDuratoin ? 9999 : 1
  sandbox.stub(Math, 'ceil').callsFake(() => {
    return diffMinute
  })

  sandbox.stub(Overview.default, 'checkVarRisk').callsFake(() => {
    return lastSbpHasRisk == true ? { type : 'whatever', risk_time : moment().format('YYYY-MM-DD HH:mm:ss') } : {}
  })
  const mockToBuffer = protoException == true ? () => { throw new Error(mockErrorMessage) } :  () => 'whatever'
  sandbox.stub(Protos.BPVar.request, 'encode').callsFake(() => {
    return { toBuffer : mockToBuffer }
  })
  sandbox.stub(Protos, 'decode').callsFake(() => {
    return 'whatever'
  })

  sandbox.stub(Risks.default, 'getCharts').callsFake(() => {
    const mockGenerator = function* () {
      // Not good style to mock exception, please find other good function
      if (sbpAlreadyPredict) {
        yield co(systemDB.Query(`INSERT INTO webportal.risk (hemno, sbp_time) VALUES ('${hdrec_id}','${lastTime}')`))
      }
      return 'whatever'
    }
    return mockGenerator
  })
  sandbox.stub(Validator, 'isValidate').callsFake(function () {
    return dataIsVailate
  })

  sandbox.stub(MayaAlarmSystem.default, 'sendRisk').callsFake(() => {
    const mockGenerator = function* () {
    }
    return mockGenerator
  })

}
