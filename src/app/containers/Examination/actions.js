import TYPES from 'constants/action-types'

import { preload as preloadTask } from './saga'

export function preload({ params, query }) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preloadTask(params, query),
  }
}
