import { createSelector } from 'reselect'

//-----------------------------------------------------------------------------
// selector for sagas shifts
//-----------------------------------------------------------------------------
export const shiftsSelector = createSelector(
  (state) => state.overview.overview.get('shifts'),
  (shifts) => ({ shifts })
)
