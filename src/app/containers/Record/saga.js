import { call, take, put, select, fork } from 'redux-saga/effects'
import { fetchUserBar } from 'sagas/patient'
import { getRecordDetail } from 'app/apis/search'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import RT from './action-types'
import { fetchingTask } from 'sagas/fetch'
import { chartRangeSelector } from './selector'
import { startToPoll } from 'sagas/polling-task'

const checkIfNeedPoll = (patientId, rId) => function* () {
  const { isRecordFinished } = yield select(chartRangeSelector)
  if (isRecordFinished) {
    return false
  } else {
    return true
  }
}

export const preload = (params, query) => function* () {
  try {
    const { startTime, endTime } = yield select(chartRangeSelector)
    if (!startTime || !endTime) {
      yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RECORD_PRELOAD })
      yield call(fetchUserBar, params, query)
      yield call(fetchDetail, params.p_id, params.record)
    }
    yield call(selectPanelItemTask, query.pi_id)
    yield fork(startToPoll, checkIfNeedPoll(params.p_id, params.record), refreshDetail, params.p_id, params.record)
  } catch (ex)  {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RECORD_PRELOAD })
  }
}

function* detail(patientId, recordId, isForceFetch, notesformat) {
  const status = [RT.FETCH_RECORD_DETAIL_REQUEST, RT.FETCH_RECORD_DETAIL_SUCCESS, RT.FETCH_RECORD_DETAIL_FAILED]
  const fetch = getRecordDetail(patientId, recordId, isForceFetch, notesformat)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

export function* fetchDetail(patientId, recordId, isForceFetch) {
  // const isFetched = yield select((state) => state.patient.getIn(['record', 'detail', 'result', 'r_id']) == recordId)
  const { isRecordFinished } = yield select(chartRangeSelector)
  if (isRecordFinished) {
    return
  }
  const notesformat = yield select((state) => state.globalConfigs.get('notesformat'))
  const result = yield call(detail, patientId, recordId, isForceFetch, notesformat)
  const { FETCH_RECORD_DETAIL_REQUEST, FETCH_RECORD_DETAIL_SUCCESS, FETCH_RECORD_DETAIL_FAILED } = RT
  yield put({ type: FETCH_RECORD_DETAIL_SUCCESS, result })
}

export function* refreshDetail(patientId, recordId) {
  const { isRecordFinished } = yield select(chartRangeSelector)
  if (isRecordFinished) {
    return
  }
  const notesformat = yield select((state) => state.globalConfigs.get('notesformat'))
  const result = yield call(detail, patientId, recordId, false, notesformat)
  const { REFRESH_RECORD_DETAIL_SUCCESS } = RT
  yield put({ type: REFRESH_RECORD_DETAIL_SUCCESS, result })
}

export function* selectPanelItemTask(piId) {
  if (!piId) {
    yield call(selectLastTime)
    return
  }
  const entities = yield select(state => state.patient.getIn(['record', 'detail', 'entities']))
  const [intra, pre, post] = [entities.get('intra'), entities.get('pre'), entities.get('post')]
  const selected = (intra && intra.find(p => p.get('pi_id') == piId)) || (pre && pre.find(p => p.get('pi_id') == piId)) || (post && post.find(p => p.get('pi_id') == piId))
  if (selected) {
    yield call(selectPreNearestTime,  parseInt(selected.get('time')))
  } else {
    yield call(selectLastTime)
  }
  return
}

function* selectLastTime() {
  const items = yield select(state => state.patient.getIn(['record', 'detail', 'entities', 'items']))
  if (!items) {
    return
  }

  const lastTime = items.filter(item => item.get('type') == 'chart')
  .map(item => {
    const itemWithLastTime = item.get('data')
      ? item.get('data').maxBy(
        datum => datum.get('time'),
        (time1, time2) => (time1 - time2)
      )
      : null
    return itemWithLastTime ? itemWithLastTime.get('time') : null
  })
  .max((time1, time2) => time1 - time2)

  if (!lastTime) {
    return
  }

  yield put({ type: RT.RECORD_SELECT_TIME, time: parseInt(lastTime) })
}

function* selectPreNearestTime(selectTime) {

  const items = yield select(state => state.patient.getIn(['record', 'detail', 'entities', 'items']))
  if (!items) {
    return
  }

  let nearItemsSelectTime = items.filter(item => item.get('type') == 'chart')
    .map(item => {
      const itemWithTime = item.get('data')
        ? item.get('data') : null
      let itemNearSelectTime = Number.MAX_VALUE
      itemWithTime.forEach(i => {
        const time = i.get('time')
        const diff =  selectTime - i.get('time')
        itemNearSelectTime = (diff > 0 && diff < itemNearSelectTime) ? time :  itemNearSelectTime
      })
      return itemNearSelectTime != Number.MAX_VALUE  ? itemNearSelectTime : null
    })

  const nearSelectTime = nearItemsSelectTime.min((time1, time2) => {
    return time2 - time1
  })

  if (!nearSelectTime) {
    return
  }

  yield put({ type: RT.RECORD_SELECT_TIME, time: parseInt(nearSelectTime) })
}
