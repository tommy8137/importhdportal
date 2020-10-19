import CONSTANTS from 'constants'
import { browserHistory } from 'react-router'
import TYPES from 'constants/action-types'
import LOGIN_TYPES from 'containers/Login/action-types'

// auth-middleware will trigger only when login success
// then chage to the index page and store the refresh token
export default store => next => action => {
  if (!action) {
    return
  }
  switch (action.type) {
    case LOGIN_TYPES.LOGIN_SUCCESS:
      localStorage.setItem(CONSTANTS.KEY_REFRESH_TOKEN, action.result.refreshToken)
      next(action)
      const redirectUrl = store.getState().routing.locationBeforeTransitions.query.to || '/overview'
      browserHistory.push(redirectUrl)
      return
    case TYPES.LOGOUT_SUCCESS:
      localStorage.removeItem(CONSTANTS.KEY_REFRESH_TOKEN)
      next(action)
      browserHistory.push('/logout-success')
      return
    case TYPES.REFRESH_TOKEN_DONE:
      localStorage.setItem(CONSTANTS.KEY_REFRESH_TOKEN, action.refreshToken)
      next(action)
      return
    case TYPES.AUTH_UNAUTHENTICATED:
      const originalUrl = store.getState().routing.locationBeforeTransitions.pathname || '/'
      const originalSearch = store.getState().routing.locationBeforeTransitions.search || ''
      const redirectTo = '/login?to=' + originalUrl + encodeURIComponent(originalSearch)
      browserHistory.push(redirectTo)
      // next(action)
      return
    default:
      next(action)
      return
  }
}
