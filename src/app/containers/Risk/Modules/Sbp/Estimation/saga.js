import { call, take, put, select, fork, spawn } from 'redux-saga/effects'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import ET from './action-types'
import moment from 'moment'
import { fetchingTask } from 'sagas/fetch'
import { predict as apiPredict } from 'app/apis/risk/modules/sbp/estimation'
import {
  lastPointSelector,
  greenLineSelector,
  fetchGreenLine,
  pollingTask,
  checkIfNeedPoll,
} from '../Range'
import { checkAccessRiskChart } from 'containers/Risk/tasks'
import { maxBlood, safeGetModuleState, getValidateErrMsg, categoryModuleSelector } from 'containers/Risk/selector'
import { categoryId, moduleId } from './reducer'
import { chartRangeSelector } from 'containers/Record/selector'
import { startToPoll } from 'sagas/polling-task'
import { isValidate, default as validate  } from 'common/modules/sbp/validator'
import { makePredictResultsWithTimes, makePredictions_, makePredictionTasks, hasDisease } from '../utils'
import { predict_total_uf } from '../Range/saga.js'

export function* preload(patientId, rId, cId, mId) {
  yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_ESTIMATION_PRELOAD })
  const key = `${patientId}-${rId}-sbp-estimation`
  const greenLine = yield call(fetchGreenLine, patientId, rId)
  const { time } = yield select(lastPointSelector)
  const { disableSimulator } = yield select(chartRangeSelector)
  const predictions = yield call(predict)

  const lastPoint = yield select(lastPointSelector)
  const predict_uf = yield call(predict_total_uf, lastPoint.uf, lastPoint.time)

  const result = {
    key,
    time,
    greenLine,
    predictions,
    predict_uf,
  }
  yield put({ type: ET.RISK_SBP_ESTIMATION_PRELOAD, result })
  yield spawn(startToPoll, checkIfNeedPoll(patientId, rId), pollingTask, patientId, rId, mId, predict)
  yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_ESTIMATION_PRELOAD })
}

function* predict() {
  const patient = yield select(state => state.patient)
  const record = yield select(state => state.patient.get('record'))
  const dataSbp = record.getIn(['detail', 'entities', 'items', maxBlood, 'data'])
  const result = record.getIn(['detail', 'result'])

  if (!patient.get('patient_id') || !patient.get('name')) {
    return
  }

  const { endTime } = yield select(chartRangeSelector)
  const age = patient.get('age')
  const gender = patient.get('gender')
  const dm = hasDisease(patient.get('diseases'), 'dm')
  const temperature = result.get('temperature')
  const dryweight = result.get('dryweight')
  const dialysis_year = result.get('dialysis_year')
  const date = moment().format('YYYY-MM-DD')
  const basicData = {
    age,
    gender,
    dm,
    temperature,
    dialysis_year,
    dryweight,
    date,
  }
  if (!basicData.temperature) {
    basicData.temperature = 36
  }
  const predictTasks = yield call(makePredictionTasks, apiPredict, basicData)
  const ifAnyPointValidatePass = predictTasks.reduce((accumulator, currentValue) => accumulator && !!currentValue, true)
  if (!ifAnyPointValidatePass) {
    const errMsg = yield select(getValidateErrMsg())
    yield put({ type: TYPES.APP_SET_MODAL, content: errMsg, visible: true, modalType: 'warning' })
  }
  const results = yield predictTasks
  const makeEstimationResults = makePredictResultsWithTimes('res_bp_estimation', dataSbp)
  const makePredictions = makePredictions_(endTime, makeEstimationResults)

  return makePredictions(results)
}

export function* simulate(data, startTime, endTime) {
  const errors = validate({ FormSBP : data })
  if (Object.keys(errors).length > 0) {
    const errMsg = yield select(getValidateErrMsg(errors))
    yield put({ type: TYPES.APP_SET_MODAL, content: errMsg, visible: true, modalType: 'warning' })
    return
  }

  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_ESTIMATION_SIMULATE })
    const rId = yield select(state => state.patient.getIn(['record', 'record_id']))
    const pId = yield select(state => state.patient.get('patient_id'))
    const { c_id, m_id } = yield select(categoryModuleSelector)

    const available = yield checkAccessRiskChart(pId, rId, c_id, m_id, startTime)
    if (!available) {
      yield put({ type: ET.RISK_SBP_ESTIMATION_SIMULATE_SUCCESS, result: null })
      yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_ESTIMATION_SIMULATE })
      return
    }

    const dialysis_year = yield select((state) => state.patient.getIn(['record', 'detail', 'result', 'dialysis_year']))
    data.dialysis_year = dialysis_year
    data.date = moment().format('YYYY-MM-DD')
    const fo = apiPredict(data)
    const { res_bp_estimation: res } = yield call(fetchingTask, { showLoading: false }, fo)
    const simulations = res
      .map((r, idx) => ({ ...r, time: startTime + idx * 60 * 1000 }))
      .filter(r => r.time <= endTime)
    const simulate_total_uf = yield call(predict_total_uf, data.uf, startTime)

    yield put({ type: ET.RISK_SBP_ESTIMATION_SIMULATE_SUCCESS, result: simulations, simulate_total_uf })
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_ESTIMATION_SIMULATE })
  }
}
