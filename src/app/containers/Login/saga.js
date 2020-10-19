import { takeLatest } from 'redux-saga'
import { call, take, put } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import { login as loginApi, getAgreement as getAgreementApi, getTimeout as getTimeoutApi } from 'app/apis/auth'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import LOGIN_TYPES from './action-types'

export default (username, password) => function* () {
  let { LOGIN_REQUESTING, LOGIN_SUCCESS, LOGIN_FAILED } = LOGIN_TYPES
  let fetch = null

  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.LOGIN })
    yield put({ type: LOGIN_REQUESTING })
    const result = yield call(fetchingTask, { showLoading: false }, loginApi(username, password))
    const { always_show } = yield call(fetchingTask, { showLoading: false }, getAgreementApi())
    const { timeout_minute } = yield call(fetchingTask, { showLoading: false }, getTimeoutApi())
    result.agreements = always_show
    yield put({ type: TYPES.APP_SET_TIMEOUT, timeout: timeout_minute * 60 * 1000 })
    yield put({ type: LOGIN_SUCCESS, result })
  } catch (ex) {
    console.error(ex)
    try {
      yield put({ type: LOGIN_FAILED, message: JSON.parse(ex.message).message })
    } catch (e) {
      yield put({ type: LOGIN_FAILED, message: ex.message })
    }
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.LOGIN })
  }
}
