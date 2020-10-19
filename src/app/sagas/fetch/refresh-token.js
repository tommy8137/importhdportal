import { take, call, put } from 'redux-saga/effects'
import CONSTANTS from 'constants'
import TYPES from 'constants/action-types'
import throwError from './throw-error'
import {
  fetch,
  DEFAULT_OPTIONS,
  canUseDOM,
} from 'app/utils/fetch'
const { KEY_REFRESH_TOKEN, REFRESH_TOKEN_URL } = CONSTANTS
let lastTimeRefresh = 0
let isRefreshSuccess = true // record the latest result of refreshing token

export default function* refreshTokenTask(force = false) {
  // @todo refresh token should be from store
  const now = Date.now().valueOf()
  // prevent from refreshing tokens multiple times in a short duration
  if (!force && now - lastTimeRefresh < 1000 * 60) {
    if (isRefreshSuccess) {
      yield take(TYPES.REFRESH_TOKEN_DONE)
    }
    return
  }
  lastTimeRefresh = now
  const refreshToken = localStorage.getItem(KEY_REFRESH_TOKEN)
  if (!refreshToken) {
    const err = new Error('refresh token is null, cannot execute refresh-token task')
    err.status = 401
    isRefreshSuccess = false
    yield call(throwError, err)
    // browserHistory.push({
    //   pathname: '/login',
    // })
    return
  }
  try {
    const url = REFRESH_TOKEN_URL
    const options = {
      ...DEFAULT_OPTIONS,
      method: 'post',
      refreshOnce: false,
      body: JSON.stringify({ refreshToken })
    }
    __DEV__ && console.log('start refresh task')
    const { refreshToken: newRefreshToken, accessToken } = yield call(fetch, url, options)
    yield put({ type: TYPES.REFRESH_TOKEN_DONE, refreshToken: newRefreshToken, accessToken })
    isRefreshSuccess = true
  } catch (ex) {
    console.error(`error occurs while refreshing token: ${ex.message}`)
    isRefreshSuccess = false
    yield call(throwError, ex)
  }
}
