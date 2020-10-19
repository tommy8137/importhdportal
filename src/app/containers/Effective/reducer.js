import { fromJS } from 'immutable'
import AT from './action-types'

export const initState = fromJS({
  years: [],
})

export default function(state = initState, action) {
  switch(action.type) {
    case AT.EFFECTIVE_GET_LISTS_SUCCESS:
      return state.merge({ years: action.result.year })
    default: {
      return state
    }
  }
}
