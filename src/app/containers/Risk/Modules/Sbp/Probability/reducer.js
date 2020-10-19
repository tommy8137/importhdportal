import { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import VT from '../Range/action-types'
import PT from './action-types'
import { LOCATION_CHANGE } from 'react-router-redux'

export const categoryId = '1'
export const moduleId = '3'

export const initState = fromJS({
  greenLine: [],
  selectedTime: null,
  simulateTime: null, // simulating at this selected time.
  ul: 0, // 1: >=, o.w: <
  ulnum: 100,
  predictions: [],
  simulations: [],
  newArrivals: null,
  predict_uf:null,
})

export default function(state = initState, action) {
  switch (action.type) {
    case PT.RISK_SBP_PROB_PRELOAD: {
      const { result: { greenLine, key, time, predictions, predict_uf } } = action
      return state.merge({
        key,
        greenLine,
        simulateTime: time,
        selectedTime: time,
        predictions,
        simulations: [], // simulations should be reset
        predict_uf,
      })
    }
    case VT.RISK_SBP_SELECT_TIME:
      const { selectedTime } = action
      return state.set('selectedTime', parseInt(selectedTime))
    case PT.RISK_SBP_PROB_SIMULATE_SUCCESS: {
      const { time, ul, ulnum, predictions, simulations, simulate_total_uf } = action
      return state.merge({
        selectedTime: time,
        simulateTime: time,
        predictions,
        simulations,
        ul,
        ulnum,
        predict_uf: simulate_total_uf,
      })
    }
    case VT.RISK_SBP_REFRESH_DATA:
      const { greenLine, newArrivals, predictions } = action.result
      const valuesNewArrivals = state.get('newArrivals')
        ? state.get('newArrivals').push(...newArrivals.map(na => fromJS(na)))
        : fromJS(newArrivals)
      return state.merge({
        greenLine,
        predictions,
        simulations: fromJS([]),
        simulateTime: greenLine.size > 0 ? greenLine.last().time : state.get('simulateTime'),
        newArrivals: valuesNewArrivals,
      })
    case LOCATION_CHANGE:
      return state.merge({
        selectedTime: null,
      })
      // return state.set('simulation', null)
  }
  return state
}
