import TYPES from 'constants/action-types'
import RT from './action-types'
import { preload as preloadTask, selectPanelItemTask } from './saga'

const { SAGA_CUSTOM_TASK } = TYPES

export function toggleParam(param, forceToBe) {
  return {
    type: RT.RECORD_TOGGLE_PARAM,
    param,
    forceToBe,
  }
}

export function preload({ params, query }) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preloadTask(params, query),
  }
}

export function selectTime(time) {
  return {
    type: RT.RECORD_SELECT_TIME,
    time,
  }
}

export function selectPanelItem(piId) {
  return {
    type: SAGA_CUSTOM_TASK,
    task: selectPanelItemTask,
    args: [piId],
  }
}
