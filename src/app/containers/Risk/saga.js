import { call, take, put, select, fork } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import RT from './action-types'
import { fetchUserBar } from 'sagas/patient'
import { getLibs } from 'app/apis/risk'
import { categoryModuleSelector } from './selector'

export const preload = (params, query) => function* () {
  try {
    yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.RISK_PRELOAD })
    yield call(fetchUserBar, params, query)
    yield call(fetchRiskLibs)

    if (!__CLIENT__) {
      yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_PRELOAD })
      return
    }
    const modules = yield loadSbpModules()
    yield put({ type: RT.RISK_LOAD_MODULES, modules })
    yield call(fetchCategoryModuleData, params.p_id, params.record, query.c_id, query.m_id)
  } catch (ex) {
    console.error(ex.message)
  } finally {
    yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.RISK_PRELOAD })
  }
}

// get all categories/modules of risks
export function* fetchRiskLibs() {
  const fetched = yield select(state => state.patient.getIn(['record', 'risk', 'libs', 'result']).size > 0)
  if (fetched) {
    return
  }
  const status = [RT.RISK_LIBS_REQUEST, RT.RISK_LIBS_SUCCESS, RT.RISK_LIBS_FAILED]
  const fetch = getLibs()
  const result = yield call(fetchingTask, { status, showLoading: false }, fetch)
  return result
}

// fetch the needed data according to the different category and module
export function* fetchCategoryModuleData(patientId, rId, cId, mId) {
  // const { c_id, m_id } = yield select(state => categoryModuleSelector(state))
  const currentModuleId = yield select(state => state.patient.getIn(['record', 'risk', 'module', 'moduleId']))
  if (currentModuleId != mId) {
    yield put({ type: RT.RISK_MODULE_SELECT, moduleId: mId })
  }

  const modulePreload = yield select(state => state.patient.getIn(['record', 'risk', 'modules', mId, 'preload']))
  if (modulePreload) {
    yield call(modulePreload, patientId, rId, cId, mId)
  }
}

export const loadSbpModules = () => new Promise((resolve) => {
  const modulesArray = [
    require('./Modules/Sbp/Range'),
    require('./Modules/Sbp/Probability'),
    require('./Modules/Sbp/Estimation'),
  ]

  const modules = modulesArray.reduce((reduced, module) => {
    const { categoryId, moduleId } = module
    reduced[moduleId] = module
    return reduced
  }, {})

  resolve(modules)
})
