import fetchObject from '../utils/fetch'
import Protos from 'common/protos'
import moment from 'moment'
import { normalize, arrayOf } from 'normalizr'
import recordSchema, { itemSchema, preSchema, postSchema, intraSchema } from '../schemas/record-schema'
import dashboardSchema, {
  recordSchema as dRecordSchema,
  testSchema,
  status,
  record as recordField,
  test,
  StatusRecord,
}  from 'app/schemas/dashboard'
import { CategoryItem } from 'app/schemas/risks'
import merge from 'lodash/merge'
import clone from 'lodash/clone'


const {
  Schedule: searchScheduleProto,
  Patient: patientProto,
  RecordList: recordListProto,
  RiskSummary: riskSummaryProto,
  Record: recordProto,
  RecordDart: recordDartProto,
} = Protos

const convert9527ToNull = obj =>
  Object.keys(obj).reduce((reduced, key) => {
    const t = typeof obj[key]
    reduced[key] = key != 'end_time' && (t == 'number' || t == 'string') && obj[key] == -9527
      ? null
      : obj[key]
    return reduced
  }, {})

export function apiSearchSchedule(startDate = TODAY, endDate = TODAY, optional = { }) {
  let queryString = `/api/${__API_VERSION__}/searches/schedules/?start_date=${startDate}&end_date=${endDate}`
  const today = moment().format('YYYY-MM-DD')
  startDate = startDate || today
  endDate = endDate || today

  const { sort, q, offset, limit } = optional
  if (sort) {
    queryString += `&sort=${sort}`
  }

  if (q) {
    queryString += `&q=${q}`
  }

  if ('offset' in optional) {
    queryString += `&offset=${offset}`
  }

  if ('limit' in optional) {
    queryString += `&limit=${limit}`
  }

  return fetchObject(queryString, {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: searchScheduleProto.response.transform,
    method: 'get',
  })
}

export function searchPatient(patientId) {
  const url = `/api/${__API_VERSION__}/searches/patients/${patientId}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: async (res) => {
      const rawData = await patientProto.response.transform(res)
      return rawData
    },
    method: 'get',
  }

  return fetchObject(url, options)
}

export function searchRecordList(patientId) {
  const startDate = moment().subtract(0.5, 'years').format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  const url = `/api/${__API_VERSION__}/searches/patients/${patientId}/records?start_date=${startDate}&end_date=${endDate}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: async (response) => {
      const rawData = await recordListProto.response.transform(response)
      const records = rawData.records.map(r => {
        const date = r.date.substr(0, 10)
        return { ...r, date }
      })
      const normalized = normalize(records, arrayOf(recordSchema))
      return normalized
    },
    method: 'get',
  }

  return fetchObject(url, options)
}


/**
 * same, record is ether date or record_id <= not decided
 * @param  {[type]} record [description]
 * @return {[type]}        [description]
 */
export function getDashboard(patientId, record, notesformat) {
  if (!patientId) {
    throw new Error('patient id should be provided.')
  } else if (!record) {
    throw new Error('record should be provided')
  }

  const url = `/api/${__API_VERSION__}/searches/patients/${patientId}/dashboards/${record}?notesformat=${notesformat}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'get',
    transform: async (response) => {
      const rawData = await Protos.Dashboard.response.transform(response)
      let data = rawData.toRaw()
      data = merge({
        [status]: {
          weight: {
            pre: '--',
            post: '--',
          },
          sbp: {
            pre: '--',
            post: '--',
          },
          dbp: {
            pre: '--',
            post: '--',
          },
          heparin_usage_status: {
            start: '--',
            remain: '--',
            circulation: '--',
          },
        },
        [recordField]: {
          abnormal: [],
          handled: [],
        },
        [test]: {
          abnormal: [],
          critical: [],
        }
      }, data)

      const normalized = {
        [status]: data[status],
        [recordField]: normalize(data[recordField], dRecordSchema),
        [test]: normalize(data[test], testSchema),
      }
      // normalizr still does not solve the problem of empty array
      normalized[recordField].entities.abnormal = normalized[recordField].entities.abnormal || []
      normalized[recordField].entities.handled = normalized[recordField].entities.handled || []
      normalized[test].entities.abnormal = normalized[test].entities.abnormal || []
      normalized[test].entities.critical = normalized[test].entities.critical || []

      return normalized
    },
  }

  return fetchObject(url, options)
}

export function getRiskSummary(patientId, recordId) {
  if (typeof patientId != 'string' || !patientId.trim()) {
    throw new Error('pateint id should be provided to access risks api.')
  } else if (typeof recordId != 'string' || !recordId.trim()) {
    throw new Error('record id should be provided to access risks api.')
  }

  const url = `/api/${__API_VERSION__}/searches/patients/${patientId}/risks/${recordId}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'get',
    transform: async (response) => {
      const resData = await riskSummaryProto.response.transform(response)
      const rawData = resData.toRaw()
      let riskSummary = rawData.risk_summary
      const normalizedSummary = normalize(riskSummary, arrayOf(CategoryItem))
      return normalizedSummary
    },
  }

  return fetchObject(url, options)
}

export function getRecordDetail(patientId, record, isFetchSBPAlarm, notesformat) {
  if (!patientId || !record) {
    throw new Error('patient id and record should be provided')
  }

  let url = `/api/${__API_VERSION__}/searches/patients/${patientId}/records/${record}?notesformat=${notesformat}`

  if (isFetchSBPAlarm) {
    url += '&sbp_alarm=1'
  }

  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'get',
    transform: async (response) => {
      const rawData = (notesformat !== 'dart') ?
        await recordProto.response.transform(response) :
        await recordDartProto.response.transform(response)
      const data = convert9527ToNull(rawData.toRaw(false, true))
      data.start_time = data.start_time || new Date().valueOf()
      data.end_time = (data.end_time && data.end_time != 0)
      ? data.end_time
      : parseInt(data.start_time) + 5 * 60 * 60 * 1000
      let normalized = normalize(data, {
        items: arrayOf(itemSchema),
        panels: {
          pre: arrayOf(preSchema),
          post: arrayOf(postSchema),
          intra: arrayOf(intraSchema),
        },
      })
      normalized.entities.items = normalized.entities.items || {}
      return normalized
    }
  }

  return fetchObject(url, options)
}
