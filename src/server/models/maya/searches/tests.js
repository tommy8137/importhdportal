import moment from 'moment'
import { hospitalDB } from 'server/helpers/database'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import R from 'ramda'
const validateInteger = (num) => R.isNil(num) || /^[0-9]+$/.test(num)

export default class Tests {
  static* getTestItems(patientId, itemId, startDate, endDate, offset, limit) {
    let dbStartDate, dbEndDate, dbOffset, dbLimit, itemName
    if (!validateInteger(limit)
      || !validateInteger(offset)) {
      throwApiError('Invalid parameter', errorCode.ACCESS_DENY)
    }

    const itemInfo = itemId.split('@')
    try {
      if (itemInfo[0] === itemId) {
        throw 'WRONG PARAMTERS'
      } else {
        [itemId, itemName] = itemInfo
      }
    } catch (err) {
      throwApiError(err, errorCode.URL_VAR_NULL)
    }

    dbStartDate = startDate ? moment(startDate).format('YYYY-MM-DD') : '1970-01-01'
    dbEndDate = moment(endDate).format('YYYY-MM-DD')
    dbOffset = (offset >= 0) ? Number(offset) : 0
    dbLimit = (limit > 0) ? Number(limit) : 0
    let results = []
    let total = yield hospitalDB.Query(
      `SELECT COUNT(DISTINCT(CAST(report_dt AS Date))) AS count
      FROM TYHD_LAB_DATA
      WHERE patient_id = @patientId
      AND base_code = @itemId
      AND base_ename = @itemName
      AND CAST(report_dt AS Date) >= @dbStartDate
      AND CAST(report_dt AS Date) <= @dbEndDate
      AND ISNUMERIC(lab_result) = 1`,
      { patientId, itemId, itemName, dbStartDate, dbEndDate }
    )

    const total_nums = total.rows[0].count
    let lower = dbOffset
    let upper = dbOffset + dbLimit
    let testItems = yield hospitalDB.Query(
      `SELECT * FROM
       (
         SELECT *, ROW_NUMBER() OVER(order by report_dt) as num  FROM
         (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY CAST(report_dt AS Date) ORDER BY lab_no DESC) AS rn
            FROM TYHD_LAB_DATA
          WHERE patient_id = @patientId
            AND base_code = @itemId
            AND base_ename = @itemName
            AND CAST(report_dt AS Date) >= @dbStartDate
            AND CAST(report_dt AS Date) <= @dbEndDate
            AND ISNUMERIC(lab_result) = 1
         ) AS tmp WHERE rn = 1
       ) AS tmp1 WHERE num > ${lower} AND num <= ${upper}`,
      { patientId, itemId, itemName, dbStartDate, dbEndDate }
    )

    for (let testItem of testItems.rows) {
      const { report_dt, lab_result } = testItem
      let value = Number(lab_result)
      if(isNaN(value))
        value = 0
      let date = moment(report_dt).format('YYYY-MM-DD')
      results.push({
        tr_id: `${patientId}+${report_dt}`,
        date,
        value,
      })
    }

    return {
      total_nums,
      results,
    }
  }

