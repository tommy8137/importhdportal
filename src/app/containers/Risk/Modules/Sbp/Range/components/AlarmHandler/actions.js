import { keepObserveTask } from './saga'
import TYPES from 'constants/action-types'

// ----------------------------------------------------------------------------
// Saga task action creators
// ----------------------------------------------------------------------------
export function keepObserveSAC(selectedTime, notesformat) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: keepObserveTask,
    args: [selectedTime, notesformat],
  }
}
