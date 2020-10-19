import Protos from 'common/protos'
import SbpModel from 'server/models/maya/alarm/sbp'
import getRawBody from 'raw-body'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
export default class Accuracies {

  *updateSbp() {
    this.models = this.models || SbpModel
    const ctx = this
    const notesformat = ctx.query.notesformat
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const requestBufferData = yield getRawBody(ctx.req)
    if(requestBufferData.length === 0) {
      throwApiError('request data should be provided', errorCode.REQUEST_DATA_EMPTY)
    }
    let reqData
    let user_name = ctx.state.user.name
    // let user_name = 'whatever'
    switch (notesformat) {
      case "dart":
        reqData = Protos.SbpVarDart.response.decode(requestBufferData)
        reqData.Create_User = user_name
        break;
      default:
        reqData = Protos.SbpVar.response.decode(requestBufferData)
        reqData.record_user = user_name
        break;
    }
    yield this.models.updateSbpStatus(reqData, notesformat)
    ctx.status = 204
  }
}
