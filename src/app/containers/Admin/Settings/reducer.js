import { fromJS } from 'immutable'
import ST from './action-types'

export const initState = fromJS({
  timeout_minute: null,
  threshold_status: null,
  max_threshold: null,
  min_threshold: null,
})

export default function(state = initState, action) {
  switch (action.type) {
    case ST.ADMIN_GET_SETTING_SUCCESS:
      return state.merge(action.result)
    case ST.ADMIN_GET_THRESHOLD_SETTING_SUCCESS:
      return state.set('threshold_status', action.result.status).set('max_threshold', action.result.max_threshold).set('min_threshold', action.result.min_threshold)
    case ST.ADMIN_SET_THRESHOLD_SETTING_SUCCESS:
      return state.set('threshold_status', action.result.status).set('max_threshold', action.result.max_threshold).set('min_threshold', action.result.min_threshold)
  }

  return state
}
