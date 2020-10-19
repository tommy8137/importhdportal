import fetchObject from '../utils/fetch'
import Protos from 'common/protos'
import { Schema, normalize, arrayOf } from 'normalizr'
import moment from 'moment'

const { Result, Item } = Protos
const API_BASE = `/api/${__API_VERSION__}`

// 24. Test Results (proto: Report)
export function apiTestResults(p_id, test_id) {
  const url =
    `${API_BASE}/searches/patients/${p_id}/test_results/${test_id}`
  return fetchObject(url, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    transform: async (response) => {
      const rawData = await Result.response.transform(response)
      const test = new Schema('testResult', { idAttribute: 'tr_id' })
      const results = new Schema('results', { idAttribute: 'ti_id' })
      test.define({
        results: arrayOf(results)
      })
      const normalized = normalize(rawData, {
        test,
        results: arrayOf(results)
      })

      normalized.entities.results = normalized.entities.results || {}
      normalized.result.results = normalized.result.results || []

      return normalized
    },
    method: 'get',
  })
}

// 22. Test Result Item (proto: Item)
export function apiItemsList(
    p_id,
    ti_id,
    end_date = moment().format('YYYY-MM-DD'),
    offset = '0',
    limit = '12',
    start_date = '1970-01-01',
  ) {
  const queryString =
    `${API_BASE}/searches/patients/${p_id}/test_items/${ti_id}?start_date=${start_date}&end_date=${end_date}&offset=${offset}&limit=${limit}`

  return fetchObject(queryString, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    transform: async (response) => {
      const rawData = await Item.response.transform(response)
      const item = new Schema('item', { idAttribute: 'tr_id' })
      const normalized = normalize(rawData, {
        results: arrayOf(item)
      })
      normalized.entities.item = normalized.entities.item || {}
      normalized.result.results = normalized.result.results || []

      return normalized
    },
    method: 'get',
  })
}
