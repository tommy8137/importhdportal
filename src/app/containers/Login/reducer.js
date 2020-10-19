import { LOCATION_CHANGE } from 'react-router-redux'
import TYPES from './action-types'
import { fromJS } from 'immutable'
import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'

const { LOGIN_REQUESTING, LOGIN_SUCCESS, LOGIN_FAILED } = TYPES

const initState = fromJS({
	status: null,
  message: null
})

export default function(state = initState, action) {
	switch (action.type) {
		case LOGIN_REQUESTING:
      return state.set('status', action.type)
		case LOGIN_SUCCESS:
      return state.set('status', action.type).set('message', null)
    case LOGIN_FAILED:
      return state.set('status', action.type).set('message', action.message)
		case LOCATION_CHANGE:
			return initState
	}

	return state
}
// License has expired. Please contact with administrator.
export const licenseExpiredMsgSelector = createSelector(
  localeSelector,
  (state) => state.routing.locationBeforeTransitions.query,
  (l, { status }) => {
    if (status == 403) {
      return l('License has expired. Please contact with administrator.')
    } else {
      return null
    }
  }
)
