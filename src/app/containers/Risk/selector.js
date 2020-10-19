import { createSelector } from 'reselect'
import { timeFormat } from 'd3-time-format'
import TYPES from 'constants/action-types'
import { localeSelector } from 'reducers/locale-reducer'

export const maxBlood = 'sbp' // 高血壓

export const categoryModuleSelector = createSelector(
  (state) => state.routing.locationBeforeTransitions.query,
  (state) => state.patient.getIn(['record', 'risk', 'module']),
  ({ c_id }, currentModule) => {
    if (!currentModule) {
      return { c_id, m_id: null }
    }

    return {
      c_id,
      m_id: currentModule.get('moduleId'),
    }
  }
)

export const riskContainerSelector = createSelector(
  categoryModuleSelector,
  (state) => state.patient.getIn(['record', 'risk', 'modules']),
  ({ m_id }, modules) => {
    return modules.getIn([m_id, 'container'])
  }
)

export const libsSelector = createSelector(
  (state) => state.patient.getIn(['record', 'risk', 'libs', 'entities']),
  categoryModuleSelector,
  localeSelector,
  (entities, cm, ls) => {
    if (!entities.get('lib')) {
      return {
        categories: [],
        modules: [],
      }
    }
    let { c_id, m_id } = cm
    // not sure why we need to use string for keys here, it might be caused by normalizr.
    const modules = entities.getIn(['lib', c_id])
    ? entities.getIn(['lib', c_id, 'modules']).map(m => ({ value: m.toString(), label: ls(entities.getIn(['module', m.toString(), 'm_name'])) })).toArray()
    : []
    return {
      categories: entities.get('lib').map(l => ({ value: l.get('c_id').toString(), label: ls(l.get('c_name')) })).toArray(),
      modules,
    }
  }
)

export default createSelector(
  localeSelector,
  libsSelector,
  categoryModuleSelector,
  riskContainerSelector,
  (l, libs, cm, ModuleContainer) => ({
    l,
    ModuleContainer,
    ...libs,
    ...cm,
  })
)

export const safeGetModuleState = (moduleId) => createSelector(
  (state) => state.patient.getIn(['record', 'risk', 'module', 'state']),
  (state) => state.patient.getIn(['record', 'risk', 'module', 'moduleId']),
  (state, currentModuleId) => {
    if (currentModuleId != moduleId) {
      return null
    }
    return state
  }
)

export const globalConfigsSelector = createSelector(
  (state) => state.globalConfigs,
  (globalConfigs) => globalConfigs
)

export const getValidateErrMsg = (errors) => createSelector(
  localeSelector,
  (l) => {
    let errMsg = l('Missing data, can not predict!')
    // errors = Object.entries(errors).filter(([key, value]) => {
    //   return value == ERROR_MISS_DATA
    // })
    // errors.forEach((fieldError, index) => {
    //   let [key] = fieldError
    //   key = fieldNames[key]
    //   errMsg += l(key)
    //   if (index < (errors.length - 1)) {
    //     errMsg += ','
    //   }
    // })
    return errMsg
  }
)
