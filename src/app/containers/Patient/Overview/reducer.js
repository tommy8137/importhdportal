import TYPES from 'constants/action-types'
import OT from './action-types'
import { Map, List, fromJS } from 'immutable'
import { LOCATION_CHANGE } from 'react-router-redux'

const {
  OVERVIEW_OVERVIEW_CHANGE_SHIFT,
  OVERVIEW_OVERVIEW_CHANGE_CATEGORY,
  OVERVIEW_OVERVIEW_CHANGE_AREA,
  OVERVIEW_OVERVIEW_CHANGE_BPCLASS,
  OVERVIEW_OVERVIEW_SUCCESS,
  OVERVIEW_ABNORMAL_LIST_SUCCESS,
  OVERVIEW_SHIFTS_SUCCESS,
} = OT

export const initState = fromJS({
  statistics: {
    abnormal: 0,
    pieChart: [],
    notAttend: 0,
    attended: 0,
    normal: 0,
    total: 0,
  },
  shift: null,
  category: null,
  abnormalList: [],
  shifts: [],
  categories: [],
  bp_class: 'all',
  area: [],
  areaSelected: null,
})

export default function (state = initState, action) {
  switch (action.type) {
    case OVERVIEW_SHIFTS_SUCCESS:
      return state.set('shifts', convertShiftsToImmutable(action.result)).set('area', action.result.hemarea)
    case OVERVIEW_OVERVIEW_CHANGE_SHIFT:
      return state.set('shift', action.shift).set('areaSelected', action.areaSelected)
    case OVERVIEW_OVERVIEW_CHANGE_CATEGORY:
      return state.set('category', action.category)
    case OVERVIEW_OVERVIEW_CHANGE_AREA:
      return state.set('areaSelected', action.areaSelected)
    case OVERVIEW_OVERVIEW_CHANGE_BPCLASS:
      return state.set('bp_class', action.bp_class)
    case OVERVIEW_OVERVIEW_SUCCESS:
      const statistics = convertOverviewToImmutable(action.result)
      return state.set('statistics', statistics)
    case OVERVIEW_ABNORMAL_LIST_SUCCESS:
      const immutableAbnormalList =
        convertAbnormalListToImmutable(action.result)
      return state.set('abnormalList', immutableAbnormalList)
    // case LOCATION_CHANGE:
    case TYPES.LOGOUT_SUCCESS:
      return initState
    default:
      return state
  }
}

const convertShiftsToImmutable = (originObj) => {
  const { shifts } = originObj
  return List(shifts.map((shift) => (Map(shift))))
}

const convertOverviewToImmutable = (originObj) => {
  const { total, attended, not_attend, normal, abnormal, pie_chart } = originObj
  return Map({
    total,
    attended,
    notAttend: not_attend,
    normal,
    abnormal,
    pieChart: List(pie_chart.map((d) => (Map(d)))),
  })
}

const convertAbnormalListToImmutable = (originObj) => {
  let immutableAbnormalList_newKeyName = []

  if (originObj && originObj.abnormal_list && Array.isArray(originObj.abnormal_list)) {
    immutableAbnormalList_newKeyName =
      originObj.abnormal_list.map((value) => Map({
        name: value.name,
        gender: value.gender,
        patientId: value.patient_id,
        bedNo: value.bed_no,
        age: value.age,
        recordId: value.r_id,
        category: List(value.risk_category.map((d) => (Map(d)))),
        alarmStatus: value.alarm_status,
      }))
  }

  return List(immutableAbnormalList_newKeyName)
}
