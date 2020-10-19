import { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import VT from '../Range/action-types'
import ET from './action-types'
import { LOCATION_CHANGE } from 'react-router-redux'

export const categoryId = '1'
export const moduleId = '4'

export const initState = fromJS({
  greenLine: [],
  selectedTime: null,
  simulateTime: null, // simulating at this selected time.
  predictions: [],
  simulations: [],
  newArrivals: null,
  predict_uf:null,
})

export default function (state = initState, action) {
  switch (action.type) {
    case ET.RISK_SBP_ESTIMATION_PRELOAD:
      const { result: { greenLine, key, time, predictions, predict_uf } } = action
      return state.merge({
        key,
        greenLine,
        simulateTime: time,
        selectedTime: time,
        predictions,
        simulations: [],
        predict_uf,
      })
    case VT.RISK_SBP_SELECT_TIME:
      const { selectedTime } = action
      return state.set('selectedTime', parseInt(selectedTime))
    case ET.RISK_SBP_ESTIMATION_SIMULATE_SUCCESS:
      const { result, simulate_total_uf } = action
      return state.set('simulations', fromJS(result)).set('predict_uf', simulate_total_uf)
    case LOCATION_CHANGE:
      return state.set('selectedTime', null)
  }

  return state
}
