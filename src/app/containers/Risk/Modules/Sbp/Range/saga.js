import { call, take, put, select, fork, cancelled, cancel, spawn } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { sbpPredict /* , getRemindings */ } from 'app/apis/risk/modules/sbp/variation'
import { getSystemThreshold as getSystemThresholdApi, setPersonalThreshold as setPersonalThresholdApi } from 'app/apis/risk'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import VT from './action-types'
import { greenLineSelector, lastPointSelector } from './selector'
import { mapItems } from '../components/FormSBP/selector'
import { checkAccessRiskChart } from 'containers/Risk/tasks'
import { maxBlood, categoryModuleSelector, getValidateErrMsg } from 'containers/Risk/selector' // Risk/selector
import moment from 'moment'
import { Iterable, fromJS } from 'immutable'
import { fetchDetail as fetchRecordDetail } from 'containers/Record/saga'
import { chartRangeSelector } from 'containers/Record/selector'
import { fetchDashboard } from 'containers/Dashboard/saga'
import { startToPoll } from 'sagas/polling-task'
import { isValidate, default as validate  } from 'common/modules/sbp/validator'
import R from 'ramda'
import { makePredictResultsWithTimes, makePredictions_, makePredictionTasks, hasDisease } from '../utils'

export const checkIfNeedPoll = (patientId, rId) => function* () {
  const key = yield select(state => state.patient.getIn(['record', 'risk', 'module', 'state', 'key']))
  const firstCheck = yield select(chartRangeSelector)
  if (!key || firstCheck.isRecordFinished) {
    return false
  }
  yield call(fetchGreenLine, patientId, rId)
  const afterFetch = yield select(chartRangeSelector)
  if (afterFetch.isRecordFinished ) {
    return false
  } else {
    return true
  }
}

export function* preload(patientId, rId, cId, mId) {
  try {
    const recordId = yield select(state=> state.patient.getIn(['record', 'record_id']))
    
    const key = `${patientId}-${rId}-sbp`
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_RANGE_PRELAOD })
    const module = yield select(state => state.patient.getIn(['record', 'risk', 'module']))
    if ((module.get('moduleId') && module.get('moduleId') != mId) || module.getIn(['state', 'key']) == key) {
      return
    }
    const [greenLine /* , remindingsResult */] = yield [
      call(fetchGreenLine, patientId, rId),
      // call(fetchRemindings, cId, mId),
    ]
    const systemThreshold = yield call(fetchSystemThreshold, recordId)
    const lastTime = yield call(selectLastPointTask, greenLine)
    // need to wait for the necessary data fetchd above
    const predictions = yield call(predict)

    const lastPoint = yield select(lastPointSelector)
    const predict_uf = yield call(predict_total_uf, lastPoint.uf, lastPoint.time)


    const result = {
      key,
      greenLine,
      selectedTime: lastTime,
      predictions,
      // remindings: remindingsResult ? remindingsResult.remindings: null,
      predict_uf,
      displayThreshold: systemThreshold.status,
      max_threshold: systemThreshold.max_threshold,
      min_threshold: systemThreshold.min_threshold,
      personal_threshold: systemThreshold.personal_threshold,
      thresholdEditable: systemThreshold.editable,
    }
    yield put({ type: VT.RISK_SBP_VARIATION_PRELOAD, result })
    yield spawn(startToPoll, checkIfNeedPoll(patientId, rId), pollingTask, patientId, rId, mId, predict)
  } catch (ex) {
    const result = {
      key: null,
      greenLine: [],
      selectedTime: null,
      predictions: null,
      // remindings: null,
      predict_uf: null,
      displayThreshold: null,
      max_threshold: null,
      min_threshold: null,
      personal_threshold: null,
      thresholdEditable: null,
    }
    yield put({ type: VT.RISK_SBP_VARIATION_PRELOAD, result })
    console.error(ex.message)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_RANGE_PRELAOD })
  }
}

// export function* fetchRemindings(cId, mId, data) {
//   const fetch = getRemindings(cId, mId, data)
//   const result = yield call(fetchingTask, { showLoading: false }, fetch)
//   return result
// }

export function* fetchGreenLine(patientId, rId) {
  const isFetchSBPAlarm = true
  yield [
    call(fetchDashboard, patientId, rId),
    call(fetchRecordDetail, patientId, rId, isFetchSBPAlarm),
  ]

  const sbpData = yield select(state => state.patient.getIn(['record', 'detail', 'entities', 'items', maxBlood, 'data']))

  const greenLine = sbpData
    ? sbpData.map(datum => ({ time: parseInt(datum.get('time')), value: datum.get('value') }))
        .sort((a, b) => a.time > b.time)
    : fromJS([])
  return greenLine
}

