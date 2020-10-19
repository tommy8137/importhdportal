import { call, take, put, select, fork, cancelled, cancel, spawn } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import AT from './action-types'
import { TYPES as RT } from 'containers/Record'
import { showAlarmPharseModalAC } from './actions'
import { getAlarmPharse, setAlarmPharse } from 'app/apis/risk/modules/sbp/variation'
import { fetchDashboard } from 'containers/Dashboard'
import { fetchDetail } from 'containers/Record'
import { fetchOverviewAbnormalList } from 'containers/Patient/Overview'
import { fetchRiskSummary } from 'containers/Dashboard'
import { closeModal } from 'actions/app-action'

// ----------------------------------------------------------------------------
// API executor
// ----------------------------------------------------------------------------
export function* fetchAlarmPharse(notesformat) {
  const status = [
    AT.RISK_ALARM_PHARSE_FETCH_REQUEST,
    AT.RISK_ALARM_PHARSE_FETCH_SUCCESS,
    AT.RISK_ALARM_PHARSE_FETCH_FAILED,
  ]
  const fetch = getAlarmPharse(notesformat)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

// ----------------------------------------------------------------------------
export function* submitAlarmPharse(data, notesformat) {
  const status = [
    AT.RISK_ALARM_PHARSE_SUBMIT_REQUEST,
    AT.RISK_ALARM_PHARSE_SUBMIT_SUCCESS,
    AT.RISK_ALARM_PHARSE_SUBMIT_FAILED,
  ]
  const fetch = setAlarmPharse(data, notesformat)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

// ----------------------------------------------------------------------------
// Saga tasks
// ----------------------------------------------------------------------------
export function* showAlarmPharseModalTask(selectedTime) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_FETCH_ALARM_PHRASE_LIST })
    const notesformat = yield select(state=> state.globalConfigs.get('notesformat'))
    const alarmPharses = yield call(fetchAlarmPharse, notesformat)
    yield put(showAlarmPharseModalAC(alarmPharses, selectedTime))
  } catch (ex) {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_FETCH_ALARM_PHRASE_LIST })
    console.error(ex.message)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_FETCH_ALARM_PHRASE_LIST })
  }
}

// ----------------------------------------------------------------------------
export function* submitAlarmPharseTask(partialData, notesformat) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_SUBMIT_ALARM_PHARSE })
    yield put(closeModal())

    const recordId = yield select(state=> state.patient.getIn(['record', 'record_id']))
    const data = {
      hdrec_id: recordId,
      ev_status: 2, // <1|2> (<觀察中|已處理>)
      ...partialData,
    }

    yield call(submitAlarmPharse, data, notesformat)
    // if success, update alarm pharse to redux store
    // make sure the result is updated in Record / Dashboard
    yield call(reFetchAlarmRelativeData)

  } catch (ex) {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_SUBMIT_ALARM_PHARSE })
    console.error(ex.message)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_SUBMIT_ALARM_PHARSE })
  }
}

export function* reFetchAlarmRelativeData () {
  const patientId = yield select(state=> state.patient.get('patient_id'))
  const recordId = yield select(state=> state.patient.getIn(['record', 'record_id']))
  const FORCE_FETCH = true
  yield call(fetchDashboard, patientId, recordId, FORCE_FETCH),
  yield call(fetchDetail, patientId, recordId, FORCE_FETCH),
  yield call(fetchRiskSummary, patientId, FORCE_FETCH)

  const { shift, c_id, areaSelected } = yield select(state => {
    const overview = state.overview.overview
    return {
      shift: overview.get('shift'),
      c_id: overview.get('category'),
      areaSelected: overview.get('areaSelected'),
    }
  })

  if (shift && c_id && areaSelected) {
    yield call(fetchOverviewAbnormalList, shift, c_id, areaSelected)
  }
}
