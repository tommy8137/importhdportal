import { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import { createSelector } from 'reselect'

const initState = fromJS({
  name: 'not available',
  locale: {},
})

export default function(state = initState, action) {
  switch (action.type) {
    case TYPES.LOCALE_SWITCH:
      return fromJS({ name: action.language, locale: action.locale})
    default:
      return state
  }
}

export const localeSelector = createSelector(
  (state) => state.locale.get('locale'),
  (locale) => (word) => {
    let ret = locale.get(word)
    return ret? ret: word
  }
)
