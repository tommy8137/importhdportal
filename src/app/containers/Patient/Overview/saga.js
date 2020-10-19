/* --------------------------------------------------------------------
 * preload shift, category, overview and abnormal list
 * -------------------------------------------------------------------- */
// sagas
import { call, put, select, fork } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import OT from './action-types'
// api
import { apiShifts, apiOverview, apiOverviewAbnormalList } from 'app/apis/overview'
import { selector } from './selector'
import { createSelector } from 'reselect'
// refresh
import { startToPoll } from 'sagas/polling-task'
import moment from 'moment'

export function* currentShift(nowtime){
  let { shifts, shift } = yield select(state => selector(state))

  if (shifts && shifts.length >= 3) {
    if (nowtime == '00:00')
      return shifts[0].value
    else if(nowtime == '12:00')
      return shifts[1].value
    else if(nowtime == '17:00')
      return shifts[2].value
  }
  return shift || 'all'
}

function* defaultShift(nowtime){
  let { shift, shifts } = yield select(state => selector(state))

  if (shifts && shifts.length >= 3) {
    if (nowtime < '12:00')
      return shifts[0].value
    else if(nowtime >= '12:00' && nowtime <= '16:59')
      return shifts[1].value
    else if(nowtime >= '17:00' && nowtime <= '23:59')
      return shifts[2].value
  }
  return shift || 'all'
}

/* --------------------------------------------------------------------
 * combo preload by sagas
 * -------------------------------------------------------------------- */
export const preload = (params, query) => function* () {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_PRELOAD })
    let { shift, shifts, category, areaSelected } = yield select(state => selector(state))

    // if only have one default key
    if (Array.isArray(shifts) && !shifts[1]) {
      shifts = yield call(fetchShifts)
    }

    if (shifts && shift == null) {
      shift = yield defaultShift(moment(Date.now().valueOf()).format('HH:mm')) || 'all'
      yield call(changeShiftTask, shift)
    } else {
      shift = shift ? shift : yield defaultShift(moment(Date.now().valueOf()).format('HH:mm'))  || 'all'
      category = category || 'all'
      areaSelected = areaSelected || 'all'
      yield [
        call(fetchOverview, shift, areaSelected),
        put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_SHIFT, shift: shift, areaSelected: areaSelected }),
        call(fetchOverviewAbnormalList, shift, category, areaSelected),
        put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_CATEGORY, category }),
      ]
    }

    yield fork(startToPoll, checkIfNeedToPollTask, pollingTask)
    // yield put({ type: TYPES.SEARCHES_PATIENTS_TEST_RESULTS_INVALID, isTrDateInvalid })
    return true
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_PRELOAD })
  }
}

export function* changeShiftTask(requestShift) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_SHIFT })
    const { shift, category, areaSelected } = yield select(state => selector(state))

    const newCategory = category || 'SBP'
    const newAreaSelect = areaSelected || 'all'

    if (requestShift !== shift && requestShift !== undefined) {
      yield call(fetchOverview, requestShift, newAreaSelect)
      yield call(changeCategoryTask, requestShift, newCategory, newAreaSelect)
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_SHIFT, shift: requestShift, areaSelected: newAreaSelect })
    }
    return true
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_SHIFT })
  }
}

export function* changeCategoryTask(requestShift, requestCategory, requestArea) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_CATEGORY })
    const { shift, category, areaSelected } = yield select(state => selector(state))
    if (requestShift !== shift ||
        (requestShift === shift && requestArea === areaSelected && requestCategory !== category) &&
        (requestShift !== undefined && requestCategory !== undefined && requestArea !== undefined)) {
      yield call(fetchOverviewAbnormalList, requestShift, requestCategory, requestArea)
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_CATEGORY, category: requestCategory })
    }
    return true
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_CATEGORY })
  }
}

