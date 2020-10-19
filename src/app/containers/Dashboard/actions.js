import { preload as preloadTask } from './saga'
import TYPES from 'constants/action-types'


export function preload({ params, query }) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preloadTask(params, query),
  }
}
