import { preload, fetchReport } from './saga'
import TYPES from 'constants/action-types'

export function preloader() {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preload,
    args: [],
  }
}

export function exportReport(year, lang) {
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: fetchReport,
    args: [year, lang],
  }
}
