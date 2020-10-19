import { TYPES, createTable, updateTable, orderBy, filter } from 'app/libs/redux-table/action'
//-----------------------------------------------------------------------------
// action creators
//-----------------------------------------------------------------------------
it('action creator: createTable', () => {
  const dataFrom = {}
  const actual = createTable('Table1', dataFrom)

  expect(actual.type).toBe(TYPES.RT_CREATE_TABLE)
  expect(actual.tableName).toBe('Table1')
  expect(actual.dataFrom).toEqual({})
})

it('action creator: createTable (empty arguments)', () => {
  const actual = createTable()

  expect(actual.type).toBe(TYPES.RT_CREATE_TABLE)
  expect(actual.tableName).toBe(undefined)
  expect(actual.dataFrom).toBe(undefined)
})

//-----------------------------------------------------------------------------
it('action creator: updateTable', () => {
  const actual = updateTable('Table1', {})

  expect(actual.type).toBe(TYPES.RT_UPDATE)
  expect(actual.tableName).toBe('Table1')
  expect(actual.data).toEqual({})
})

//-----------------------------------------------------------------------------
it('action creator: orderBy', () => {
  const orderByConfigs = {}
  const actual = orderBy('Table1', orderByConfigs)

  expect(actual.type).toBe(TYPES.RT_ORDER_BY)
  expect(actual.tableName).toBe('Table1')
  expect(actual.orderBy).toEqual({})
})

it('action creator: orderBy (empty arguments)', () => {
  const actual = orderBy()

  expect(actual.type).toBe(TYPES.RT_ORDER_BY)
  expect(actual.tableName).toBe(undefined)
  expect(actual.orderBy).toBe(undefined)
})

//-----------------------------------------------------------------------------
it('action creator: filter', () => {
  const actual = filter('Table1', { column: ['name'], string: '大同' })

  expect(actual.type).toBe(TYPES.RT_FILTER_VALUE)
  expect(actual.tableName).toBe('Table1')
  expect(actual.filterRules).toEqual({ column: ['name'], string: '大同' })
})
