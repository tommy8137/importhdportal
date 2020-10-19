import { createSelector } from 'reselect'
import { status as statusField, record as recordField, test as testField } from 'app/schemas/dashboard'
import { fromJS } from 'immutable'
import { localeSelector } from 'reducers/locale-reducer'

function makeupProp(prop) {
  if (!prop) {
    return fromJS({})
  }

  prop.forEach((value, key) => {
    if ((!parseFloat(value) && parseFloat(value) != 0)  || value == -9527) {
      prop = prop.set(key, '--')
    }
  })
  return prop
}

const dashboardSelector = createSelector(
  (state) => state.patient.get('record').get('dashboard'),
  (dashboard) => {
    const status = dashboard.get(statusField)
    const statusState = {
      weight: makeupProp(status.get('weight')),
      sbp: makeupProp(status.get('sbp')),
      dbp: makeupProp(status.get('dbp')),
      heparinUsage: makeupProp(status.get('heparin_usage_status')),
    }

    const record = dashboard.get(recordField)
    let entities = record.get('entities')
    const recordId = record.get('result')
    const recordState = {
      total: recordId? entities.get(recordField).get(recordId).get('total'): 0,
      abnormal: entities.get('abnormal').valueSeq(),
      handled: entities.get('handled').valueSeq(),
    }
    const test = dashboard.get(testField)
    entities = test.get('entities')
    const trId = test.get('result')
    const testState = {
      date: trId? entities.getIn([testField, trId, 'date']): null,
      total: trId? entities.getIn([testField, trId, 'total']): 0,
      abnormal: entities.get('abnormal').valueSeq(),
      critical: entities.get('critical').valueSeq(),
    }
    return {
      status: statusState,
      record: recordState,
      test: testState,
    }
  }
)

const riskSummarySelector = createSelector(
  (state) => state.patient.getIn(['record', 'dashboard', 'summary', 'entities']),
  // (state) => state.patient.getIn(['record', 'risk', 'summary', 'entities']),
  (entities) => {
    if (!entities || !entities.get('category')) {
      return {
        categories: fromJS([]),
        modules: {},
      }
    }
    return {
      categories: entities.get('category').valueSeq(),
      modules: entities.get('module'),
    }
  }
)

export default createSelector(
  dashboardSelector,
  riskSummarySelector,
  localeSelector,
  (dashboard, riskSummary, l) => {
    return {
      l,
      ...riskSummary,
      ...dashboard,
    }
  }
)
