import { call, put, select, fork } from 'redux-saga/effects'
import { fetchUserBar } from 'sagas/patient'
import { fetchingTask } from 'sagas/fetch'
import { apiTestResults, apiItemsList } from 'app/apis/examination'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import ET from './action-types'
import { trIdSelector, tiIdSelector } from './selector'
import { startToPoll } from 'sagas/polling-task'

export const preload = (params, query) => function* () {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EXAM_PRELOAD })
    yield call(fetchUserBar, params, query)
    let { tr_id, defaultTrId } = yield select(state => trIdSelector(state))
    let isTrDateInvalid = yield call(fetchTrTi, params.p_id, tr_id)

    if (isTrDateInvalid) {
      isTrDateInvalid = yield call(fetchTrTi, params.p_id, defaultTrId)
    }

    yield put({ type: ET.SEARCHES_PATIENTS_TEST_RESULTS_INVALID, isTrDateInvalid })
    yield fork(startToPoll, checkIfNeedToPollTask, pollingTask, params)
    return true
  } catch (ex) {
    console.error(ex)
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_PRELOAD })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_PRELOAD })
  }
}

function* fetchTrTi (p_id, tr_id) {
  const isTrFetched = yield select((state) => {
    return state.patient.get('record').get('exam').get('trId') === tr_id
  })
  if (!isTrFetched) {
    yield call(fetchTestResult, p_id, tr_id)
  }

  const { ti_id, tiName, tiUnit, isTrDateInvalid, isTiListInvalid } = yield select(state => tiIdSelector(state))
  const isTiFetched = yield select((state) => {
    return state.patient.get('record').get('exam').get('tiId') === ti_id
  })

  if (!isTiFetched) {
    if (!isTrDateInvalid) {
      yield call(fetchItemsList, p_id, ti_id)
      yield put({ type: ET.SEARCHES_PATIENTS_ITEMS_LIST_UPDATE, ti_id, tiName, tiUnit, isTiListInvalid })
    }
  }

  return isTrDateInvalid
}

export function* fetchTestResult(p_id, tr_id = 'TR_ID_NOT_PROVIDED') {
  const options = { status: [] }
  const {
    SEARCHES_PATIENTS_TEST_RESULTS_FETCHING,
    SEARCHES_PATIENTS_TEST_RESULTS_SUCCESS,
    SEARCHES_PATIENTS_TEST_RESULTS_FAILED,
  } = ET
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EXAM_FETCH_TEST_RESULT })
    yield put({ type: SEARCHES_PATIENTS_TEST_RESULTS_FETCHING })
    const report = yield call(
      fetchingTask,
      options,
      apiTestResults(p_id, tr_id)
    )

    yield put({ type: SEARCHES_PATIENTS_TEST_RESULTS_SUCCESS, result: report })
    return report
  } catch (ex) {
    console.error(`${SEARCHES_PATIENTS_TEST_RESULTS_FAILED} ERROR: ${ex}`)
    put({ type: SEARCHES_PATIENTS_TEST_RESULTS_FAILED })
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_FETCH_TEST_RESULT })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_FETCH_TEST_RESULT })
  }
}

export function* fetchItemsList(p_id, ti_id, end_date) {
  const options = { status: [] }
  const {
    SEARCHES_PATIENTS_ITEMS_LIST_FETCHING,
    SEARCHES_PATIENTS_ITEMS_LIST_SUCCESS,
    SEARCHES_PATIENTS_ITEMS_LIST_FAILED,
  } = ET
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EXAM_TEST_ITEM_LIST })
    yield put({ type: SEARCHES_PATIENTS_ITEMS_LIST_FETCHING })

    let limit = 1
    let offset = 0
    const firstFetch = yield call(
      fetchingTask,
      options,
      apiItemsList(p_id, ti_id, end_date, offset, limit)
    )

    const totalNum = firstFetch.result.total_nums
    limit = 12
    if (totalNum < limit) {
      limit = totalNum
    } else {
      offset = totalNum - limit
    }

    const itemsList = totalNum ? yield call(
      fetchingTask,
      options,
      apiItemsList(p_id, ti_id, end_date, offset, limit)
    ) : firstFetch

    yield put({ type: SEARCHES_PATIENTS_ITEMS_LIST_SUCCESS, result: itemsList })
  } catch (ex) {
    console.error(`${SEARCHES_PATIENTS_ITEMS_LIST_FAILED} ERROR: ${ex}`)
    put({ type: SEARCHES_PATIENTS_ITEMS_LIST_FAILED })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_TEST_ITEM_LIST })
  }
}

function* pollingTask(params) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.EXAM_POLLING_TASK  })
    yield call(fetchUserBar, params)
    let { tr_id, defaultTrId } = yield select(state => trIdSelector(state))
    yield call(fetchTestResult, params.p_id, tr_id)
    let { ti_id, tiName, tiUnit, isTiListInvalid } = yield select(state => tiIdSelector(state))

    if (!ti_id) {
      yield call(fetchTestResult, params.p_id, defaultTrId);
      ({ ti_id, tiName, tiUnit, isTiListInvalid } = yield select(state => tiIdSelector(state)))
    }

    yield call(fetchItemsList, params.p_id, ti_id)
    yield put({ type: ET.SEARCHES_PATIENTS_ITEMS_LIST_UPDATE, ti_id, tiName, tiUnit, isTiListInvalid })

  } catch (ex) {
    console.error(ex)
    yield put({ type: TYPES.APP_LOADING, isLoading: false })
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.EXAM_POLLING_TASK  })
  }
}


function* checkIfNeedToPollTask() {
  return true
}
