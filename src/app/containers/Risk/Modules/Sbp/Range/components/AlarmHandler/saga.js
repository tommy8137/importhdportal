import { call, take, put, select, fork, cancelled, cancel, spawn } from 'redux-saga/effects'
import AT from './action-types'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import { setAlarmPharse } from 'app/apis/risk/modules/sbp/variation'
import { fetchingTask } from 'sagas/fetch'
import { reFetchAlarmRelativeData } from '../AlarmPhraseModal'

import moment from 'moment'
// ----------------------------------------------------------------------------
// API executor
// ----------------------------------------------------------------------------
export function* updateAlarmKeepObserve(data, notesformat) {
  const status = [
    AT.RISK_ALARM_PHARSE_SET_KEEP_OBSERVE_REQUEST,
    AT.RISK_ALARM_PHARSE_SET_KEEP_OBSERVE_SUCCESS,
    AT.RISK_ALARM_PHARSE_SET_KEEP_OBSERVE_FAILED,
  ]
  const fetch = setAlarmPharse(data, notesformat)
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

// ----------------------------------------------------------------------------
// Saga tasks
// ----------------------------------------------------------------------------
export function* keepObserveTask(selectedTime, notesformat) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_SET_ALARM_KEEP_OBSERVE })
    const recordId = yield select(state=> state.patient.getIn(['record', 'record_id']))
    const data = {
      hdrec_id: recordId,
      sbp_time: selectedTime,
      ev_status: 1, // <1|2> (<觀察中|已處理>)
    }
    yield call(updateAlarmKeepObserve, data, notesformat)
    yield call(reFetchAlarmRelativeData)

  } catch (ex) {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_SET_ALARM_KEEP_OBSERVE })
    console.error(ex.message)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_SET_ALARM_KEEP_OBSERVE })
  }
}
