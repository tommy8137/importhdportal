import { buffers } from 'redux-saga'
import { actionChannel, call, select, put } from 'redux-saga/effects'
import { fetchingTask } from '../fetch'
import {
  searchPatient as apiSearchPatient,
  searchRecordList as apiSearchRecordList,
} from 'app/apis/search'
import TYPES from 'constants/action-types'

const USERBAR_PRELOADED = '@[USERBAR_PRELOADED]'

export function* fetchUserBar (params, query) {
  if (!params.p_id) {
    throw new Error('p_id is not found')
  }

  const tasks = []
  const patientId = params.p_id
  const record = params.record
  yield [
    call(fetchPatient, patientId),
    call(fetchRecords, patientId, record),
  ]
}

export function* fetchPatient(patientId) {
  if (!patientId) {
    throw new Exception('patient id could not be undefined nor null.')
  }
  const current = yield select((state) => ({ patientId: state.patient.get('patient_id'), fetched: state.patient.get('fetched') }))
  if (current.patientId == patientId && current.fetched) {
    return
  }
  const status = [TYPES.FETCH_PATIENT_REQUEST, TYPES.FETCH_PATIENT_SUCCESS, TYPES.FETCH_PATIENT_FAILED]
  const fetch = apiSearchPatient(patientId)
  yield call(fetchingTask, { status, showLoading: false }, fetch)
}

export function* fetchRecords(patientId, record) {
  if (!patientId) {
    throw new Exception('patient id could not be undefined nor null.')
  }

  if (!record) { //dont fetch data
    throw new Error('record id should be provided.')
  }

  const current = yield select((state) => ({ patientId: state.patient.get('patient_id'), fetched: state.patient.get('record').get('fetched') }))
  // set the current record
  yield put({ type: TYPES.PATIENT_SELECT_RECORD,  recordId: record })
  if (current.fetched && current.patientId == patientId) {
    return
  }

  const fetch = apiSearchRecordList(patientId)
  const status = [TYPES.FETCH_RECORD_LIST_REQUEST, TYPES.FETCH_RECORD_LIST_SUCCESS, TYPES.FETCH_RECORD_LIST_FAILED]

  yield call(fetchingTask, { status, showLoading: false }, fetch)
}

/**
 * it is not decided to use record_id or date to present record right now
 * @param {[type]} record        [description]
 * @yield {[type]} [description]
 */
export function* fetchRecordDetail(record) {
  const records = yield select((state) => state.patient.get('record').get('entities'))

  if (!record) { //dont fetch data
    throw new Error('record id should be provided.')
  }

  const current = yield select((state) => state.patient.get('record'))
  if (record == current.get('record_id') && current.get('fetched')) {
    return
  }
  const selected = yield select((state) => state.patient.get('record').get('entities').filter(x => x.get('record_id') == record).first())

  if (!selected) {
    return
  }

}
