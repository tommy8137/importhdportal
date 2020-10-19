import TYPES from 'constants/action-types'
import ST from './action-types'
import moment from 'moment'
import {
  apiSearchSchedule,
  searchPatient as apiSearchPatient,
  searchRecordList as apiSearchRecordList,
} from 'app/apis/search'

import { preload as preloadTask } from './saga'

export function preload() {
  const state = {
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    optional: {
      offset: 0,
      limit: 20,
      q: '',
    }
  }
  return {
    type: TYPES.SAGA_CUSTOM_TASK,
    task: preloadTask(state.startDate, state.endDate, state.optional),
  }
}

export const actionCreators = {
  fetchSearchSchedule,
  nextPageSearchSchedule,
}

export function fetchSearchSchedule(startDate, endDate, optional) {
  const {
    SEARCH_SCHEDULE_FETCHING,
    SEARCH_SCHEDULE_SUCCESS,
    SEARCH_SCHEDULE_FAILED,
  } = ST

  return {
    type: TYPES.SAGA_FETCH_ACTION,
    fetch: apiSearchSchedule(startDate, endDate, optional),
    status: [
      SEARCH_SCHEDULE_FETCHING,
      SEARCH_SCHEDULE_SUCCESS,
      SEARCH_SCHEDULE_FAILED,
    ],
  }
}

export function nextPageSearchSchedule(startDate, endDate, optional) {
  const {
    SEARCH_SCHEDULE_FETCHING,
    SEARCH_SCHEDULE_UPDATED,
    SEARCH_SCHEDULE_FAILED,
  } = ST

  return {
    type: TYPES.SAGA_FETCH_ACTION,
    fetch: apiSearchSchedule(startDate, endDate, optional),
    status: [
      SEARCH_SCHEDULE_FETCHING,
      SEARCH_SCHEDULE_UPDATED,
      SEARCH_SCHEDULE_FAILED,
    ],
  }
}
