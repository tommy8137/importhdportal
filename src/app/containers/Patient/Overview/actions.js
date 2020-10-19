import TYPES from 'constants/action-types'
import { preload as preloadTask, changeShiftTask, changeCategoryTask, changeBPTypeTask, changeAreaTask } from './saga.js'

export function preload({ params, query }) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preloadTask(params, query),
  }
}

export const actionCreators = {
  changeShift,
  changeCategory,
  changeBPType,
  changeArea,
}

export function changeShift(shift) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: changeShiftTask,
    args: [shift],
  }
}

export function changeCategory(shift, category, area) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: changeCategoryTask,
    args: [shift, category, area],
  }
}

export function changeBPType(shift, bp_type) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: changeBPTypeTask,
    args: [shift, bp_type],
  }
}

export function changeArea(area) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: changeAreaTask,
    args: [area],
  }
}
