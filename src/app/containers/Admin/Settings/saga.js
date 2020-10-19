import refreshTokenTask from 'sagas/fetch/refresh-token'
import { takeEvery, takeLatest } from 'redux-saga'
import { call, fork, take } from 'redux-saga/effects'
import ST from './action-types'

export function* downloadLogs() {
  try {
    yield call(refreshTokenTask, true)
    const link = document.createElement('a')
    link.download = ''
    link.href = `/api/${__API_VERSION__}/admins/logs`
    link.click()
  } catch (ex) {
    console.error(ex)
  }
}

export default function* () {
  yield takeLatest(ST.ADMIN_GET_LOGS, downloadLogs)
}
