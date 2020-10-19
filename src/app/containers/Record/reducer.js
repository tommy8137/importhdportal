import { fromJS } from 'immutable'
import RT from './action-types'
import { LOCATION_CHANGE } from 'react-router-redux'
import TYPES from 'constants/action-types'

export const initState = fromJS({
  toggled: {

  },
  selectedTime: null,
  entities: {

  },
  result: {

  }, //record id
})


export default function (state = initState, action) {
  switch (action.type) {
    case RT.FETCH_RECORD_DETAIL_SUCCESS: {
      const { result, entities } = action.result
      return state.mergeDeep({
        entities: entities,
        result: result,
        toggled: Object.keys(entities.items)
          .filter(id => entities.items[id].type == 'chart')
          .reduce((result, id) => {
            result[id] = true
            return result
          } , {}),
      })
    }
    case RT.RECORD_TOGGLE_PARAM:
      const { param, forceToBe } = action
      const toggled = typeof forceToBe == 'boolean'
      ? forceToBe
      // : !state.get('entities').get('items').get(param).get('toggled')
      : !state.get('toggled').get(param)

      if (param !== 'all') {
        // return state.setIn(['entities', 'items', param, 'toggled'], toggled)
        return state.setIn(['toggled', param], toggled)
      }

      // param === 'all'
      return state.update('toggled', params => params.map(t => toggled))
    case RT.RECORD_SELECT_TIME:
      return state.set('selectedTime', action.time)
    case RT.REFRESH_RECORD_DETAIL_SUCCESS: {
      const { result, entities } = action.result
      return state.mergeDeep({
        entities: entities,
        result: result,
      })
    }
    case TYPES.PATIENT_SELECT_RECORD:
      return initState
    // case LOCATION_CHANGE:
    //   return initState
  }
  return state
}
