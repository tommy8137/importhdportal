import { TYPES } from './action'
import { DIRECTION } from './constant.js'
import { Map, List, fromJS } from 'immutable'

// template for each tableName
export const initTableState = fromJS({
  tableName: null,
  orderBy: {
    direction: DIRECTION.ASC,
    column: null,
  },
  filterRules: {
    column: [],
    string: ''
  },
  rawData: [],
  tableAsyncAction: [],
  dataKey: 'result',
  titles: [],
  transformFunc: (data) => (data), // need it to pass test when dispatch empty action
})

// state will be: state.table1, state.table2, .....
// each means the data structure of the specific table ONLY!
export default (state = fromJS({}), action) => {
  switch (action.type) {
    //-------------------------------------------------------------------------
    // 1. load action
    // 2. init state
    // 3. update state.select, if action provide it
    // 4. update state.rawData, if action provide initData
    // 5. update state.tableAsyncAction if action provide "type"
    // 6. update state.dataKey if action provide "type"
    // 7. update state.tranformFunc, if action provide it
    // 8. returen previous and updated state
    //-------------------------------------------------------------------------
    case TYPES.RT_CREATE_TABLE: {
      const { tableName, dataFrom } = action
      if (!tableName) {
        return state
      }
      let tableState = initTableState

      if (dataFrom && dataFrom.initData) {
        const initData = (dataFrom.initData) || fromJS([])
        tableState = tableState.set('rawData', initData)
      }

      if (dataFrom && dataFrom.type) {
        // enforce to be an array
        tableState =
          tableState.set(
            'tableAsyncAction',
            Array.isArray(dataFrom.type)
              ? dataFrom.type
              : fromJS([dataFrom.type])
          )
        dataFrom && dataFrom.from && (
          tableState = tableState.set('dataKey', dataFrom.from)
        )
      }
      if (dataFrom && typeof dataFrom.transformFunc === 'function') {
        tableState =
          tableState.set('transformFunc', dataFrom.transformFunc)
      }
      const rd = resolveData(
        tableState.get('rawData'),
        tableState.get('transformFunc'),
      )

      const isTableStateExist = !!state.findKey((v, k) => (k === tableName))
      if (!isTableStateExist) {
        return state.mergeDeep({
          [tableName]: tableState.mergeDeep({
            rawData: rd.get('rawData'),
            titles: rd.get('titles'),
            tableName,
          })
        })
      }
      return state
    }

    /**-------------------------------------------------------------------------
     * Change data order (sort)
     * after sorted, sorted data will assign to state[tableName].rawData
     * if there're a select columns array, state[tableName].data will be assigned
     * the data after selected and sorted
     -------------------------------------------------------------------------**/
    case TYPES.RT_ORDER_BY: {
      const { tableName, orderBy } = action
      const tableState = state.get(tableName)

      // nothing will be changed when action not specific orderBy column
      if (!orderBy || !orderBy.column) {
        return state
      }

      const CURRENT_ORDERBY_COLUMN = orderBy.column
      const PREVIOUS_ORDERBY_COLUMN = tableState.getIn(['orderBy', 'column'])
      const PREVIOUS_ORDERBY_DIRECTION = tableState.getIn(['orderBy', 'direction'])
      const CURRENT_ORDERBY_DIRECTION = orderBy.direction ||
        getCurrentDirection(PREVIOUS_ORDERBY_COLUMN, CURRENT_ORDERBY_COLUMN,
          PREVIOUS_ORDERBY_DIRECTION)

      // update the order config to state
      let update = tableState.setIn(['orderBy', 'column'], CURRENT_ORDERBY_COLUMN)
      update = update.setIn(['orderBy', 'direction'], CURRENT_ORDERBY_DIRECTION)

      return state.set(tableName, update)
    }

    /**-------------------------------------------------------------------------
     * Filter
     * remove the row without substring in the specific columns
     -------------------------------------------------------------------------**/
    case TYPES.RT_FILTER_VALUE: {
      const { tableName, filterRules } = action

      const initFilterRules = fromJS({ column: [], string: '' })

      return state.setIn([tableName, 'tableName'], tableName)
        .setIn([tableName, 'filterRules'], initFilterRules.mergeDeep(filterRules))
    }
    /**-------------------------------------------------------------------------
     * Update
     * dynamic update table data
     -------------------------------------------------------------------------**/
    case TYPES.RT_UPDATE: {
      const { tableName, data } = action

      const rd = resolveData(data)

      return state.setIn([tableName, 'rawData'], rd.get('rawData'))
        .setIn([tableName, 'titles'], rd.get('titles'))
    }
    //-------------------------------------------------------------------------
    default: {
      /**-------------------------------------------------------------------------
       * Listening the async data loading
       -------------------------------------------------------------------------**/
      let updateState = state
      // if state not have any table, exit
      if (!state || !Map.isMap(state) || state.keySeq().size <= 0) {
        return state
      }

      updateState.forEach((table) => {
        const tableAsyncAction = table.get('tableAsyncAction')
        // if current action type is not exist in asyncactions list, exit
        if (!List.isList(tableAsyncAction) || tableAsyncAction.indexOf(action.type) === -1) {
          return updateState
        }
        tableAsyncAction.forEach(
          (asyncAction) => {
            if (asyncAction !== action.type) {
              return updateState
            }
            const tableName = table.get('tableName')
            const dataKey = table.get('dataKey')
            const transformFunc = table.get('transformFunc')
            const { [dataKey]: data } = action
            const rd = resolveData(data, transformFunc)
            updateState = updateState.mergeDeep({
              [tableName]: {
                rawData: rd.get('rawData'),
                titles: rd.get('titles'),
                tableName,
              }
            })
          }
        )
      })
      return updateState
    }
  }
}

//-----------------------------------------------------------------------------
// execute after async or sync load data
// Update below:
// rawData: process after Immutable.fromJS and transformFunc
// select.allColumns: the whole keys of rawData
// select.selectedColumns: the columns we want to show
//    (if action.select.selectedColumns is empty, means show all columns)
// data: using rawData to select columns
//-----------------------------------------------------------------------------
export const resolveData = (rawData = fromJS([]), transformFunc = (rawData) => (rawData)) => {
  Array.isArray(rawData) && (rawData = fromJS(rawData))
  rawData = transformFunc(rawData)

  let titles = fromJS([])
  if (rawData.get(0)) {
    const firstData = rawData.get(0) || fromJS({})
    titles = fromJS([...firstData.keys()])
  }
  return fromJS({
    rawData,
    titles,
  })
}


//-----------------------------------------------------------------------------
export const getCurrentDirection = (previousColumn, currentColumn, previousDirection) => {
  if (previousColumn === currentColumn) {
    if (previousDirection === DIRECTION.ASC) {
      return DIRECTION.DESC
    }
    return DIRECTION.ASC
  }
  return DIRECTION.ASC
}
