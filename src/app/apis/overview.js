import fetchObject from '../utils/fetch'
import Protos from 'common/protos'

const { Overview: overviewProto, OverviewAbnormal: abnormalListProto, Shift: shiftProto } = Protos

export function apiShifts() {
  return fetchObject(`/api/${__API_VERSION__}/searches/shifts`, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    transform: shiftProto.response.transform,
    method: 'get',
  })
}

export function apiOverview(shift, area) {
  return fetchObject(`/api/${__API_VERSION__}/searches/overviews/${shift}?hemarea=${area}`, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    transform: overviewProto.response.transform,
    method: 'get',
  })
}

export function apiOverviewAbnormalList(shift, c_id, area) {
  return fetchObject(`/api/${__API_VERSION__}/searches/overviews/${shift}/abnormals/${c_id}?hemarea=${area}`, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    transform: abnormalListProto.response.transform,
    method: 'get',
  })
}
