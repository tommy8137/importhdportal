import Risks from 'server/models/maya/risks/risks'
import Protos from 'common/protos'
import getRawBody from 'raw-body'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class Categories {

  *fetchCharts() {
    this.models = this.models || Risks
    const ctx = this
    const categoryId = ctx.params.c_id.toString()
    const moduleId = ctx.params.m_id.toString()
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const body = yield getRawBody(ctx.req)
    if(!Buffer.compare(new Buffer(''), body)) {
      throwApiError('prediction input can not be null', errorCode.PREDICT_NULL)
    }
    const predictChart = yield this.models.getCharts(body, categoryId, moduleId)
    ctx.body = predictChart
    ctx.type = 'application/octet-stream'
  }

  *fetchAccess() {
    this.models = this.models || Risks
    const ctx = this
    const categoryId = ctx.params.c_id
    const moduleId = ctx.params.m_id
    const time = ctx.query.time
    const p_id = ctx.query.p_id
    const r_id = ctx.query.r_id
    const access = yield this.models.getAccess(categoryId, moduleId, time, p_id, r_id)

    if(access == true) {
      ctx.status = 204
    }
  }
}