  static* getTestResults(patientId, startDate, endDate, offset, limit) {
    if (!validateInteger(limit)
      || !validateInteger(offset)) {
      throwApiError('Invalid parameter', errorCode.ACCESS_DENY)
    }
    let dbStartDate, dbEndDate, dbOffset, dbLimit
    dbStartDate =  startDate ? moment(startDate).format('YYYY-MM-DD') : '1970-01-01'
    dbEndDate = endDate ? moment(endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
    dbOffset = (offset > 0) ? Number(offset) : 0
    dbLimit = (limit > 0) ? Number(limit) : 0

    let lower = dbOffset
    let upper = dbOffset + dbLimit

    let results, total_nums, tests = []
    let result_list = yield hospitalDB.Query(
      `
      SELECT * FROM
      (
        SELECT DISTINCT report_dt, ROW_NUMBER() OVER(order by report_dt DESC) as num
        FROM TYHD_LAB_DATA
        WHERE patient_id = @patientId
          AND CAST(report_dt AS Date) >= @dbStartDate
          AND CAST(report_dt AS Date) <= @dbEndDate
      ) as tmp
      WHERE num > ${lower} AND num <= ${upper}`,
      { patientId, dbStartDate, dbEndDate }
    )

    total_nums = yield hospitalDB.Query(
      `SELECT DISTINCT report_dt
      FROM TYHD_LAB_DATA
      WHERE patient_id = @patientId
      AND CAST(report_dt AS Date) >= @dbStartDate
      AND CAST(report_dt AS Date) <= @dbEndDate`,
      { patientId, dbStartDate, dbEndDate }
    )

    const resultLists = result_list.rows
    if (resultLists.length === 0) {
      results = {
        total_nums: 0,
        tests: [],
      }
    } else {
      for (let result of resultLists) {
        let reportDate = result.report_dt
        let date = moment(reportDate).format('YYYY-MM-DD')
        tests.push({
          tr_id: `${patientId}+${reportDate}`,
          date,
        })
      }

      results = {
        total_nums: total_nums.rows.length,
        tests,
      }
    }

    return results
  }

  static* getTestResult(patientId, resultId) {
    let results = [], returnResult
    try {
      let reg = /^[A-Za-z0-9]+[+]\d+/
      if (!reg.test(resultId)) {
        throw 'WRONG PARAMTERS'
      }
    } catch (err) {
      throwApiError(err, errorCode.URL_VAR_NULL)
    }
    const reportDate = moment(resultId.split('+')[1]).format('YYYY-MM-DD')
    let tests = yield hospitalDB.Query(
      `SELECT *
        FROM TYHD_LAB_DATA
       WHERE patient_id = @patientId
        AND CAST(report_dt AS DATE) = @reportDate
        AND ISNUMERIC(lab_result) = 1
       ORDER BY report_dt DESC, lab_no DESC`,
      { patientId, reportDate }
    )
    // fetch latest record of labdata through report_dt, lab_no DESC
    tests = tests.rows
    let tiIds = [], uniqueTests = []
    for (let test of tests) {
      const tiId = `${test.base_code}@${test.base_ename}`
      if (tiIds.indexOf(tiId) === -1) {
        tiIds.push(tiId)
        uniqueTests.push(test)
      }
    }

    if (tests.length === 0) {
      returnResult = {
        tr_id: resultId,
        date: reportDate,
        results,
      }
    } else {
      let tendency = 0
      for (let test of uniqueTests) {
        let { base_code, lab_result, base_ename, lab_unit, report_dt, status } = test
        let latestTest = yield hospitalDB.Query(
          `SELECT TOP 1 lab_result
          FROM TYHD_LAB_DATA
          WHERE patient_id = @patientId
          AND CAST(report_dt AS DATE) < CAST(@report_dt AS DATE)
          AND base_code = @base_code
          AND base_ename = @base_ename
          ORDER BY report_dt DESC, lab_no DESC`,
          { patientId, report_dt, base_code, base_ename }
        )

        if (latestTest.rows.length > 0) {
          const latestlabResult = Number(latestTest.rows[0].lab_result)

          const labResult = Number(lab_result)
          if(isNaN(Number(lab_result))) {
            lab_result = '0'
          }
          tendency = labResult < latestlabResult ? 3 : (labResult > latestlabResult ? 1 : 2)
        }

        if (base_code && base_ename) {
          results.push({
            name: base_ename,
            ti_id: encodeURIComponent(`${base_code}@${base_ename}`),
            value: lab_result,
            unit: lab_unit || '-',
            standard: '-',
            status: isNaN(parseInt(status)) ?  3 : parseInt(status), // if null or undefined set to 3
            tendency,
          })
        }
      }

      returnResult = {
        tr_id: resultId,
        date: reportDate,
        results,
      }
    }

    return returnResult
  }
}
