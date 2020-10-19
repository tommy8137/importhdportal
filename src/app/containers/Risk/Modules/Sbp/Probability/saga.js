import { call, take, put, select, fork, spawn } from 'redux-saga/effects'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import PT from './action-types'
import moment from 'moment'
import { fetchingTask } from 'sagas/fetch'
import { predict as apiPredict } from 'app/apis/risk/modules/sbp/probability'
import {
  lastPointSelector,
  greenLineSelector,
  fetchGreenLine,
  pollingTask,
  checkIfNeedPoll,
  preDiaTempSelector,
} from '../Range'
import { checkAccessRiskChart } from 'containers/Risk/tasks'
import { safeGetModuleState, getValidateErrMsg } from 'containers/Risk/selector'
import { categoryId, moduleId } from './reducer'
import { chartRangeSelector } from 'containers/Record/selector'
import { startToPoll } from 'sagas/polling-task'
import { isValidate, default as validate  } from 'common/modules/sbp/validator'
import { predict_total_uf } from '../Range/saga.js'

const pollingPredict = (rId) => function* () {
  const { time } = yield select(lastPointSelector)
  const module = yield select(safeGetModuleState(moduleId))
  const [ul, ulnum] = module
    ? [module.get('ul'), module.get('ulnum')]
    : [0, 100]

  const predictions = yield predict(time, rId, ul, ulnum)
  return predictions
}


export function* preload(patientId, rId, cId, mId) {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_PROBABILITY_PRELOAD })
    const key = `${patientId}-${rId}-sbp-probability`
    const [greenLine] = yield [
      call(fetchGreenLine, patientId, rId),
    ]
    if (greenLine && greenLine.size > 0) {
      const { time } = yield select(lastPointSelector)
      const diff = parseInt((time - greenLine.first().time) / 60000 )
      const { disableSimulator } = yield select(state => chartRangeSelector(state))
      const predictions = !disableSimulator
        ? yield predict(time, rId, 0, 100, diff)
        : []

      const lastPoint = yield select(lastPointSelector)
      const predict_uf = yield call(predict_total_uf, lastPoint.uf, lastPoint.time)

      yield put({ type: PT.RISK_SBP_PROB_PRELOAD, result: { greenLine, key, time, predictions, predict_uf } })
      yield spawn(startToPoll, checkIfNeedPoll(patientId, rId), pollingTask, patientId, rId, mId, pollingPredict(rId))
    } else {
      const result = {
        greenLine: [],
        time: null,
        key,
        predictions: [],
        predict_uf: null,
      }
      yield put({ type: PT.RISK_SBP_PROB_PRELOAD, result })
    }
  } catch (ex) {
    console.error(ex)
  }  finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_PROBABILITY_PRELOAD })
  }
}

export function* predict(time, rId, ul = 0, ulnum = 100, diff) {
  if (!time) {
    return []
  }

  if (!diff && diff != 0) {
    const greenLine = yield select(greenLineSelector(moduleId))
    if (greenLine.raw.length == 0) {
      return []
    }
    diff = parseInt((time - greenLine.raw[0].time) / 60000 )
  }
  let predictions = []
  const { time: _, ...data } = yield select(lastPointSelector)
  data.dia_temp_value = yield select(preDiaTempSelector)
  const dialysis_year = yield select((state) => state.patient.getIn(['record', 'detail', 'result', 'dialysis_year']))
  const currentRId = yield select(state => state.patient.getIn(['record', 'record_id']))
  const module = yield select(safeGetModuleState(moduleId))
  const currentSimulateTime = module
    ? module.get('simulateTime')
    : null
  if (currentRId == rId && currentSimulateTime == time && ul == module.get('ul') && ulnum == module.get('ulnum')) {
    predictions = module.get('predictions')
  } else {
    Object.assign(data, {
      date: moment().format('YYYY-MM-DD'),
      ul,
      ulnum,
      diff, // calculate how many minutes between them
      dialysis_year,
    })

    if (!data.ns) {
      data.ns = 50
    }
    if (isValidate(false, data)) {
      predictions = yield call(apiPredictTask, time, data, false)
    } else {
      const errMsg = yield select(getValidateErrMsg())
      yield put({ type: TYPES.APP_SET_MODAL, content: errMsg, visible: true, modalType: 'warning' })
    }
  }
  return predictions
}

export function* simulate(time, data) {
  const errors = validate({ FormSBP : data })
  if (Object.keys(errors).length > 0) {
    const errMsg = yield select(getValidateErrMsg(errors))
    yield put({ type: TYPES.APP_SET_MODAL, content: errMsg, visible: true, modalType: 'warning' })
    return
  }

  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_PROBABILITY_SIMULATE })
    const { ul, ulnum } = data
    const rId = yield select(state => state.patient.getIn(['record', 'record_id']))
    const predictions = yield predict(time, rId, ul, ulnum)
    const dialysis_year = yield select((state) => state.patient.getIn(['record', 'detail', 'result', 'dialysis_year']))
    data.dialysis_year = dialysis_year
    const simulations = yield call(apiPredictTask, time, data)
    const simulate_total_uf = yield call(predict_total_uf, data.uf, time)
    yield put({
      type: PT.RISK_SBP_PROB_SIMULATE_SUCCESS,
      time,
      ul,
      ulnum,
      predictions,
      simulations,
      simulate_total_uf,
    })
  } catch (ex) {
    console.error(ex)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_PROBABILITY_SIMULATE })
  }
}

export function* apiPredictTask(time, data, checkAccess = true) {
  data.ulnum = parseInt(data.ulnum)
  // patientId, rId,
  const patientId = yield select(state => state.patient.get('patient_id'))
  const rId = yield select(state => state.patient.getIn(['record', 'record_id']))
  // if (checkAccess) {
  //   const available = yield checkAccessRiskChart(patientId, rId, categoryId, moduleId, time)
  //   if (!available) {
  //     yield put({ type: TYPES.APP_LOADING, isBusy: false })
  //     return []
  //   }
  // }
  const result = yield call(fetchingTask, { showLoading: false }, apiPredict(data))
  return result.res_bp_probability? result.res_bp_probability: []
}
