import { call, take, put, select, fork } from 'redux-saga/effects'
import { fetchUserBar } from 'sagas/patient'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import DT from './action-types'
import { getDashboard, getRiskSummary } from 'app/apis/search'
import { status as statusField, record as recordField, test as testField } from 'app/schemas/dashboard'
import { startToPoll } from 'sagas/polling-task'
import { fetchDetail, chartRangeSelector } from 'containers/Record'

const checkIfNeedPoll = (patientId, rId) => function* () {
  yield call(fetchDetail, patientId, rId)
  const { isRecordFinished } = yield select(chartRangeSelector)
  if (isRecordFinished) {
    return false
  } else {
    return true
  }
}

export const preload = (params, query) => function* () {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.DASHBOARD_PRELOAD })
    yield call(fetchUserBar, params, query)
    yield [
      call(fetchDashboard, params.p_id, params.record),
      call(fetchRiskSummary, params.p_id, true),
    ]
    yield fork(startToPoll, checkIfNeedPoll(params.p_id, params.record), polling, params.p_id, params.record)
    return true
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.DASHBOARD_PRELOAD })
  }
}

export function* fetchDashboard(patientId, record, isForceFetch) {
  const rid = yield select((state) => state.patient.getIn(['record', 'dashboard', recordField, 'result']))

  if (!isForceFetch) {
    if (record === rid) {
      return
    }
  }
  const notesformat = yield select((state) => state.globalConfigs.get('notesformat'))
  const status = [DT.FETCH_DASHBOARD_REQUEST, DT.FETCH_DASHBOARD_SUCCESS, DT.FETCH_DASHBOARD_FAILED]
  const fetch = getDashboard(patientId, record, notesformat)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
}

export function* fetchRiskSummary(patientId, isForceFetch) {
  const { pid, fetched, recordId } = yield select(state => ({
    pid: state.patient.get('patient_id'),
    fetched: !!state.patient.getIn(['record', 'dashboard', 'summary', 'result']),
    recordId: state.patient.getIn(['record', 'record_id']),
  }))

  if (!isForceFetch) {
    if (pid == patientId && fetched) {
      return
    } else if (!recordId) {
      return
    }
  }

  const status = [DT.FETCH_SUMMARY_REQUEST, DT.FETCH_SUMMARY_SUCCESS, DT.FETCH_SUMMARY_FAILED]
  const fetch = getRiskSummary(patientId, recordId)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

function* polling(patientId, recordId) {
  yield [
    call(fetchDashboard, patientId, recordId),
    call(fetchRiskSummary, patientId, true),
  ]
}
