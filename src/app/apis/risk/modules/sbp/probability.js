import { postRiskChart } from 'app/apis/risk'
import { BPProb as bpProbProto } from 'common/protos'
import { categoryId, moduleId } from 'containers/Risk/Modules/Sbp/Probability'

export function predict(data) {
  return postRiskChart(categoryId, moduleId, bpProbProto.request.transform(data))
}
