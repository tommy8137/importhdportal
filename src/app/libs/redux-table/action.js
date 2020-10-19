export const TYPES = {
  RT_CREATE_TABLE: 'RT_CREATE_TABLE',
  RT_ORDER_BY: 'RT_ORDER_BY',
  RT_FILTER_VALUE: 'RT_FILTER_VALUE',
  RT_UPDATE: 'RT_UPDATE',
}

//-------------------------------------------------------------------------
// action creator
//-------------------------------------------------------------------------
export function createTable(tableName, dataFrom) {
  return {
    type: TYPES.RT_CREATE_TABLE,
    tableName,
    dataFrom,
  }
}

export function updateTable(tableName, data) {
  return {
    type: TYPES.RT_UPDATE,
    tableName,
    data,
  }
}

export function orderBy(tableName, orderBy) {
  return {
    type: TYPES.RT_ORDER_BY,
    tableName,
    orderBy,
  }
}

export function filter(tableName, filterRules) {
  return {
    type: TYPES.RT_FILTER_VALUE,
    tableName,
    filterRules,
  }
}
