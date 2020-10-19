import { createStore } from 'redux'
import reduxTable, { initTableState } from 'app/libs/redux-table/reducer'
import { DIRECTION } from 'app/libs/redux-table/constant'
import { TYPES } from 'app/libs/redux-table/action'
import { getCurrentDirection, resolveData } from 'app/libs/redux-table/reducer'
import { fromJS } from 'immutable'

//-----------------------------------------------------------------------------
// reducer help functions
//-----------------------------------------------------------------------------
// same col, did'd provide dir, asc
// same col, provde dir, -> invert the dir
// diff col, asc
// all did'd provide, asc
it('[reducer | getCurrentDirection]: ',
  () => {
    let prevCol = 'age'
    let currCol = 'age'
    let prevDir = undefined
    let currDir = getCurrentDirection(prevCol, currCol, prevDir)
    expect(currDir).toBe(DIRECTION.ASC)

    prevDir = DIRECTION.ASC
    currDir = getCurrentDirection(prevCol, currCol, prevDir)
    expect(currDir).toBe(DIRECTION.DESC)

    prevDir = DIRECTION.DESC
    currDir = getCurrentDirection(prevCol, currCol, prevDir)
    expect(currDir).toBe(DIRECTION.ASC)

    prevCol = 'age'
    currCol = 'different'
    prevDir = DIRECTION.ASC
    currDir = getCurrentDirection(prevCol, currCol, prevDir)
    expect(currDir).toBe(DIRECTION.ASC)

    prevCol = undefined
    currCol = undefined
    prevDir = undefined
    currDir = getCurrentDirection(prevCol, currCol, prevDir)
    expect(currDir).toBe(DIRECTION.ASC)
  }
)

it('[reducer | resolveData]: ',
  () => {
    const { plainData, titles, transformData } = getContext()

    let expected = fromJS({
      rawData: [],
      titles: [],
    })

    // 3 arguments all empty -> all []
    let rawData = undefined
    let transformFunc = undefined

    let state = resolveData(rawData, transformFunc)
    expect(state.toJS()).toEqual(expected.toJS())

    // rawData exist but without any keys
    state = resolveData(rawData, transformFunc)
    expect(state.toJS()).toEqual(expected.toJS())

    // only rawData exist, auto select all columns
    rawData = plainData
    transformFunc = undefined
    state = resolveData(rawData, transformFunc)

    expected = fromJS({
      rawData: plainData,
      titles,
    })

    expect(state.toJS()).toEqual(expected.toJS())


    transformFunc = (rawData) => (rawData.map((row) => (
      row.mergeDeep({
        age: row.get('age') + 100
      })
    )))
    state = resolveData(rawData, transformFunc)

    expected = fromJS({
      rawData: transformData,
      titles,
    })

    expect(state.toJS()).toEqual(expected.toJS())
  }
)
//-----------------------------------------------------------------------------
// reducer testing
//-----------------------------------------------------------------------------
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

  context.transformData = [
    { name: '方大同', bedNum: 'B12', gender: 'M', age: 147, riskType: 'SBP' },
    { name: '李美美', bedNum: 'B13', gender: 'M', age: 164, riskType: 'SBP' },
    { name: '鍾漢良', bedNum: 'B14', gender: 'M', age: 153, riskType: 'SBP' },
    { name: '陳麗珠', bedNum: 'B15', gender: 'F', age: 157, riskType: 'SBP' },
    { name: '王百合', bedNum: 'B16', gender: 'F', age: 155, riskType: 'SBP' },
    { name: '林昭地', bedNum: 'B17', gender: 'F', age: 165, riskType: 'SBP' },
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

  context.titles = [...fromJS(context.plainData).get(0).keys()]

  return context
}

it('[reducer/RT_CREATE_TABLE]: tableName = undefined, will not create table',
  () => {
    const { store } = getContext()

    const action = {
      type: TYPES.RT_CREATE_TABLE,
    }
    store.dispatch(action)
    const actualState = store.getState()
    const expected = fromJS({})
    expect(actualState.toJS()).toEqual(expected.toJS())
  }
)

