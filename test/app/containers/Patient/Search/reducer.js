import { reducer, initState } from 'app/containers/Patient/Search'
import ST from 'app/containers/Patient/Search/action-types'
import { fromJS, List } from 'immutable'
import moment from 'moment'

it('search reducer - initState', () => {
  const state = reducer(undefined, {})
  expect(state.toJS()).toEqual(initState.toJS())
})

it('search reducer - search today all', () => {
  const action = {
    type: ST.SEARCH_SCHEDULE_SUCCESS,
    result: {
      total_nums: 2,
      schedule_patients: [{}, {}]
    }
  }

  const state = reducer(undefined, action)
  const resultObj = initState
    .set('schedulePatients', List([{}, {}]))
    .set('totalNums', 2)

  expect(state.toJS()).toEqual(resultObj.toJS())
})
