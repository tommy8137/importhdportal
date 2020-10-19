import { reducer, initState } from 'app/containers/Examination'
import ET from 'app/containers/Examination/action-types'
import { fromJS } from 'immutable'

it('exam reducer - initState', () => {
  const state = reducer(undefined, {})
  expect(state.toJS()).toEqual(initState.toJS())
})

it('exam reducer - SEARCHES_PATIENTS_TEST_RESULTS_SUCCESS', () => {
  const action = {
    type: ET.SEARCHES_PATIENTS_TEST_RESULTS_SUCCESS,
    result: {
      entities: {
        results: {
          'bun-pre': {},
          ca: {},
        }
      },
      result: {
        tr_id: 'tr_id1',
        date: '2015-02-12',
        results: ['bun-pre', 'ca']
      }
    }
  }

  const state = reducer(undefined, action)
  const resultObj = initState
    .set('trId', action.result.result.tr_id)
    .set('date', action.result.result.date)
    .set('reportKeys', fromJS(action.result.result.results))
    .set('reportDetails', fromJS(action.result.entities.results))
  expect(state.toJS()).toEqual(resultObj.toJS())
})

it('exam reducer - SEARCHES_PATIENTS_ITEMS_LIST_SUCCESS', () => {
  const action = {
    type: ET.SEARCHES_PATIENTS_ITEMS_LIST_SUCCESS,
    result: {
      entities: {
        item: {
          tr_id1: [],
          tr_id2: [],
          tr_id3: [],
          tr_id4: [],
          tr_id5: [],
          tr_id6: [],
          tr_id7: [],
          tr_id8: [],
          tr_id9: [],
          tr_id10: [],
          tr_id11: [],
          tr_id12: [],
        }
      },
      result: {
        results: [
          'tr_id1',
          'tr_id2',
          'tr_id3',
          'tr_id4',
          'tr_id5',
          'tr_id6',
          'tr_id7',
          'tr_id8',
          'tr_id9',
          'tr_id10',
          'tr_id11',
          'tr_id12',
        ]
      }
    }
  }

  const state = reducer(undefined, action)
  const resultObj = initState
    .set('itemsListKeys', action.result.result.results)
    .set('itemsListDetails', action.result.entities.item)
  expect(state.toJS()).toEqual(resultObj.toJS())
})

it('exam reducer - SEARCHES_PATIENTS_TEST_RESULTS_INVALID', () => {
  const action = {
    type: ET.SEARCHES_PATIENTS_TEST_RESULTS_INVALID,
    isTrDateInvalid: false,
  }

  const state = reducer(undefined, action)
  const resultObj = initState
    .set('isTrDateInvalid', false)
  expect(state.toJS()).toEqual(resultObj.toJS())
})

it('exam reducer - SEARCHES_PATIENTS_ITEMS_LIST_UPDATE', () => {
  const action = {
    type: ET.SEARCHES_PATIENTS_ITEMS_LIST_UPDATE,
    ti_id: 'bun-pre',
    tiName: 'BUN前',
    tiUnit: 'mg/dl',
    isTiListInvalid: false
  }

  const state = reducer(undefined, action)
  const resultObj = initState
    .set('tiId', 'bun-pre')
    .set('tiName', 'BUN前')
    .set('tiUnit', 'mg/dl')
    .set('isTiListInvalid', false)
  expect(state.toJS()).toEqual(resultObj.toJS())
})
