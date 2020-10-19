import { simulate as simulateTask, updatePersonaThreshold as updatePersonaThresholdTask, fetchSystemThreshold as fetchSystemThresholdTask, updateSystemThreshold as updateSystemThresholdTask} from './saga'
import TYPES from 'constants/action-types'
import VT from './action-types'

export function selectTime(selectedTime) {
  return {
    type: VT.RISK_SBP_SELECT_TIME,
    selectedTime: new Date(selectedTime).valueOf(),
  }
}

export function simulate(data, startTime, endTime) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: simulateTask,
    args: [data, startTime, endTime],
  }
}

export function clearSimulation() {
  return {
    type: VT.RISK_CLEAR_SIMULATION,
  }
}


export function updatePersonaThreshold(setting_threshold) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: updatePersonaThresholdTask,
    args: [setting_threshold],
  }
}

export function getSystemThreshold() {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: fetchSystemThresholdTask,
  }
}

export function updateSystemThreshold(status) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: updateSystemThresholdTask,
    args: [status],
  }
}