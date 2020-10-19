import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'

import moment from 'moment'

const chartSelector = createSelector(
  (state) => state.patient.get('record').get('exam').get('itemsListKeys'),
  (state) => state.patient.get('record').get('exam').get('itemsListDetails'),
  (keys, details) => {
    const value = []
    const date = []

    if (keys) {
      keys.forEach((trId) => {
        value.push(details.get(trId).get('value'))
        date.push(moment(details.get(trId).get('date')).valueOf())
      })
    }

    return { value, date, trIds: keys }
  }
)

const tableSelctor = createSelector(
  (state) => state.patient.get('record').get('exam').get('reportKeys'),
  (state) => state.patient.get('record').get('exam').get('reportDetails'),
  (keys, details) => (keys && keys.map((v) => details.get(v)))
)

export const selector = createSelector(
  (state) => state.patient.get('record').get('exam'),
  chartSelector,
  tableSelctor,
  localeSelector,
  (exam, chartData, tableData, l) => {
    const selectedTestItem =
      (tableData && tableData.size && tableData.size > 0 && exam) ?
      tableData.filter((data) => data.get('ti_id') === exam.get('tiId')) : null
    const status =
      (selectedTestItem && selectedTestItem.size && selectedTestItem.get(0) && selectedTestItem.get(0).get('status')) ?
      selectedTestItem.get(0).get('status') : 0
    return ({
      trId: exam.get('trId'),
      date: exam.get('date') ? moment(exam.get('date'), 'YYYY-MM-DD HH:mm:ss').valueOf() : null,
      tiId: exam.get('tiId'),
      tiName: exam.get('tiName'),
      tiUnit: exam.get('tiUnit'),
      tableData,
      chartData,
      status,
      display: !(exam.get('isTrDateInvalid') || exam.get('isTiListInvalid')),
      l,
    })
  }
)

//-----------------------------------------------------------------------------
// selector for sagas getting tr_id and ti_id
// defaultTrId: provide by record (redux store)
// trId: provide by Router.query
//-----------------------------------------------------------------------------
export const trIdSelector = createSelector(
  (state) => state.routing.locationBeforeTransitions.query,
  (state) => state.patient.get('record'),
  ({ tr_id }, record) => {
    let defaultTrId = null
    if (record.get('result').size > 0) {
      const r_id = record.get('record_id')
      const entities = record.get('entities')
      if (r_id &&
        entities.findKey((value, key) => (key === r_id)) &&
        entities.get(r_id).findKey((value, key) => (key === 'tr_id'))) {
        defaultTrId = entities.get(r_id).get('tr_id')
      }

      if (!tr_id) {
        // not provide by query, search in reducer
        tr_id = entities.get(r_id).get('tr_id')
        if (tr_id == '') {
          tr_id = undefined
        }
      }
    }

    // provide by query
    return { tr_id, defaultTrId }
  }
)

const isTiIdInvalid = (tiIds, tiId) => (tiIds.indexOf(tiId) === -1)


export const tiIdSelector = createSelector(
  (state) => state.routing.locationBeforeTransitions.query,
  (state) => state.patient.get('record').get('exam'),
  ({ ti_id }, exam) => {
    let isTrDateInvalid = true
    let isTiListInvalid = true
    let date = null
    if (exam && exam.findKey((value, key) => (key === 'date'))) {
      date = exam.get('date')
      isTrDateInvalid = false
    }

    let tiName = null
    let tiUnit = null
    if (exam &&
        exam.findKey((value, key) => (key === 'reportKeys')) &&
        exam.get('reportKeys').size > 0) {
      // if query not provide, or providing invalid ti_id
      isTiListInvalid = false
      if (!ti_id || isTiIdInvalid(exam.get('reportKeys'), ti_id)) {
        ti_id = exam.get('reportKeys').get(0)
      }
      tiName = exam.get('reportDetails').get(ti_id).get('name')
      tiUnit = exam.get('reportDetails').get(ti_id).get('unit')
    }

    return { ti_id, tiName, tiUnit, date, isTrDateInvalid, isTiListInvalid }
  }
)