export function* changeBPTypeTask(requestShift, requestBPType) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_BPCLASS })
    const { shift, bp_class } = yield select(state => selector(state))
    if (requestShift !== shift ||
        (requestShift === shift && requestBPType !== bp_class) &&
        (requestShift !== undefined && requestBPType !== undefined)) {
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_BPCLASS, bp_class: requestBPType })
    }
    return true
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_BPCLASS })
  }
}

export function* changeAreaTask(requestArea) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_AREA })
    const { shift, category, areaSelected } = yield select(state => selector(state))

    const newCategory = category || 'all'
    const newShift = shift || 'all'

    if (requestArea !== areaSelected && requestArea !== undefined) {
      yield call(fetchOverview, newShift, requestArea)
      yield call(changeCategoryTask, newShift, newCategory, requestArea)
      yield call(fetchOverviewAbnormalList, newShift, newCategory, requestArea)
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_AREA, areaSelected: requestArea })
    }
    return true
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_CHANGE_AREA })
  }
}

/* --------------------------------------------------------------------
 * APIs
 * -------------------------------------------------------------------- */
export function* fetchShifts() {
  const options = { status: [] }
  const {
    OVERVIEW_SHIFTS_FETCHING,
    OVERVIEW_SHIFTS_SUCCESS,
    OVERVIEW_SHIFTS_FAILED,
  } = OT
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVEIW_FETCH_SHIFT })
    yield put({ type: OVERVIEW_SHIFTS_FETCHING })

    const report = yield call(
      fetchingTask,
      options,
      apiShifts()
    )
    yield put({ type: OVERVIEW_SHIFTS_SUCCESS, result: report })
    return report
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVEIW_FETCH_SHIFT })
  }
}

export function* fetchOverview(shift, areaSelected) {
  const options = { status: [] }
  const {
    OVERVIEW_OVERVIEW_FETCHING,
    OVERVIEW_OVERVIEW_SUCCESS,
    OVERVIEW_OVERVIEW_FAILED,
  } = OT
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVEIW_FETCH_OVERVIEW })
    yield put({ type: OVERVIEW_OVERVIEW_FETCHING })
    const report = yield call(
      fetchingTask,
      options,
      apiOverview(shift, areaSelected)
    )
    yield put({ type: OVERVIEW_OVERVIEW_SUCCESS, result: report })
    return report
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVEIW_FETCH_OVERVIEW })
  }
}

export function* fetchOverviewAbnormalList(shift, c_id, areaSelected) {
  const options = { status: [] }
  const {
    OVERVIEW_ABNORMAL_LIST_FETCHING,
    OVERVIEW_ABNORMAL_LIST_SUCCESS,
    OVERVIEW_ABNORMAL_LIST_FAILED,
  } = OT
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_FETCH_ABNORMAL })
    yield put({ type: OVERVIEW_ABNORMAL_LIST_FETCHING })
    const report = yield call(
      fetchingTask,
      options,
      apiOverviewAbnormalList(shift, c_id, areaSelected)
    )
    yield put({ type: OVERVIEW_ABNORMAL_LIST_SUCCESS, result: report })
    return report
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_FETCH_ABNORMAL })
  }
}

/* --------------------------------------------------------------------
 * Refresh task
 * -------------------------------------------------------------------- */
function* pollingTask() {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.OVERVIEW_POLLING_TASK })
    let { shift, shifts, category, areaSelected } = yield select(state => selector(state))
    // if only have one default key
    if (Array.isArray(shifts) && !shifts[1]) {
      shifts = yield call(fetchShifts)
    }
    shift = shift ? shift : yield defaultShift(moment(Date.now().valueOf()).format('HH:mm'))  || 'all'
    category = category || 'all'
    areaSelected = areaSelected || 'all'

    if (shift && category) {
      yield call(fetchOverview, shift, areaSelected)
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_SHIFT, shift: shift, areaSelected: areaSelected })
      yield call(fetchOverviewAbnormalList, shift, category, areaSelected)
      yield put({ type: OT.OVERVIEW_OVERVIEW_CHANGE_CATEGORY, category })
    }
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.OVERVIEW_POLLING_TASK })
  }
}

function* checkIfNeedToPollTask() {
  return true
}
