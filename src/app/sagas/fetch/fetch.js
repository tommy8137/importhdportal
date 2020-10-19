import { put, take, call, fork, cancel, select, cancelled, actionChannel  } from 'redux-saga/effects'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import CONSTANTS from 'constants'
import { browserHistory } from 'react-router'
import throwError from './throw-error'
import refreshTokenTask from './refresh-token'
import {
  fetch,
  DEFAULT_OPTIONS,
  canUseDOM,
} from 'app/utils/fetch'
import { localeSelector } from 'reducers/locale-reducer'
import LOGIN_TYPES from 'containers/Login/action-types'

const { SAGA_FETCH_ACTION, SAGA_CUSTOM_TASK, SAGA_PRELOAD_ACTION, REFRESH_TOKEN_DONE } = TYPES

export default function* fetchSaga() {
  yield [
    fork(regularFetch),
    fork(customFetch),
  ]
}

function* customFetch() {
  while (true) {
    try {
      const { task, args } = yield take(SAGA_CUSTOM_TASK)
      if (args) {
        yield fork(task, ...args)
      } else {
        yield fork(task)
      }
    } catch (ex) {
      console.error(ex)
    }
  }
}

function* regularFetch() {
  while (true) {
    try {
      const {
        fetch,
        status,
        notification,
      } = yield take(SAGA_FETCH_ACTION)
      let [REQUESTING, SUCCESS, FAILURE, CANCELLATION] = Array.isArray(status)
      ? status
      : ['NULL_REQUESTING', 'NULL_SUCCESS', 'NULL_FAILURE', CANCELLATION]
      __DEV__ && console.log('capture fetch in fetch saga')
      // check if token exist, if so, attach token to the option
      const fetchObjects = (Array.isArray(fetch)? fetch: [fetch])
      const task = yield fork(forkFetching, { status: [REQUESTING, SUCCESS, FAILURE, CANCELLATION], notification }, ...fetchObjects)
      if (CANCELLATION) {
        yield take(CANCELLATION)
        yield cancel(task)
      }
    } catch (ex) {
      console.error(ex)
    }
  }
}

function* forkFetching({ status, notification, showLoading = true }, ...fetchObjects) {
  try {
    yield call(fetchingTask, { status, showLoading }, ...fetchObjects)
  } catch (ex) {
    console.error(ex)
  }
}

/**
 * [*fetchingTask description]
 * @param {[type]}    options.status       3 flags of fetching status + 1 flag of cancellation
 * @param {[type]}    options.notification @TODO: use this for notification
 * @param {Boolean}   options.showLoading  [description]
 * @param {...[type]} fetchObjects         fetchObjects  dynamic fetching, if so => fetching in parallel
 * @yield {[type]}    fetching result
 */
export function* fetchingTask({ status, notification, showLoading = true }, ...fetchObjects) {
  const [REQUESTING, SUCCESS, FAILURE, CANCELLATION] = Array.isArray(status)
  ? status
  : ['NULL_REQUESTING', 'NULL_SUCCESS', 'NULL_FAILURE']
  try {
    if (showLoading) {
      yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.SAGA_FETCHING_TASK })
    }
    if (REQUESTING) {
      yield put({ type: REQUESTING })
    }

    let authState = yield select(state => state.auth)

    const refreshOnce = canUseDOM && fetchObjects.reduce((prev, curr) => prev || (curr.options && curr.options.refreshOnce), false)
    // the token is possibly expired, try to refresh the token first
    if (refreshOnce && authState.get('tokenValid') && authState.get('expiresIn') < Date.now()) {
      yield call(refreshTokenTask)
    }

    // generate the fetching jobs
    let tasks = fetchObjects
      .filter(fo => fo.url)
      .map(fo => call(decoratedFetch, fo.url, fo.options))
    // fetching task is not the normal way => perform the provided custom task
    const customTasks = fetchObjects
      .filter(fo => fo.customTask && typeof fo.customTask === 'function')
      .map(fo => call(fo.customTask, fo.options))

    tasks = tasks.concat(customTasks)

    const results = yield tasks
    const reduxResult = results && results.length == 1? results[0]: results
    if (SUCCESS) {
      yield put({ type: SUCCESS, result: reduxResult })
    }
    if (showLoading) {
      yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.SAGA_FETCHING_TASK })
    }

    return reduxResult

  } catch (ex) {
    if (FAILURE) {
      yield put({ type: FAILURE, message: ex.message, error: ex })
    }
    if (showLoading) {
      yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.SAGA_FETCHING_TASK })
    }
    const currentUrl = yield select(state => state.routing.locationBeforeTransitions.pathname || '/')
    if (/^\/login/i.test(currentUrl)) { // login page

    } else { // other pages
      switch (ex.status) {
        case 401:
          yield put({ type: LOGIN_TYPES.LOGIN_FAILED })
          break
        case 403:
          yield put({ type: TYPES.APP_SET_LICENSE_STATUS, isExpired: true })
          break
        default:
          const l = yield select(localeSelector)
          try {
            if (ex instanceof TypeError) {
              yield put({ type: TYPES.APP_SET_MODAL, content: l('Connection problem, please check your network connection and then try again. '), visible: true, modalType: 'warning' })
              return
            }
            const res = JSON.parse(ex.message)
            const msg = `${res.code}: ${res.message}`
            yield put({ type: TYPES.APP_SET_MODAL, content: msg, visible: true, modalType: 'warning' })
          } catch (ex2) {
            yield put({ type: TYPES.APP_SET_MODAL, content: l(ex.message), visible: true, modalType: 'warning' })
          }
          break
      }
    }

    yield call(throwError, ex)
  } finally {
    if (yield cancelled()) {
      if (CANCELLATION) {
        yield put({ type: CANCELLATION })
      }
      if (showLoading) {
        yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.SAGA_FETCHING_TASK })
      }
    }
  }
}

/**
 * decorated fetch, will try to refresh the token
 * if refreshOnce equals true and the first request gets 401 response
 *
 * @param  {[type]}    url                 [description]
 * @param  {Boolean}   options.refreshOnce [description]
 * @param  {...[type]} options.options      [description]
 * @return {[type]}                        [description]
 */

function* decoratedFetch(url, { refreshOnce, ...options } ) {
  try {
    const token = yield select(state => state.auth.get('token'))
    const result = yield call(fetch, url, { ...options, token })
    return result
  } catch (ex) {
    if (canUseDOM && ex.status == 401 && refreshOnce) {
      yield call(refreshTokenTask)
      // after refreshing token, try to request again,
      // if it still fails this time, there should be an error.
      const result = yield call(fetch, url, options)
      return result
    }

    yield call(throwError, ex)
  }
}