it('[reducer/RT_CREATE_TABLE]: tableName exist, create table',
  () => {
    const store = createStore(reduxTable)

    const action = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
    }
    store.dispatch(action)
    const actualState = store.getState()
    const expected = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
      })
    })

    expect(actualState.toJS()).toEqual(expected.toJS())
  }
)

it('[reducer/RT_CREATE_TABLE]: input initData',
  () => {
    const { store, titles, plainData } = getContext()

    // dataFrom: initData = plainData
    // will update rawData and data by immutable.from() input data
    const action = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
      }
    }
    store.dispatch(action)
    const actualState = store.getState()
    const expected = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: plainData,
        titles,
      })
    })

    expect(actualState.toJS()).toEqual(expected.toJS())
  }
)

it('[reducer/RT_CREATE_TABLE]: initData and transformFunc',
  () => {
    const { store, titles, plainData, transformPlainData } = getContext()

    // dataFrom: initData = plainData
    // columns: ['age']
    // transformFunc = age+200
    // will update columns selected to ['name', 'age'],
    // will update rawData by immutable.from() input data
    // data will be immutable.from( selected rawdata ) and the age will be + 200

    const transformFunc = (rawData) => (rawData.map((row) => (
      row.mergeDeep({
        age: row.get('age') + 200
      })
    )))
    const action = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
        transformFunc,
      },
    }
    store.dispatch(action)
    const actualState = store.getState()
    const expected = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: transformPlainData,
        transformFunc,
        titles,
      })
    })
    expect(actualState.toJS()).toEqual(expected.toJS())
  }
)

it('[reducer/RT_CREATE_TABLE]: async fetch action, fromKey = undefined',
  () => {
    const { store, titles, plainData } = getContext()

    // async, "type" exist, but without "from"
    // and dispatch async action
    // then get data from default key "result"
    const actionRegisterAsyncAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        type: 'WHATEVER_TYPE_YOU_LIKE',
      }
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualAsyncRegisterResultState = store.getState()
    const expectedAsyncRegisterResultState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: [],
        tableAsyncAction: ['WHATEVER_TYPE_YOU_LIKE'],  // it's an array, not just a string
      }),
    })

    expect(actualAsyncRegisterResultState.toJS()).toEqual(expectedAsyncRegisterResultState.toJS())

    const actionTrigAsyncFetch = {
      type: 'WHATEVER_TYPE_YOU_LIKE',
      result: plainData
    }
    const expectedTrigAsyncFetchState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: plainData,
        titles,
        tableAsyncAction: ['WHATEVER_TYPE_YOU_LIKE'],  // it's an array, not just a string
      }),
    })

    store.dispatch(actionTrigAsyncFetch)
    const actualTrigAsyncFetchState = store.getState()

    expect(actualTrigAsyncFetchState.toJS()).toEqual(expectedTrigAsyncFetchState.toJS())
  }
)

it('[reducer/RT_CREATE_TABLE]: async fetch action, state key in whatever ',
  () => {
    const { store, plainData, titles } = getContext()

    // async, "type" exist,  with "from: whateverKey"
    // and dispatch async action
    // then get data from default key "whateverKey"
    const actionRegisterAsyncAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        type: 'WHATEVER_TYPE_YOU_LIKE',
        from: 'whateverKey'
      }
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualAsyncRegisterResultState = store.getState()
    const expectedAsyncRegisterResultState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: [],
        titles: [],
        dataKey: 'whateverKey',
        tableAsyncAction: ['WHATEVER_TYPE_YOU_LIKE'],  // it's an array, not just a string
      }),
    })

    expect(actualAsyncRegisterResultState.toJS()).toEqual(expectedAsyncRegisterResultState.toJS())

    const actionTrigAsyncFetch = {
      type: 'WHATEVER_TYPE_YOU_LIKE',
      whateverKey: plainData
    }
    const expectedTrigAsyncFetchState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: plainData,
        titles,
        dataKey: 'whateverKey',
        tableAsyncAction: ['WHATEVER_TYPE_YOU_LIKE'],  // it's an array, not just a string
      }),
    })

    store.dispatch(actionTrigAsyncFetch)
    const actualTrigAsyncFetchState = store.getState()

    expect(actualTrigAsyncFetchState.toJS()).toEqual(expectedTrigAsyncFetchState.toJS())
  }
)


