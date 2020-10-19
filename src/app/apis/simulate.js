/**
 * demo 2-7, 模擬page相關的api
 */
import fetchObject from '../utils/fetch'
import Protos from 'common/protos'

const { SimulateActual: actualProto, SimulatePredict: predictProto } = Protos

export function apiActual() {
  return fetchObject('/api/v0/simulate/actual', {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    // transform: actualProto.response.transform,
    transform: (response) => {
      return actualProto.response.transform(response)
        .then(rawData => {
          rawData.rows = rawData.rows.map(row => {
            row.time = row.time.toNumber()
            return row
          })
          return rawData
        })
    },
    method: 'get',
  })
}

export function apiPredict(data) {
  // const data = {
  //   // time:"07:31:00",
  //   age: 18,
  //   uf: 0.48,
  //   conductivity: 13.9,
  //   dia_temp_value: 37,
  //   bd_median: 123,
  //   d_weight_ratio: 0.02299,
  //   dm: 0,
  //   gender: 'F',
  //   // sbp: 136,
  //   temperature: 36.5,
  // }

  const url = '/api/v0/simulate/predict'
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    method: 'post',
    body: predictProto.request.transform(data),
    transform: predictProto.response.transform
  }

  return fetchObject(url, options)
}

export function apiSimulate(data) {
  return apiPredict(data)
}
