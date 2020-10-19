import { postRiskChart } from 'app/apis/risk'
import { BPEstimation as bpEstimationProto } from 'common/protos'
import { categoryId, moduleId } from 'containers/Risk/Modules/Sbp/Estimation/reducer'

export function predict(data) {
  return postRiskChart(categoryId, moduleId, bpEstimationProto.request.transform(data))
}
