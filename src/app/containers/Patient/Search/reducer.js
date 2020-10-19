import ST from './action-types'
import { fromJS } from 'immutable'
import Immutable from 'immutable'

const { SEARCH_SCHEDULE_SUCCESS, SEARCH_SCHEDULE_UPDATED } = ST

export const initState = fromJS({
  totalNums: 0,
  schedulePatients: [],
})

export default function (state = initState, action) {
  switch (action.type) {
    case SEARCH_SCHEDULE_SUCCESS: {
      const searchResult = convertPatientsToImmutable(action.result)
      return state
        .set('totalNums', searchResult.get('totalNums'))
        .set('schedulePatients', searchResult.get('schedulePatients'))
    }
    case SEARCH_SCHEDULE_UPDATED: {
      const searchResult = convertPatientsToImmutable(action.result)
      const previousNums = state.get('totalNums')
      const newPatientsList =
        state.get('schedulePatients').push(...searchResult.get('schedulePatients'))
      return state
        .set('totalNums', previousNums + searchResult.get('totalNums'))
        .set('schedulePatients', newPatientsList)
    }
    // case TYPES.LOGOUT_SUCCESS: {
    //   return initState
    // }
    default: {
      return state
    }
  }
}

const convertPatientsToImmutable = (originObj) => {
  const { total_nums, schedule_patients } = originObj
  const tmpObj = {
    totalNums: total_nums,
    schedulePatients: Immutable.List(schedule_patients),
  }
  return Immutable.Map(tmpObj)
}
