import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'

export const selector = createSelector(
  localeSelector,
  state => state.effective.get('years'),
  (l, years) => ({
    l,
    years,
  })
)
