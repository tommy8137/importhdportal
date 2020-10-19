import * as actions from './auth-action'
import reducer, { licenseExpiredMsgSelector } from './reducer'
import actionTypes from './action-types'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Login'): null

export {
  actions,
  reducer,
  licenseExpiredMsgSelector,
  actionTypes,
}
