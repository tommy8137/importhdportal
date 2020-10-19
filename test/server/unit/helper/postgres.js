import R from 'ramda'
import { batchQuery } from 'server/helpers/database/postgres'
import co from 'co'

const batchSize = 100
const expectData = { pno:1 }
describe('[unit] The batchQuery function in the database/helpers/postgres modules', function() {
  // -----------------------------------------------------------------------------
  it('call the batchQuery with list.length is 200 ', async () => {
    const size = 200
    let list = R.range(0, 200)
    let category = await co(batchQuery(function*(list) {
      return { rows:[expectData] }
    }, list, batchSize))

    expect(category.rows.length).toBe(size / batchSize)
    for(let data of category.rows) {
      expect(data).toEqual(expectData)
    }
  })
  // -----------------------------------------------------------------------------
  it('call the batchQuery with empty list', async () => {
    const size = 0
    const batchSize = 100
    let list = []
    let category = await co(batchQuery(function*(list) {
      return { rows:[expectData] }
    }, list, batchSize))

    expect(category.rows.length).toBe(size / batchSize)
  })

  // -----------------------------------------------------------------------------
  it('call the batchQuery with empty data of query', async () => {
    const batchSize = 100
    let list = R.range(0, 200)
    let category = await co(batchQuery(function*(list) {
      return { rows:[] }
    }, list, batchSize))
    expect(category.rows.length).toBe(0)
    expect(category.rows).toEqual([])
  })
})
