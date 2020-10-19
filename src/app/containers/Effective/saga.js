/* --------------------------------------------------------------------
 * preload shift, category, overview and abnormal list
 * -------------------------------------------------------------------- */
// sagas
import { call, put, select, fork, take } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import { takeLatest } from 'redux-saga'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import AT from './action-types'
import { selector } from './selector'
// api
import { fetchReportList } from 'app/apis/effective'
/* --------------------------------------------------------------------
 * combo preload by sagas
 * -------------------------------------------------------------------- */

export function* preload() {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EFFECTIVE_PRELOAD })
    yield call(fetchList)
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EFFECTIVE_PRELOAD })
  }
}

export function* fetchList() {
  const options = { status: [] }
  const {
    EFFECTIVE_GET_LISTS_FETCHING,
    EFFECTIVE_GET_LISTS_SUCCESS,
    EFFECTIVE_GET_LISTS_FAILED,
  } = AT
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EFFECTIVE_FETCH_LIST })
    yield put({ type: EFFECTIVE_GET_LISTS_FETCHING })

    const report = yield call(
      fetchingTask,
      options,
      fetchReportList()
    )

    yield put({ type: EFFECTIVE_GET_LISTS_SUCCESS, result: report })
    return report
  } catch (ex) {
    console.error(`${EFFECTIVE_GET_LISTS_FAILED} ERROR: ${ex}`)
    yield put({ type: EFFECTIVE_GET_LISTS_FAILED })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EFFECTIVE_FETCH_LIST })
  }
}

export function* fetchReport(year, lang) {
  try {
    const link = document.createElement('a')
    link.download = ''
    let URL = `/api/${__API_VERSION__}/effective/year/${year}/lang/${lang}`
    link.href = URL
    link.click()
  } catch (ex) {
    console.error(ex)
  }
}
