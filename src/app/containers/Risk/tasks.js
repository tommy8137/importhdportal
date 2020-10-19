import { accessRiskChart } from 'app/apis/risk'
import { select, call, put } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import RT from './action-types'

export function* checkAccessRiskChart(patientId, rId, cId, mId, time) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_CHECK_ACCESS_RISK_CHART })
    yield call(fetchingTask, { showLoading: false }, accessRiskChart(cId, mId, time, patientId, rId))
    return true
  } catch (ex) {
    // error pop-up will be shown at the fetchingTask
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_CHECK_ACCESS_RISK_CHART })
    return false
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_CHECK_ACCESS_RISK_CHART })
  }
}
