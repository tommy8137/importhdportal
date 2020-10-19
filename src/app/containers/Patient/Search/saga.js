import { call, put, select } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import { apiSearchSchedule } from 'app/apis/search'
import { shiftsSelector } from './selector'
import { fetchShifts } from '../Overview/saga'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import ST from './action-types'

export const preload = (startDate, endDate, optional) => function* () {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_SEARCH_PRELOAD })
    yield call(fetchSearchSchedule, startDate, endDate, optional)
    const { shifts } = yield select(state => shiftsSelector(state))
    if (!shifts.size) {
      yield call(fetchShifts)
    }
    return true
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_SEARCH_PRELOAD })
  }
}

export function* fetchSearchSchedule(startDate, endDate, optional) {
  const options = { status: [] }
  const {
    SEARCH_SCHEDULE_FETCHING,
    SEARCH_SCHEDULE_SUCCESS,
    SEARCH_SCHEDULE_FAILED,
  } = ST

  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_SEARCH_FETCH_SCHEDULE })
    yield put({ type: SEARCH_SCHEDULE_FETCHING })
    const report = yield call(
      fetchingTask,
      options,
      apiSearchSchedule(startDate, endDate, optional)
    )
    yield put({ type: SEARCH_SCHEDULE_SUCCESS, result: report })
    return report
  } catch (ex) {
    console.error(`${SEARCH_SCHEDULE_FAILED} ERROR: ${ex}`)
    yield put({ type: SEARCH_SCHEDULE_FAILED })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_SEARCH_FETCH_SCHEDULE })
  }
}
