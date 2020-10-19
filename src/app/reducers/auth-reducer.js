import TYPES from 'constants/action-types'
import LOGIN_TYPES from 'containers/Login/action-types'
import { browserHistory } from 'react-router'
import { fromJS } from 'immutable'
import UT from 'containers/UserAgreement/action-types'
import jwtDecode from 'jwt-decode'

const { LOGIN_SUCCESS, LOGIN_FAILED } = LOGIN_TYPES
const { REFRESH_TOKEN_DONE, LOGOUT_REQUESTING, LOGOUT_SUCCESS, LOGOUT_FAILED } = TYPES

export const initState = fromJS({
  tokenValid: false,
  tokenExpired: null,
  isAuthenticated: false,
  expiresIn: null,
  status: null,
  token: null, // access-token
  refreshToken: null,
  scope: [],
  // from radius
  id: null,
  name: null,
  displayName: null,
  position: null,
  phone: null,
  email: null,
  agreements: 2, // 2: disagree, 1: agree
})

export default function(state = initState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return state.merge({
        tokenExpired: false,
        tokenValid: true,
        isAuthenticated: true,
        expiresIn: action.result.expiresIn,
        refreshToken: action.result.refreshToken,
        agreements: action.result.agreements,
        ...action.result.user,
      })
    case LOGIN_FAILED:
      return state.merge({
        tokenExpired: null,
        tokenValid: false,
        isAuthenticated: false,
      })
    case TYPES.REFRESH_TOKEN_DONE:
      const payload = jwtDecode(action.accessToken)
      return state.merge({
        tokenExpired: false,
        tokenValid: true,
        isAuthenticated: true,
        refreshToken: action.refreshToken,
        expiresIn: payload.exp * 1000,
        scope: payload.scope,
      })
    case LOGOUT_SUCCESS:
      // prevent from seeing the agreement page (initstate.agreements === 2)
      return initState.set('agreements', 1)
    case TYPES.UNIVERSAL_SET_TOKEN:
      return state.set('token', action.token)
    case UT.USER_AGREEMENT_SUCCESS:
      return state.set('agreements', 1)
  }
  return state
}
