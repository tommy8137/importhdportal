import { fromJS } from 'immutable'
import { status, record, test }  from 'app/schemas/dashboard'
import TYPES from 'constants/action-types'
import DT from './action-types'

export const initState = fromJS({
  [status]: {
    weight: {},
    sbp: {},
    dbp: {},
    heparin_usage_status: {},
  },
  [record]: {
    entities: {
      [record]: {},
      abnormal: [],
      handled: [],
    },
  },
  [test]: {
    entities: {
      [test]: {},
      abnormal: [],
      critical: [],
    },
  },
  summary: {
    entities: null,
    result: null,
  },
})

export default function(state = initState, action) {
  switch (action.type) {
    case DT.FETCH_DASHBOARD_SUCCESS:
      if (!action.result[status] || !action.result[record] || !action.result[test]) {
        throw new Error('data structure is incorret while receiving dashboar data.')
      }
      return state.merge(action.result)
    case DT.FETCH_SUMMARY_SUCCESS:
      return state.set('summary', fromJS({ ...action.result }))

  }

  return state
}
