import { fromJS, Record, List } from 'immutable'
import { normalize }  from 'normalizr'
import TYPES from 'constants/action-types'
import recordSchema, { leftFields } from 'app/schemas/record-schema'
import exam, { initState as initExam } from 'containers/Examination/reducer'
import dashboard, { initState as initDashboard } from 'containers/Dashboard/reducer'
import detail, { initState as initDetail } from 'containers/Record/reducer'
import risk, { initState as initRisk } from 'containers/Risk/reducer'

export const initState = fromJS({
  record_id: null,
  date: null,
  result: [],
  entities: {

  },
  fetched: false,
  dashboard: initDashboard,
  exam: initExam,
  detail: initDetail,
  risk: initRisk,
  page: null,
})

export default function(state = initState, action) {
  const currentExam = state.get('exam')
  const currentDashboard = state.get('dashboard')
  const currentDetail = state.get('detail')
  const currentRisk = state.get('risk')
  switch (action.type) {
    case TYPES.FETCH_RECORD_LIST_SUCCESS:
      const { entities, result } = action.result
      return state.merge({
        // record_id,
        result: fromJS(result),
        entities: fromJS(entities.record),
        fetched: true,
      })
    case TYPES.PATIENT_SELECT_PATIENT:
      return initState.set('record_id', action.recordId)
    case TYPES.PATIENT_SELECT_RECORD:
      if (action.recordId == state.get('record_id')) {
        return state
      }
      return state.merge({
        record_id: action.recordId,
        date: action.date,
        fetched: false,
        detail: state.get('page') == 'record'? detail(currentDetail, action): initDetail,
        dashboard: initDashboard,
        exam: state.get('page') == 'examination'? exam(currentExam, action): initExam,
        risk: state.get('page') == 'risk'? risk(currentRisk, action): initRisk,
      })
    case TYPES.APP_LOCATION_CHANGE:
      const { pathname } = action
      const pattern = /\/((.+)\/(.+)\/(.+)\/([^\?]+)|(.+))/i
      const regexResult = pattern.exec(pathname)
      if (regexResult) {
        if (regexResult[4]) {
          return state.set('page', regexResult[4].toLowerCase())
        } else if (regexResult[1]) {
          return state.set('page', regexResult[1].toLowerCase())
        } else {
          return state
        }
      }

      return state
  }

  return state.merge({
    exam: exam(currentExam, action),
    dashboard: dashboard(currentDashboard, action),
    detail: detail(currentDetail, action),
    risk: risk(currentRisk, action),
  })
}
