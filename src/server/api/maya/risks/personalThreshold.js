import getRawBody from 'raw-body'
import PersonalThresholdModel from 'server/models/maya/risks/personalThresholdModel'
import Protos from 'common/protos'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class PersonalThreshold {

  *setPersonalThreshold() {
    this.models =  this.models || PersonalThresholdModel
    const ctx = this
    const userid = ctx.state.user.id
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const requestBufferData = yield getRawBody(ctx.req)
    const settingResult = Protos.SetPersonalThreshold.request.decode(requestBufferData)
    console.log('settingResult: ', settingResult)
    if (isNaN(settingResult.setting_threshold)) {
      throwApiError('modify setting_threshold column data error', errorCode.REQUEST_FORMAT_ERROR)
    }
    if (!settingResult.r_id) {
      throwApiError('modify r_id column data error', errorCode.REQUEST_FORMAT_ERROR)
    }
    const updateThresholdResult = yield this.models.setPersonalThreshold(settingResult.r_id, settingResult.setting_threshold, userid)
    const settingBuffer = Protos.PersonalThreshold.response.encode(updateThresholdResult).toBuffer()
    ctx.body = settingBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchSysThreshold() {
    this.models =  this.models || PersonalThresholdModel
    const ctx = this
    const rId = ctx.params.r_id.toString()
    const PersonalThreshold = yield this.models.getPersonalThreshold(rId)
    const personalThresholdBuffer = Protos.PersonalThreshold.response.encode(PersonalThreshold).toBuffer()
    ctx.body = personalThresholdBuffer
    ctx.type = 'application/octet-stream'
  }
}
