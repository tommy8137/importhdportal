import { fromJS } from 'immutable'
import AT from './action-types'

export const initState = fromJS({
  version: null,
  license_key: null,
  valid_date: null,
})

export default function(state = initState, action) {
  switch(action.type) {
    case AT.ADMIN_ABOUT_SUCCESS:
      return state.merge(action.result)
  }

  return state
}
