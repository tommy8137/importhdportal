import { fromJS } from 'immutable'
import ET from './action-types'
import { createSelector } from 'reselect'
import moment from 'moment'

export const initState = fromJS({
  trId: null,
  date: null,
  isTrDateInvalid: true,
  isTiListInvalid: true,
  tiId: null,
  tiName: null,
  tiUnit: null,
  reportKeys: [],
  reportDetails: {},
  itemsListDetails: {},
  itemsListKeys: [],
})

export default function (state = initState, action) {
  switch (action.type) {
    case ET.SEARCHES_PATIENTS_TEST_RESULTS_SUCCESS: {
      const { result, entities } = action.result
      return state.merge({
        trId: result.tr_id,
        date: result.date,
        reportKeys: fromJS(result.results),
        reportDetails: fromJS(entities.results),
      })
    }
    case ET.SEARCHES_PATIENTS_ITEMS_LIST_SUCCESS: {
      const { result, entities } = action.result
      return state.merge({
        itemsListKeys: fromJS(result.results),
        itemsListDetails: fromJS(entities.item),
      })
    }
    case ET.SEARCHES_PATIENTS_TEST_RESULTS_INVALID: {
      return state.merge({
        isTrDateInvalid: action.isTrDateInvalid,
      })
    }
    case ET.SEARCHES_PATIENTS_ITEMS_LIST_UPDATE: {
      return state.merge({
        tiId: action.ti_id,
        tiName: action.tiName,
        tiUnit: action.tiUnit,
        isTiListInvalid: action.isTiListInvalid,
      })
    }
    default: {
      return state
    }
  }
}
