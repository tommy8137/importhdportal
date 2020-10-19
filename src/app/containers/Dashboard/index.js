import * as actions from './actions'
import { fetchDashboard, fetchRiskSummary } from './saga'
import reducer, { initState } from './reducer'
import actionTypes from './action-types'

export default (__CLIENT__ || __UNIVERSAL__ ) ? require('./Dashboard'): null

export {
  fetchDashboard,
  fetchRiskSummary,
  actions,
  initState,
  reducer,
}
