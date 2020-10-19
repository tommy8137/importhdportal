import getRawBody from 'raw-body'
import ThresholdSettingModel from 'server/models/maya/admins/thresholdsetting'
import Protos from 'common/protos'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class ThresholdSetting {

  *update() {
    this.models =  this.models || ThresholdSettingModel
    const ctx = this
    const doctorId = ctx.state.user.id
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const requestBufferData = yield getRawBody(ctx.req)
    const settingResult = Protos.ThresholdSetting.request.decode(requestBufferData)
      if (settingResult.status === '0' || settingResult.status === '1') {
        if (settingResult.max_threshold < settingResult.min_threshold || isNaN(settingResult.max_threshold) || isNaN(settingResult.min_threshold)) {
          throwApiError('modify max_threshold, min_threshold column data error', errorCode.REQUEST_FORMAT_ERROR)
        }
        if (settingResult.max_threshold < 0 || settingResult.max_threshold > 998 || settingResult.min_threshold < 0 || settingResult.min_threshold > 998) {
          throwApiError('modify max_threshold column data error', errorCode.REQUEST_FORMAT_ERROR)
        }
        const updateSettingResult = yield this.models.updateThresholdSettings(settingResult.status, settingResult.max_threshold, settingResult.min_threshold, doctorId)
        const settingBuffer = Protos.ThresholdSetting.response.encode({ status: settingResult.status, max_threshold: settingResult.max_threshold, min_threshold: settingResult.min_threshold }).toBuffer()
        ctx.body = settingBuffer
        ctx.type = 'application/octet-stream'
      } else {
        throwApiError('modify status column data error', errorCode.REQUEST_FORMAT_ERROR)
      }
  }

  *fetch() {
    this.models =  this.models || ThresholdSettingModel
    const ctx = this
    const thresholdSetting = yield this.models.getThresholdSettings()
    const settingBuffer = Protos.ThresholdSetting.response.encode(thresholdSetting).toBuffer()
    ctx.body = settingBuffer
    ctx.type = 'application/octet-stream'
  }
}
