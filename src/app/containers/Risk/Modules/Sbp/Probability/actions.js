import TYPES from 'constants/action-types'
import { simulate as simulateTask } from './saga'

export function simulate(time, data) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: simulateTask,
    args: [time, data],
  }
}
