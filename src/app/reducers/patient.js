import { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import record, { initState as initRecord } from './record'
// import risk, { initState as initRisk } from './risk'

export const initState = fromJS({
  patient_id: null,
  name: null,
  age: null,
  gender: null,
  bed_no: null,
  diseases: [],
  fetched: false,
  record: initRecord,
  // risk: initRisk,
})

export default function(state = initState, action) {
  switch (action.type) {
    case TYPES.PATIENT_SELECT_PATIENT:
      if (action.patientId == state.get('patient_id')) {
        return state
      }

      return initState.merge({
        patient_id: action.patientId,
        record: record(initRecord, action),
      })
    case TYPES.FETCH_PATIENT_SUCCESS:
      return state.merge({ ...action.result, fetched: true })
    case TYPES.LOGOUT_SUCCESS:
      return initState
  }

  const currentRecord = state.get('record')
  return state.set('record', record(currentRecord, action))
}
