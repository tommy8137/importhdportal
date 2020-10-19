import fetchObject from '../utils/fetch'
import Protos from 'common/protos'
const { EffectiveList: effectiveListProto } = Protos

export function fetchReportList() {
  const url = `/api/${__API_VERSION__}/effective/lists`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: effectiveListProto.response.transform,
    method: 'get',
  }
  return fetchObject(url, options)
}
