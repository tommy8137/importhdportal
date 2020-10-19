import { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import VT from './action-types'
import { LOCATION_CHANGE } from 'react-router-redux'
import { createSelector } from 'reselect'
import moment from 'moment'
import { safeGetModuleState } from 'containers/Risk/selector'

export const categoryId = '1'
export const moduleId = '2'

export const initState = fromJS({
  key: null,
  greenLine: [],
  selectedTime: null,
  // remindings: null,
  predictions: null,
  simulation: null,
  newArrivals: null, // data added later.
  predict_uf: null,
  displayThreshold: null,
  thresholdEditable: null,
  max_threshold: null,
  min_threshold: null,
  personal_threshold: null,
})

export default function(state = initState, action) {
  switch (action.type) {
    case VT.RISK_SBP_SELECT_TIME:
      return state.set('selectedTime', action.selectedTime)
    case VT.RISK_SBP_VARIATION_PRELOAD:
      return initState.merge(action.result)
    case VT.RISK_SBP_SIMULATE_SUCCESS:
      return state.set('simulation', fromJS(action.result)).set('predict_uf', action.predict_uf)
    case VT.RISK_CLEAR_SIMULATION:
      return state.set('simulation', null)
    case LOCATION_CHANGE:
      return state.set('simulation', null)
    case VT.UPDATE_SYSTEM_THRESHOLD_SUCCESS:
      return state.set('displayThreshold', action.result.status).set('max_threshold', action.result.max_threshold).set('min_threshold', action.result.min_threshold)
    case VT.PERSONAL_SYSTEM_THRESHOLD_SUCCESS:
      return state.set('displayThreshold', action.result.status).set('max_threshold', action.result.max_threshold).set('min_threshold', action.result.min_threshold).set('personal_threshold', action.result.personal_threshold).set('thresholdEditable', action.result.editable)
    case VT.SET_PERSONAL_THRESHOLD_SUCCESS:
      return state.set('displayThreshold', action.result.status).set('max_threshold', action.result.max_threshold).set('min_threshold', action.result.min_threshold).set('personal_threshold', action.result.personal_threshold).set('thresholdEditable', action.result.editable)
    case VT.RISK_SBP_REFRESH_DATA:
      const { greenLine, newArrivals, predictions } = action.result
      const valuesNewArrivals = state.get('newArrivals')
        ? state.get('newArrivals').push(...newArrivals.map(na => fromJS(na)))
        : fromJS(newArrivals)
      return state.merge({ greenLine, predictions, newArrivals: valuesNewArrivals })
  }
  return state
}