it('[reducer/RT_UPDATE]: 1',
  () => {
    const { store, titles, plainData, ascData } = getContext()

    const createDataAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: ascData,
      },
    }
    store.dispatch(createDataAction)

    const updateDataAction = {
      type: TYPES.RT_UPDATE,
      tableName: 'Table1',
      data: plainData,
    }
    store.dispatch(updateDataAction)

    const actualSelectedState = store.getState()
    const expectedSelectedState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        rawData: plainData,
        titles,
      }),
    })
    expect(actualSelectedState.get('Table1').toJS()).toEqual(expectedSelectedState.get('Table1').toJS())
  }
)

it('[reducer/RT_ORDER_BY]: orderBy age column',
  () => {
    const { store, titles, plainData } = getContext()

    const dataAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
      },
    }
    store.dispatch(dataAction)

    const actionRegisterAsyncAction = {
      type: TYPES.RT_ORDER_BY,
      tableName: 'Table1',
      orderBy: {
        column: 'age',
      },
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualSelectedState = store.getState()
    const expectedSelectedState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        orderBy: {
          direction: DIRECTION.ASC,
          column: 'age',
        },
        rawData: plainData,
        titles,
      }),
    })

    expect(actualSelectedState.toJS()).toEqual(expectedSelectedState.toJS())
  }
)

it('[reducer/RT_ORDER_BY]: orderBy age and desc',
  () => {
    const { store, titles, plainData } = getContext()

    const dataAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
      },
    }
    store.dispatch(dataAction)

    const actionRegisterAsyncAction = {
      type: TYPES.RT_ORDER_BY,
      tableName: 'Table1',
      orderBy: {
        column: ['age'],
        direction: DIRECTION.DESC,
      },
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualSelectedState = store.getState()
    const expectedSelectedState = fromJS({
      Table1: initTableState.mergeDeep({
        tableName: 'Table1',
        orderBy: {
          direction: DIRECTION.DESC,
          column: ['age'],
        },
        rawData: plainData,
        titles,
      }),
    })
    expect(actualSelectedState.toJS()).toEqual(expectedSelectedState.toJS())
  }
)

it('[reducer/RT_FILTER_VALUE]: filter string in specificed column',
  () => {
    const { store, titles, plainData } = getContext()

    const dataAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
      },
    }
    store.dispatch(dataAction)

    const actionRegisterAsyncAction = {
      type: TYPES.RT_FILTER_VALUE,
      tableName: 'Table1',
      filterRules: {
        column: ['name'],
        string: '大同',
      },
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualSelectedState = store.getState()

    const updater = (initTable) => {
      return initTable.mergeDeep({
        tableName: 'Table1',
        filterRules: {
          column: ['name'],
          string: '大同',
        },
        rawData: plainData,
        titles,
      })
    }

    const expectedSelectedState = fromJS({
      Table1: initTableState.update(updater)
    })

    expect(actualSelectedState.get('Table1').toJS()).toEqual(expectedSelectedState.get('Table1').toJS())
  }
)

it('[reducer/RT_FILTER_VALUE]: filter string in all column',
  () => {
    const { store, titles, plainData } = getContext()

    const dataAction = {
      type: TYPES.RT_CREATE_TABLE,
      tableName: 'Table1',
      dataFrom: {
        initData: plainData,
      },
    }
    store.dispatch(dataAction)

    const actionRegisterAsyncAction = {
      type: TYPES.RT_FILTER_VALUE,
      tableName: 'Table1',
      filterRules: {
        string: '5',
      },
    }
    store.dispatch(actionRegisterAsyncAction)
    const actualSelectedState = store.getState()

    const updater = (initTable) => {
      return initTable.mergeDeep({
        tableName: 'Table1',
        filterRules: {
          string: '5',
        },
        rawData: plainData,
        titles,
      })
    }

    const expectedSelectedState = fromJS({
      Table1: initTableState.update(updater)
    })

    expect(actualSelectedState.get('Table1').toJS()).toEqual(expectedSelectedState.get('Table1').toJS())
  }
)

// console.log('██████ PASS 71 ███████')
// t.is(實際, 預期, 錯誤訊息)
// t.deepEqual(實際, 預期, 錯誤訊息)
