import co from 'co'
import Protos from 'common/protos'
import { hospitalDB } from 'server/helpers/database'
import Schedules from 'server/models/maya/searches/schedules'
import { errorCode } from 'server/helpers/api-error-helper'

describe('[unit] The getSchedules function in the Schedules modules', function() {
  // startDate, endDate, offset, limit, sort
  it('Test function with invalid parameter', async () => {
    const expectError = new Error('Invalid parameter')
    expectError.code = errorCode.ACCESS_DENY
    try {
      await co(Schedules.getSchedules('whatever'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
    try {
      await co(Schedules.getSchedules(null, 'whatever'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
    try {
      await co(Schedules.getSchedules(null, null, 'whatever'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
    try {
      await co(Schedules.getSchedules(null, null, null, 'whatever'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }

    try {
      await co(Schedules.getSchedules(null, null, null, null, 'whatever'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })

  it('Test function without parameter', async () => {
    const result = await co(Schedules.getSchedules('2016-08-02', '2016-08-02'))
    try {
      Protos.Schedule.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  it('Test function with different parameter for sql query condition', async () => {
    // encodeURI
    const result = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'date', encodeURI('游○○')))
    // order by
    const result1 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'date', encodeURI('0001815362'))) // 01178031
    const result2 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'name', encodeURI('0001815362')))
    const result3 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'gender', encodeURI('0001815362')))
    const result4 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'patient_id', encodeURI('0001815362')))
    const result5 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'bed_no', encodeURI('0001815362')))
    const result6 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'schedule', encodeURI('0001815362')))
    const result7 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, 'progress', encodeURI('0001815362')))
    // sort
    const result8 = await co(Schedules.getSchedules('2016-08-02', '2016-08-02', 1, 1, '-date', encodeURI('0001815362')))
    try {
      Protos.Schedule.response.encode(result).toBuffer()
      Protos.Schedule.response.encode(result1).toBuffer()
      Protos.Schedule.response.encode(result2).toBuffer()
      Protos.Schedule.response.encode(result3).toBuffer()
      Protos.Schedule.response.encode(result4).toBuffer()
      Protos.Schedule.response.encode(result5).toBuffer()
      Protos.Schedule.response.encode(result6).toBuffer()
      Protos.Schedule.response.encode(result7).toBuffer()
      Protos.Schedule.response.encode(result8).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  it('Test convert user hd_status into our custom information', async () => {
    // 透析結束 透析中 已報到
    const result = await co(Schedules.getSchedules('2016-06-08', '2016-06-08', 0, 1, 'date', encodeURI('0001038654')))
    // 0006B730D36326D9292AC58382CBDFA3
    const result1 = await co(Schedules.getSchedules('2017-06-07', '2017-06-07', 0, 1, 'date', encodeURI('0001273157')))
    // 03CF414D1D04A9012FCE84948347C9A9
    const result2 = await co(Schedules.getSchedules('2016-08-02', '2017-08-02', 0, 1, 'date', encodeURI('0001551072')))
    try {
      Protos.Schedule.response.encode(result).toBuffer()
      Protos.Schedule.response.encode(result1).toBuffer()
      Protos.Schedule.response.encode(result2).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  it(`Test unexpected condition which sex, BED_NO is empty, and there shouldn't happend in current database`, async () => {
    const hdrec_id = '0007A88E16092910996AADFDC1A0CB39'
    const pat_no = '0001038654'
    const hd_date = '2016-06-08'
    const backData = await co(hospitalDB.Query(`SELECT record.bed_no, pat.sex
                                                  FROM vi_TYHD_PAT_HD_MASTER record
                                                 INNER JOIN TYHD_PAT_HD_BASE pat
                                                 ON pat.pat_no = '${pat_no}'
                                                 WHERE hdrec_id = '${hdrec_id}'`))


    await co(hospitalDB.Query(`UPDATE vi_TYHD_PAT_HD_MASTER
                               SET bed_no = ''
                              WHERE hdrec_id = '${hdrec_id}' AND pat_no = '${pat_no}'`))
    await co(hospitalDB.Query(`UPDATE TYHD_PAT_HD_BASE
                               SET sex = ''
                              WHERE pat_no = '${pat_no}'`))

    const result = await co(Schedules.getSchedules(hd_date, hd_date, 0, 1, 'date', encodeURI(pat_no)))
    try {
      Protos.Schedule.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    } finally {
      // recovery data
      const bed_no = backData.rows[0].bed_no
      const sex = backData.rows[0].sex
      await co(hospitalDB.Query(`UPDATE vi_TYHD_PAT_HD_MASTER
                                 SET bed_no = '${bed_no}'
                                WHERE hdrec_id = '${hdrec_id}' AND pat_no = '${pat_no}'`))
      await co(hospitalDB.Query(`UPDATE TYHD_PAT_HD_BASE
                                 SET sex = '${sex}'
                                WHERE pat_no = '${pat_no}'`))
    }
  })
})
