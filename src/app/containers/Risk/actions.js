import { preload } from './saga'
import TYPES from 'constants/action-types'
import RT from './action-types'

export function preloader({ params, query }) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preload(params, query)
  }
}

export function selectModule(moduleId) {
  return {
    type: RT.RISK_MODULE_SELECT,
    moduleId,
  }
}
