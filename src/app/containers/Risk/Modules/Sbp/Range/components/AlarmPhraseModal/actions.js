import { showAlarmPharseModalTask, submitAlarmPharseTask } from './saga'
import TYPES from 'constants/action-types'

// ----------------------------------------------------------------------------
// Action creators
// ----------------------------------------------------------------------------
export function showAlarmPharseModalAC(pharseArray, selectedTime) {
  const data = { ...pharseArray, selectedTime }
  return {
    type: TYPES.APP_SET_MODAL,
    content: data,
    visible: true,
    modalType: 'alarmPharse',
  }
}

// ----------------------------------------------------------------------------
// Saga task action creators
// ----------------------------------------------------------------------------
export function showAlarmPharseModalSAC(selectedTime) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: showAlarmPharseModalTask,
    args: [selectedTime],
  }
}

export function submitAlarmPharseSAC(data, notesformat) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: submitAlarmPharseTask,
    args: [data, notesformat],
  }
}

