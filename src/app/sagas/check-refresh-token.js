import CONSTANTS from 'constants'
import { select } from 'redux-saga/effects'

const { KEY_REFRESH_TOKEN } = CONSTANTS

export default function* checkRefreshTask() {
  let refreshToken = localStorage.getItem(KEY_REFRESH_TOKEN)
    refreshToken = yield select((state) => (state.auth.get('refreshToken')))
    if (refreshToken != null) {
      localStorage.setItem(KEY_REFRESH_TOKEN, refreshToken)
    }
  return
}
