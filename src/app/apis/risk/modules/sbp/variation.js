import { categoryId as sbpVariationCId, moduleId as sbpVariationMId } from 'containers/Risk/Modules/Sbp/Range'
import {
  BPVar as bpVarProto,
  // Reminding as remindingProto,
  AlarmList as alarmProto,
  SbpVar as sbpVarProto,
  DartList as dartProto,
  SbpVarDart as sbpVarDartProto,
} from 'common/protos'
import { postRiskChart } from 'app/apis/risk'
import fetchObject from 'app/utils/fetch'

export function sbpPredict(data) {
  return postRiskChart(sbpVariationCId, sbpVariationMId, bpVarProto.request.transform(data))
}

// export function getRemindings(cId, mId, data) {
//   const url = `/api/${__API_VERSION__}/risks/categories/${cId}/modules/${mId}/remindings`
//   const options = {
//     headers: {
//       'Content-Type': 'application/octet-stream',
//     },
//     method: 'post',
//     body: remindingProto.request.transform(data),
//     transform: remindingProto.response.transform,
//   }
//   return fetchObject(url, options)
// }

export function getAlarmPharse(notesformat) {
  const url = `/api/${__API_VERSION__}/alarm/phrase?notesformat=${notesformat}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'get',
    transform: (notesformat !== 'dart') ? alarmProto.response.transform : dartProto.response.transform,
  }
  return fetchObject(url, options)
}

export function setAlarmPharse(data, notesformat) {
  const url = `/api/${__API_VERSION__}/alarm/sbp/status?notesformat=${notesformat}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'put',
    body: (notesformat !== 'dart') ? sbpVarProto.request.transform(data) : sbpVarDartProto.request.transform(data),
    transform: sbpVarProto.response.transform,
  }
  return fetchObject(url, options)
}
