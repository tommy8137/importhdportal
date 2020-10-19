import { reducer, initState } from 'app/containers/Patient/Overview'
import OT from 'app/containers/Patient/Overview/action-types'
import { fromJS, List, Map } from 'immutable'

it('overview reducer - default action', () => {
  const state = reducer(undefined, {})
  expect(state.toJS()).toEqual(initState.toJS())
})

it('overview reducer - fetch shifts success', () => {
  const shifts = [{ s_name: 's-name-1', s_id: 1 }, { s_name: 's-name-2', s_id: 2 }]
  const action = (shifts) => ({ type: OT.OVERVIEW_SHIFTS_SUCCESS, result: { shifts } })
  const state = reducer(undefined, action(shifts))
  expect(state.get('shifts').toJS()).toEqual(shifts)
})


it('overview reducer - shift change action', () => {
  const action = (shift) => ({ type: OT.OVERVIEW_OVERVIEW_CHANGE_SHIFT, shift })
  const shift = ['all', 'morning', 'mid', 'evening']

  shift.forEach((shift) => {
    const state = reducer(undefined, action(shift))
    expect(state.get('shift')).toEqual(initState.set('shift', shift).get('shift'))
  })
})

it('overview reducer - (category change) get abnormal list action', () => {
  const action = (category) => ({ type: OT.OVERVIEW_OVERVIEW_CHANGE_CATEGORY, category })
  let state = {}

  const shift = ['all', 'morning', 'mid', 'evening']
  const categories = ['all', '低血壓', '併發症', '廔管壽命', '死亡率']

  shift.forEach(() => {
    categories.forEach((category, idx) => {
      state = reducer(undefined, action(category))

      expect(state.get('category')).toEqual(categories[idx])
    })
  })
})

it('overview reducer - fetch overview success action', () => {
  const apiResult = {
    abnormal: 1,
    pie_chart: [{}],
    not_attend: 1,
    attended: 3,
    normal: 2,
    total: 4,
  }

  const expected = Map({
    total: 4,
    attended: 3,
    notAttend: 1,
    normal: 2,
    abnormal: 1,
    pieChart: List([{}]),
  })

  const actionCreator = () => (
    {
      type: OT.OVERVIEW_OVERVIEW_SUCCESS,
      result: apiResult,
    }
  )

  const state = reducer(undefined, actionCreator())
  expect(state.get('statistics').toJS()).toEqual(initState.set('statistics', expected).get('statistics').toJS())
})

it('overview reducer - fetch abnormal list success action', () => {
  const apiResult = {
    abnormal_list: [
      {
        name: 'Web',
        gender: 'F',
        patient_id: 'AKK0099',
        bed_no: 'A-1',
        age: 90,
        r_id: '910375',
        risk_category: [
          {
            c_id: '<c_id>',
            c_name: '<c_name>',
            m_id: '<m_id>',
            m_name: '<m_name>'
          },
        ]
      },
      {
        name: 'Web2',
        gender: 'F',
        patient_id: 'AKK0019',
        bed_no: 'A-1',
        age: 90,
        r_id: '60079',
        risk_category: [
          {
            c_id: '<c_id>',
            c_name: '<c_name>',
            m_id: '<m_id>',
            m_name: '<m_name>'
          },
        ]
      },
      {
        name: 'Web3',
        gender: 'M',
        patient_id: 'AKK0049',
        bed_no: 'A-1',
        age: 90,
        r_id: 'aa1200498',
        risk_category: [
          {
            c_id: '<c_id>',
            c_name: '<c_name>',
            m_id: '<m_id>',
            m_name: '<m_name>'
          },
        ]
      },
    ]
  }
  const actionCreator = () => (
    {
      type: OT.OVERVIEW_ABNORMAL_LIST_SUCCESS,
      result: apiResult,
    }
  )

  const expected = List([
    {
      name: 'Web',
      gender: 'F',
      patientId: 'AKK0099',
      bedNo: 'A-1',
      age: 90,
      recordId: '910375',
      category: [
        {
          c_id: '<c_id>',
          c_name: '<c_name>',
          m_id: '<m_id>',
          m_name: '<m_name>'
        },
      ],
    },
    {
      name: 'Web2',
      gender: 'F',
      patientId: 'AKK0019',
      bedNo: 'A-1',
      age: 90,
      recordId: '60079',
      category: [
        {
          c_id: '<c_id>',
          c_name: '<c_name>',
          m_id: '<m_id>',
          m_name: '<m_name>'
        },
      ],
    },
    {
      name: 'Web3',
      gender: 'M',
      patientId: 'AKK0049',
      bedNo: 'A-1',
      age: 90,
      recordId: 'aa1200498',
      category: [
        {
          c_id: '<c_id>',
          c_name: '<c_name>',
          m_id: '<m_id>',
          m_name: '<m_name>'
        },
      ],
    },
  ])
  const state = reducer(undefined, actionCreator())

  expect(state.get('abnormalList').toJS()).toEqual(expected.toJS())
})
