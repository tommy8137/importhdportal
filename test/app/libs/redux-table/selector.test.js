import { createStore } from 'redux'
import reduxTable from 'app/libs/redux-table/reducer'
import { TYPES } from 'app/libs/redux-table/action'
import { selector, getOrderData } from 'app/libs/redux-table/selector'
import { fromJS } from 'immutable'
import { DIRECTION } from 'app/libs/redux-table/constant.js'
/* -----------------------------------------------------------------------------
/*
/* ----------------------------------------------------------------------------- */
it('[selector | when create, selector get data from rawdata]: ',
  () => {
    const { store, plainData } = getContext()

    const config = {
      table: 'Table1',
      dataFrom: {
        initData: plainData,
      }
    }

    const tableName = config.table

    const action = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: config.table,
      dataFrom: config.dataFrom,
    }
    store.dispatch(action)
    const actualState = store.getState()

    const mainSelector = selector(tableName, config)
    const state = fromJS(mainSelector({ table: actualState }))

    const expected = fromJS({
      orderBy: actualState.get(tableName).get('orderBy'),
      filterRules: actualState.get(tableName).get('filterRules'),
      data: actualState.get(tableName).get('rawData'),
      tableName,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)
/* ----------------------------------------------------------------------------- */
it('[selector | when create, selector get nothing when tableName state not exist]: ',
  () => {
    const { store, plainData } = getContext()

    const config = {
      table: undefined,
      dataFrom: {
        initData: plainData,
      }
    }

    const tableName = config.table

    const action = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: config.table,
      dataFrom: config.dataFrom,
    }
    store.dispatch(action)
    const actualState = store.getState()


    const mainSelector = selector(tableName, config)
    const state = fromJS(mainSelector({ table: actualState }))

    const expected = fromJS({
      orderBy: [],
      filterRules: [],
      data: [],
      tableName: null,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)

/* ----------------------------------------------------------------------------- */
it('[selector | when rawData update, selector data should be updated]: ',
  () => {
    const { store, plainData, ascData } = getContext()

    const config = {
      table: 'Table1',
      dataFrom: {
        initData: plainData,
      }
    }

    const tableName = config.table

    const createAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: config.table,
      dataFrom: config.dataFrom,
    }
    store.dispatch(createAction)

    const updateAction = {
      type: TYPES.RT_UPDATE,
      tableName: config.table,
      data: ascData,
    }
    store.dispatch(updateAction)

    const actualState = store.getState()
    const mainSelector = selector(tableName, config)
    const state = fromJS(mainSelector({ table: actualState }))

    const expected = fromJS({
      orderBy: actualState.get(tableName).get('orderBy'),
      filterRules: actualState.get(tableName).get('filterRules'),
      data: ascData,
      tableName,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)
/* ----------------------------------------------------------------------------- */
it('[selector | orderBy action change selector data]: ',
  () => {
    const { store, plainData, ascData } = getContext()

    const config = {
      table: 'Table1',
      dataFrom: {
        initData: plainData,
      }
    }

    const tableName = config.table

    const createAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: config.table,
      dataFrom: config.dataFrom,
    }
    store.dispatch(createAction)

    const orderByAscAction = {
      type: TYPES.RT_ORDER_BY,
      tableName: config.table,
      orderBy: {
        direction: DIRECTION.ASC,
        column: 'age',
      },
    }
    store.dispatch(orderByAscAction)

    const actualState = store.getState()
    const mainSelector = selector(tableName, config)
    const state = fromJS(mainSelector({ table: actualState }))

    const expected = fromJS({
      orderBy: actualState.get(tableName).get('orderBy'),
      filterRules: actualState.get(tableName).get('filterRules'),
      data: ascData,
      tableName,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)
/* ----------------------------------------------------------------------------- */
it('[selector | filter action change selector data]: ',
  () => {
    const { store, plainData, filterNameData } = getContext()

    const config = {
      table: 'Table1',
      dataFrom: {
        initData: plainData,
      }
    }

    const tableName = config.table

    const createAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: config.table,
      dataFrom: config.dataFrom,
    }
    store.dispatch(createAction)

    const filterAction = {
      type: TYPES.RT_FILTER_VALUE,
      tableName: config.table,
      filterRules: {
        column: ['name'],
        string: '大同'
      },
    }
    store.dispatch(filterAction)

    const actualState = store.getState()
    const mainSelector = selector(tableName, config)
    const state = fromJS(mainSelector({ table: actualState }))

    const expected = fromJS({
      orderBy: actualState.get(tableName).get('orderBy'),
      filterRules: actualState.get(tableName).get('filterRules'),
      data: filterNameData,
      tableName,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)


const getContext = () => {
  const context = {}
  context.store = createStore(reduxTable)

  context.plainData = [
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 47, riskType: 'SBP' },
    { name: '李美美', bedNum: 'B13', gender: 'M', age: 64, riskType: 'SBP' },
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 53, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 57, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 55, riskType: 'SBP' },
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 65, riskType: 'SBP' },
  ]

  context.transformPlainData = [
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 247, riskType: 'SBP' },
    { name: '李美美', bedNum: 'B13', gender: 'M', age: 264, riskType: 'SBP' },
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 253, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 257, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 255, riskType: 'SBP' },
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 265, riskType: 'SBP' },
  ]

  context.ascData = [
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 47, riskType: 'SBP' },
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 53, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 55, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 57, riskType: 'SBP' },
    { name: '李美美', bedNum: 'B13', gender: 'M', age: 64, riskType: 'SBP' },
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 65, riskType: 'SBP' },
  ]
  context.descData = [
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 65, riskType: 'SBP' },
    { name: '李美美', bedNum: 'B13', gender: 'M', age: 64, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 57, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 55, riskType: 'SBP' },
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 53, riskType: 'SBP' },
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 47, riskType: 'SBP' },
  ]

  context.filterNameData = [
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 47, riskType: 'SBP' },
  ]

  context.filterAll5Data = [
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 53, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 57, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 55, riskType: 'SBP' },
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 65, riskType: 'SBP' },
  ]

  context.allColumns = [...fromJS(context.plainData).get(0).keys()]
  return context
}

it('[reducer | getOrderData]: ',
  () => {
    const { plainData, descData, ascData } = getContext()
    // no data -> []
    // data not List -> []
    let data = getOrderData(undefined)
    expect(data.toJS()).toEqual([])

    // data exist, but empty, wihout any keys -> []
    // data exist, no column -> []
    data = getOrderData(fromJS([]))
    expect(data.toJS()).toEqual([])

    // data exist, column is not string -> original List
    data = getOrderData(fromJS(plainData), {})
    expect(data.toJS()).toEqual(plainData)

    // data exist, column is string but not found -> original List
    data = getOrderData(data, 'nOThIsCOLuMn')
    expect(data.toJS()).toEqual(plainData)

    // data exist, column is string and could found, no dir -> desc List
    data = getOrderData(data, 'age')
    expect(data.toJS()).toEqual(descData)

    // data exist, column is string and could found, dir asc
    data = getOrderData(data, 'age', DIRECTION.ASC)
    expect(data.toJS()).toEqual(ascData)

    // data exist, column is string and could found, dir desc
    data = getOrderData(data, 'age', DIRECTION.DESC)
    expect(data.toJS()).toEqual(descData)
  }
)
