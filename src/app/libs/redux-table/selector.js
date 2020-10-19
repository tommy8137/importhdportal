import { createTable, updateTable, orderBy, selectColumns, filter } from './action'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { fromJS, List } from 'immutable'
import { DIRECTION } from './constant.js'

//-------------------------------------------------------------------------
// selector and connect function, and bind tableName into action creator
//-------------------------------------------------------------------------
export const mapDispatchToProps = (tableName) => (dispatch) => {
  const orderByWithTableName = (orderByConfig) => orderBy(tableName, orderByConfig)
  const selectColumnsWithTableName = (columns) => selectColumns(tableName, columns)
  const filterWithTableName = (filterRules) => filter(tableName, filterRules)

  return {
    actions: bindActionCreators({
      orderBy: orderByWithTableName,
      selectColumns: selectColumnsWithTableName,
      filter: filterWithTableName,
    }, dispatch),
    createTable: bindActionCreators(createTable, dispatch),
    updateTable: bindActionCreators(updateTable, dispatch),
  }
}

const tableSelector = (tableName) => createSelector(
  (state) => (state.table.get(tableName)),
  (tableState) => {
    if (!tableState) {
      return {
        tableName: null,
        orderBy: fromJS([]),
        data: fromJS([]),
        filterRules: fromJS([]),
      }
    }

    const rawData = tableState.get('rawData')
    const filterRules = tableState.get('filterRules')
    const orderBy = tableState.get('orderBy')

    let data = rawData

    if (filterRules) {
      const firstData = data.get(0) || fromJS({})
      let titles = fromJS([...firstData.keys()])
      if (filterRules.get('column') && filterRules.get('column').size > 0) {
        titles = filterRules.get('column')
      }
      // Array.some() will return true if one of the item pass the condition
      data = data.filter(
        (row) => titles.some(
          (title) => (row.get(title).toString().indexOf(filterRules.get('string')) > -1)
        )
      )
    }

    if (orderBy) {
      data = getOrderData(data, orderBy.get('column'), orderBy.get('direction'))
    }

    return {
      tableName: tableState.get('tableName'),
      orderBy: tableState.get('orderBy'),
      filterRules: tableState.get('filterRules'),
      data: data || fromJS([]),
    }
  }
)

export const selector = (tableName, config) => {
  if (config && config.dataFrom && config.dataFrom.selector) {
    return createSelector(
      tableSelector(tableName),
      (config.dataFrom.selector),
      (tableState, configData) => (
        {
          ...tableState,
          configData,
        }
      )
    )
  } else {
    return createSelector(
      tableSelector(tableName),
      (tableState) => ({ ...tableState })
    )
  }
}

//-----------------------------------------------------------------------------
// compare value and change the item order
//-----------------------------------------------------------------------------
export const getOrderData = (unsortingData, column, direction) => {
  if (!List.isList(unsortingData)) {
    return fromJS([])
  }
  if (!unsortingData.get(0)) {
    return fromJS([])
  }
  const firstData = unsortingData.get(0) || fromJS({})
  const allColumns = [...firstData.keys()]
  let strColumn = column

  Array.isArray(column) && column.length > 0 && allColumns.includes(column[0]) && (strColumn = column[0])
  if (!allColumns.includes(strColumn) || typeof strColumn !== 'string') {
    return fromJS(unsortingData)
  }
  return (unsortingData.sort((currentRow, nextRow) => {
    let compareResult
    if (typeof nextRow.get(strColumn) !== 'number') {
      compareResult = currentRow.get(strColumn).localeCompare(nextRow.get(strColumn))
    } else {
      compareResult = currentRow.get(strColumn) - nextRow.get(strColumn)
    }
    if (direction !== DIRECTION.ASC) {
      compareResult = -compareResult
    }
    return compareResult
  }))
}
