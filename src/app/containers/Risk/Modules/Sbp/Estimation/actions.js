import { simulate as simulateTask } from './saga'
import TYPES from 'constants/action-types'

export function simulate(data, startTime, endTime) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: simulateTask,
    args: [data, startTime, endTime],
  }
}