export function* predict() {
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
  const dialysis_year = result.get('dialysis_year')
  const dryweight = result.get('dryweight')
  const date = moment().format('YYYY-MM-DD')
  const basicData = {
    age,
    gender,
    dm,
    temperature,
    dryweight,
    date,
    dialysis_year,
  }
  if (!basicData.temperature) {
    basicData.temperature = 36
  }
  const predictTasks = yield call(makePredictionTasks, sbpPredict, basicData)
  const ifAnyPointValidatePass = predictTasks.reduce((accumulator, currentValue) => accumulator && !!currentValue, true)
  if (!ifAnyPointValidatePass) {
    const errMsg = yield select(getValidateErrMsg())
    yield put({ type: TYPES.APP_SET_MODAL, content: errMsg, visible: true, modalType: 'warning' })
  }
  const results = yield predictTasks
  const makeRangeResults = makePredictResultsWithTimes('res_bp_variation', dataSbp)
  const makePredictions = makePredictions_(endTime, makeRangeResults)

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
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_RANGE_SIMULATE })
    const rId = yield select(state => state.patient.getIn(['record', 'record_id']))
    const pId = yield select(state => state.patient.get('patient_id'))
    const { c_id, m_id } = yield select(state => categoryModuleSelector(state))
    // for performance issue, mark this
    // const available = yield checkAccessRiskChart(pId, rId, c_id, m_id, startTime)
    // if (!available) {
    //   yield put({ type: VT.RISK_SBP_SIMULATE_SUCCESS, result: null })
    //   yield put({ type: TYPES.APP_LOADING, isBusy: false })
    //   return
    // }
    const dialysis_year = yield select((state) => state.patient.getIn(['record', 'detail', 'result', 'dialysis_year']))
    data.dialysis_year = dialysis_year
    data.date = moment().format('YYYY-MM-DD')

    const status = [VT.RISK_SBP_SIMULATE_REQUEST]
    const fetch = sbpPredict(data)
    const { res_bp_variation: res } = yield call(fetchingTask, { status, showLoading: false }, fetch)
    const simulation = []
    let min = 0

    while (startTime + min * 60 * 1000 <= endTime) {
      simulation.push({
        time: startTime + min * 60 * 1000,
        LB: res[min].LB,
        LB_LB: res[min].LB_LB,
        UB: res[min].UB,
        UB_UB: res[min].UB_UB,
      })
      min++
    }
    const simulate_total_uf = yield call(predict_total_uf, data.uf, startTime)
    yield put({ type: VT.RISK_SBP_SIMULATE_SUCCESS, result: simulation, predict_uf: simulate_total_uf })
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_RANGE_SIMULATE })
  }
}

export function* predict_total_uf(simulate_uf, simulateTime) {
  const items = (yield select((state) => state.patient.getIn(['record', 'detail', 'entities', 'items']))).toJS()
  let lastPoint = yield select(lastPointSelector)

  if ( Object.keys(items).length != 0 && Object.keys(lastPoint).length != 0 && lastPoint.time && lastPoint.total_uf && lastPoint.uf) {
    const first_time = items.sbp.data[0].time
    const dialysisDuration = Math.floor((lastPoint.time - first_time) / ( 1000 * 60 ))
    const T1toT2 = Math.floor((simulateTime - lastPoint.time) / ( 1000 * 60 ))

    if ((240 - dialysisDuration > 0) && ((240 - dialysisDuration - T1toT2) > 0)){
      return (lastPoint.total_uf + ((lastPoint.uf * T1toT2) / 60) + (simulate_uf * ( 240 - dialysisDuration - T1toT2) / 60) ).toString().match(/^-?\d+(?:\.\d{0,3})?/)[0]
    } else return null
  } else {
    return null
  }
}

export function* selectLastPointTask(greenLine) {
  if (!Iterable.isIterable(greenLine) || greenLine.size < 1) {
    return null
  }
  return greenLine.last().time
}

export function* pollingTask(patientId, rId, mId, predict) {
  let refreshing = yield call(fetchGreenLine, patientId, rId)
  let current = yield select(greenLineSelector(mId))
  const lastPoint = current.raw[current.raw.length - 1]
  const newArrivals = !lastPoint
    ? refreshing.toArray()
    : refreshing.filter(r => r.time > lastPoint.time).toArray()
  if (newArrivals.length > 0) {
    const predictions = yield call(predict)
    const result = {
      greenLine: refreshing,
      newArrivals,
      predictions,
    }
    yield put({
      type: VT.RISK_SBP_REFRESH_DATA,
      result,
    })
  }
}

export function* updateSystemThreshold(Threshold_status) {
  console.log("updateSystemThreshold saga Threshold_status ",Threshold_status)
    yield put({
      type: VT.UPDATE_SYSTEM_THRESHOLD_SUCCESS,
      result: Threshold_status,
    })
    return Threshold_status
}

// get personal threshold data getSystemThreshold
export function* fetchSystemThreshold(r_id) {
  if(!r_id){
    r_id = yield select(state=> state.patient.getIn(['record', 'record_id']))
  }
  if (r_id){
    const fetch = getSystemThresholdApi(r_id)
    const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
    console.log("result",result)
    yield put({
      type: VT.PERSONAL_SYSTEM_THRESHOLD_SUCCESS,
      result,
    })
    return result
  } else {
    return true
  }
}
// set personal threshold data setSystemThreshold
export function* updatePersonaThreshold(setting_threshold) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.SET_PERAONAL_THRESHOLD })
    const r_id = yield select(state=> state.patient.getIn(['record', 'record_id']))
    const fetch = setPersonalThresholdApi(r_id, setting_threshold)
    const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
    yield put({
      type: VT.SET_PERSONAL_THRESHOLD_SUCCESS,
      result,
    })
  } catch(ex){
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.SET_PERAONAL_THRESHOLD })
  }
}
