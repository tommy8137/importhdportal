import Agree from 'server/models/maya/users/agreements'
import Protos from 'common/protos'
import getRawBody from 'raw-body'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class Agreements {
  *fetch() {
    this.models = this.models || Agree
    const ctx = this
    const doctorId = ctx.state.user.id
    const agreements = yield this.models.getAgreements(doctorId)
    const agreementsBuffer = Protos.Agreement.response.encode(agreements).toBuffer()
    ctx.cookies.set('agreements', agreements.always_show, { signed: false })
    ctx.body = agreementsBuffer
    ctx.type = 'application/octet-stream'
  }

  *update() {
    this.models = this.models || Agree
    const ctx = this
    const doctorId = ctx.state.user.id
    const ct = ctx.request.type
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const body = yield getRawBody(ctx.req)
    const updateAgreements = Protos.Agreement.response.decode(body)
    if (updateAgreements.always_show === 0) {
      throwApiError('modify column can not be null', errorCode.MODIFY_COLUMN_NULL)
    }
    const agreements = yield this.models.updateAgreements(doctorId, updateAgreements)
    const agreementsBuffer = Protos.Agreement.response.encode(agreements).toBuffer()
    ctx.cookies.set('agreements', updateAgreements.always_show, { signed: false })
    ctx.body = agreementsBuffer
    ctx.type = 'application/octet-stream'
  }
}
