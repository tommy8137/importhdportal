import co from 'co'
import Protos from 'common/protos'
import Tests from 'server/models/maya/searches/tests'
import { errorCode } from 'server/helpers/api-error-helper'
import { hospitalDB } from 'server/helpers/database'

describe('[unit] The getTestItems in the Tests modules', function() {
  it('Test function with incorrect parameter', async () => {
    const expectError = new Error('WRONG PARAMTERS')
    expectError.code = errorCode.URL_VAR_NULL
    try {
      await co(Tests.getTestItems('whatever', 'erro_item_type qqq', 'whatever', 'whatever',  0, 0))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test function with different parameter', async () => {
    // '05293201', 'FHEHB@Hb', 2016-02-03, '2016-06-09'
    const result = await co(Tests.getTestItems('0001786333', '1022019@Basophile', '2017-05-22', '2017-05-30', 0, 0))
    const result1 = await co(Tests.getTestItems('0001786333', '1022019@Basophile', '2017-05-22', '2017-05-30', 1, 1))
    const result2 = await co(Tests.getTestItems('0001786333', '1022019@Basophile', '2017-05-22', '2017-05-30', 0, 1))
    const result3 = await co(Tests.getTestItems('0001786333', '1022019@Basophile', null, '2017-05-30', 0, 1))
    try {
      Protos.Item.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
    try {
      Protos.Item.response.encode(result1).toBuffer()
    } catch(e) {
      expect(e).toEqual(result1)
    }
    try {
      Protos.Item.response.encode(result2).toBuffer()
    } catch(e) {
      expect(e).toEqual(result2)
    }

    try {
      Protos.Item.response.encode(result3).toBuffer()
    } catch(e) {
      expect(e).toEqual(result3)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test the outdated case of testItem ', async () => {
    // '09121628', 'FRCCPK@CPK', '2016-06-07', '2016-06-07', 0, 0
    const result = await co(Tests.getTestItems('0000033417', '09002@BUN血中尿素氮', '2016-12-25', '2017-01-04', 0, 0)) // 2017-01-04 is the case
    try {
      Protos.Item.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })
})

describe('[unit] The getTestResults in the Tests modules', function() {
  it('Test function without parameter [startDate, endDate, offset, limit]', async () => {
    const result = await co(Tests.getTestResults('0000033417'))
    try {
      Protos.ResultList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  it('Test patient have test result', async () => {
    const result = await co(Tests.getTestResults('0000033417', '2017-01-04', '2017-01-04', 1, 10))
    try {
      Protos.ResultList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  it('Test result list is null', async () => {
    const result = await co(Tests.getTestResults('whatever'))
    try {
      Protos.ResultList.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })
})

describe('[unit] The getTestResult in the Tests modules', function() {
  it('Test function with incorrect parameter', async () => {
    const expectError = new Error('WRONG PARAMTERS')
    expectError.code = errorCode.URL_VAR_NULL
    try {
      await co(Tests.getTestResult('whatever', 'erro_item_type qqq'))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test empty testResult by fake patientId', async () => {
    const result = await co(Tests.getTestResult('whatever', '0000033417+20170419'))
    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test tendency is \'1\' (up) ', async () => {
    // '01947751', '01947751+20160720'
    const result = await co(Tests.getTestResult('0000033417', '0000033417+20170419'))
    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })


  // -----------------------------------------------------------------------------
  it('Test tendency is \'2\' (equal)', async () => {
    // '01947751', '01947751+20160615'
    const result = await co(Tests.getTestResult('0000033417', '0000033417+20170405'))
    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test tendency is \'3\' (down)', async () => {
    // '01947751', '01947751+20160817'
    const result = await co(Tests.getTestResult('0000033417', '0000033417+20170405'))
    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test lab_unit is \'\' ', async () => {
    // '18757998', '01947751+20161018'
    const result = await co(Tests.getTestResult('0000033417', '0000033417+20170405'))
    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test extra-mechanism to avoid the status is null which would not happen in maya system', async () => {

    const patient_id = '0000033417'
    const report_dt = '20170104'
    const backSqlCondition = `WHERE patient_id = '${patient_id}'
                                AND report_dt = '${report_dt}'
                                AND ISNUMERIC(lab_result) = 1`
    const backData = await co(hospitalDB.Query(`SELECT *
                                                  FROM TYHD_LAB_DATA
                                                ${backSqlCondition} ORDER BY report_dt DESC`))
    // mock data
    await co(hospitalDB.Query(`UPDATE TYHD_LAB_DATA
                                SET status = NULL
                              ${backSqlCondition}`))
    const result = await co(Tests.getTestResult(patient_id, `${patient_id}+${report_dt}`))

    try {
      Protos.Result.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toEqual(result)
    } finally {
      const status = backData.rows[0].status
      if (status != null) {
        await co(hospitalDB.Query(`UPDATE TYHD_LAB_DATA
                                    SET status = '${status}'
                                  ${backSqlCondition}`))
      }
    }
  })
})
